import { v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import {
  DEFAULT_OPENAI_MODEL,
  DEFAULT_PREFETCH_OPTIONS,
  DEFAULT_STORY_SLUG,
  DEFAULT_SYSTEM_PROMPT_VERSION,
  GAME_OVER_EFFECT,
  PREFETCH_TTL_MS,
  START_LEGACY_NODE_ID,
} from "./engineConstants";
import {
  applyEffects,
  buildFallbackScene,
  defaultMemoryState,
  hasAnyRequirement,
  isGameOver,
  memoryFromDoc,
  mergeMemory,
  mergeRecentTurnIds,
  ResolvedOption,
  simpleHash,
  terminalScene,
  uniqueStrings,
} from "./engineHelpers";
import { generateSceneWithProvider } from "./providers";
import { generatedSceneValidator, generationMetaValidator } from "./validators";
import { Id } from "./_generated/dataModel";

export const startSession = mutation({
  args: {
    storySlug: v.optional(v.string()),
    playerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const storySlug = args.storySlug ?? DEFAULT_STORY_SLUG;

    let storyConfig = await getStoryConfigBySlug(ctx, storySlug);
    if (!storyConfig) {
      const createdId = await ctx.db.insert("storyConfigs", {
        slug: storySlug,
        active: true,
        provider: "openai",
        model: DEFAULT_OPENAI_MODEL,
        temperature: 0.8,
        maxOutputTokens: 700,
        choiceCountMin: 2,
        choiceCountMax: 4,
        act1EndLegacyId: 66,
        memoryWindowSize: 12,
        systemPromptVersion: DEFAULT_SYSTEM_PROMPT_VERSION,
        createdAt: now,
        updatedAt: now,
      });
      storyConfig = await ctx.db.get(createdId);
    }

    if (!storyConfig) {
      throw new Error("Unable to initialize story configuration");
    }

    const startNode = await getAct1Node(ctx, storySlug, START_LEGACY_NODE_ID);
    if (!startNode) {
      throw new Error(
        "Act I data is missing. Run the destinations migration script first.",
      );
    }

    const sessionId = await ctx.db.insert("sessions", {
      playerId: args.playerId,
      storySlug,
      currentNodeRef: {
        kind: "act1",
        legacyId: START_LEGACY_NODE_ID,
      },
      effects: uniqueStrings(startNode.effects),
      steps: 0,
      status: "active",
      startedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("sessionMemories", {
      sessionId,
      ...defaultMemoryState(),
      updatedAt: now,
    });

    return sessionId;
  },
});

export const getCurrentScene = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      return null;
    }

    const sceneState = await resolveSceneAndOptions(ctx, session);
    const latestGenerationEvent = await loadLatestGenerationEvent(
      ctx,
      session._id,
    );

    return {
      session: {
        sessionId: session._id,
        steps: session.steps,
        effects: session.effects,
        status: session.status,
      },
      scene: {
        ...sceneState.scene,
        options: sceneState.options.map((option) => ({
          text: option.text,
          requirements: option.requirements,
          effects: option.effects,
        })),
      },
      generation:
        latestGenerationEvent === null
          ? null
          : {
              step: latestGenerationEvent.step,
              provider: latestGenerationEvent.provider,
              model: latestGenerationEvent.model,
              status: latestGenerationEvent.status,
              errorCode: latestGenerationEvent.errorCode,
              usedFallback: latestGenerationEvent.usedFallback,
              latencyMs: latestGenerationEvent.latencyMs,
            },
    };
  },
});

export const chooseOption = action({
  args: {
    sessionId: v.id("sessions"),
    optionIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const turnState = await ctx.runQuery(
      internal.engine.getTurnStateForChoiceInternal,
      { sessionId: args.sessionId },
    );

    if (args.optionIndex < 0 || args.optionIndex >= turnState.options.length) {
      throw new Error("Selected option is out of range");
    }

    const selectedOption = turnState.options[args.optionIndex];

    let generatedScene:
      | {
        title?: string;
        description: string;
        options: Array<{
          text: string;
          requirements: string[];
          effects: string[];
        }>;
        memoryDelta: {
          facts: string[];
          unresolvedThreads: string[];
          resolvedThreads: string[];
          tone?: string;
          flags: string[];
          summarySnippet?: string;
        };
      }
      | undefined;
    let generationMeta:
      | {
        provider: string;
        model: string;
        status: "success" | "fallback" | "error";
        errorCode?: string;
        latencyMs: number;
        usedFallback: boolean;
        promptHash: string;
      }
      | undefined;

    const needsGeneration =
      selectedOption.transition.kind === "act2Hook" ||
      selectedOption.transition.kind === "act2Continue";
    const sourceStep = turnState.session.steps;
    const sourceNodeKey = serializeNodeRef(turnState.session.currentNodeRef);

    if (needsGeneration) {
      const hookKey =
        "hookKey" in selectedOption.transition
          ? selectedOption.transition.hookKey
          : undefined;

      const promptHash = simpleHash(
        JSON.stringify({
          storySlug: turnState.session.storySlug,
          step: turnState.session.steps + 1,
          transition: selectedOption.transition,
          currentDescription: turnState.sceneDescription,
          choiceText: selectedOption.text,
          effects: turnState.session.effects,
          memory: turnState.memory,
          recentTurns: turnState.recentTurns,
          config: turnState.storyConfig,
        }),
      );

      const prefetchedGeneration = await ctx.runQuery(
        internal.engine.getPrefetchedGenerationInternal,
        {
          sessionId: args.sessionId,
          sourceStep,
          sourceNodeKey,
          optionIndex: args.optionIndex,
        },
      );

      if (prefetchedGeneration) {
        generatedScene = prefetchedGeneration.generatedScene;
        generationMeta = {
          ...prefetchedGeneration.generationMeta,
          latencyMs: prefetchedGeneration.generationMeta.latencyMs,
        };
        await ctx.runMutation(internal.engine.consumePrefetchedGenerationInternal, {
          prefetchId: prefetchedGeneration._id,
        });
      } else {
        const startedAt = Date.now();
        try {
          generatedScene = await generateSceneWithProvider({
            config: {
              provider: turnState.storyConfig.provider,
              model: turnState.storyConfig.model,
              temperature: turnState.storyConfig.temperature,
              maxOutputTokens: turnState.storyConfig.maxOutputTokens,
            },
            context: {
              storySlug: turnState.session.storySlug,
              act: "act2",
              hookKey,
              currentDescription: turnState.sceneDescription,
              selectedOptionText: selectedOption.text,
              selectedOptionEffects: selectedOption.effects,
              sessionEffects: turnState.session.effects,
              rollingSummary: turnState.memory.rollingSummary,
              facts: turnState.memory.facts,
              unresolvedThreads: turnState.memory.unresolvedThreads,
              resolvedThreads: turnState.memory.resolvedThreads,
              tone: turnState.memory.tone,
              flags: turnState.memory.flags,
              recentTurns: turnState.recentTurns,
              choiceCountMin: turnState.storyConfig.choiceCountMin,
              choiceCountMax: turnState.storyConfig.choiceCountMax,
              systemPromptVersion: turnState.storyConfig.systemPromptVersion,
              worldBible: turnState.storyConfig.worldBible,
            },
          });

          generationMeta = {
            provider: turnState.storyConfig.provider,
            model: turnState.storyConfig.model,
            status: "success",
            latencyMs: Date.now() - startedAt,
            usedFallback: false,
            promptHash,
          };
        } catch (error) {
          generatedScene = buildFallbackScene({
            hookKey,
            selectedOptionText: selectedOption.text,
            step: turnState.session.steps + 1,
          });

          generationMeta = {
            provider: turnState.storyConfig.provider,
            model: turnState.storyConfig.model,
            status: "fallback",
            errorCode: normalizeErrorCode(error),
            latencyMs: Date.now() - startedAt,
            usedFallback: true,
            promptHash,
          };
        }
      }
    }

    await ctx.runMutation(internal.engine.commitTurnInternal, {
      sessionId: args.sessionId,
      optionIndex: args.optionIndex,
      expectedStep: turnState.session.steps,
      generatedScene,
      generationMeta,
    });

    // Warm a small number of next branches asynchronously to reduce the next turn latency.
    await ctx.scheduler.runAfter(0, internal.engine.warmCurrentSceneInternal, {
      sessionId: args.sessionId,
      maxOptions: DEFAULT_PREFETCH_OPTIONS,
    });

    return { ok: true };
  },
});

export const warmCurrentScene = action({
  args: {
    sessionId: v.id("sessions"),
    maxOptions: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return warmCurrentSceneImpl(ctx, args);
  },
});

export const warmCurrentSceneInternal = internalAction({
  args: {
    sessionId: v.id("sessions"),
    maxOptions: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return warmCurrentSceneImpl(ctx, args);
  },
});

export const getTurnStateForChoiceInternal = internalQuery({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const storyConfig = await getStoryConfigBySlug(ctx, session.storySlug);
    if (!storyConfig) {
      throw new Error(`Story config "${session.storySlug}" not found`);
    }

    const memoryDoc = await getSessionMemory(ctx, session._id);
    const memory = memoryFromDoc(memoryDoc);
    const sceneState = await resolveSceneAndOptions(ctx, session);
    const recentTurns = await loadRecentTurns(
      ctx,
      session._id,
      storyConfig.memoryWindowSize,
    );

    return {
      session: {
        _id: session._id,
        storySlug: session.storySlug,
        steps: session.steps,
        effects: session.effects,
        status: session.status,
        currentNodeRef: session.currentNodeRef,
      },
      storyConfig: {
        provider: storyConfig.provider,
        model: storyConfig.model,
        temperature: storyConfig.temperature,
        maxOutputTokens: storyConfig.maxOutputTokens,
        choiceCountMin: storyConfig.choiceCountMin,
        choiceCountMax: storyConfig.choiceCountMax,
        memoryWindowSize: storyConfig.memoryWindowSize,
        systemPromptVersion: storyConfig.systemPromptVersion,
        worldBible: storyConfig.worldBible,
      },
      sceneDescription: sceneState.scene.description,
      options: sceneState.options,
      memory,
      recentTurns,
    };
  },
});

export const getPrefetchedGenerationInternal = internalQuery({
  args: {
    sessionId: v.id("sessions"),
    sourceStep: v.number(),
    sourceNodeKey: v.string(),
    optionIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const rows = await ctx.db
      .query("prefetchedGenerations")
      .withIndex("by_session_source_option", (q) =>
        q
          .eq("sessionId", args.sessionId)
          .eq("sourceStep", args.sourceStep)
          .eq("optionIndex", args.optionIndex),
      )
      .collect();

    const candidate = rows
      .filter(
        (row) =>
          !row.consumedAt &&
          row.expiresAt > now &&
          row.sourceNodeKey === args.sourceNodeKey,
      )
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    return candidate ?? null;
  },
});

export const storePrefetchedGenerationInternal = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    sourceStep: v.number(),
    sourceNodeKey: v.string(),
    optionIndex: v.number(),
    generatedScene: generatedSceneValidator,
    generationMeta: generationMetaValidator,
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existingRows = await ctx.db
      .query("prefetchedGenerations")
      .withIndex("by_session_source_option", (q) =>
        q
          .eq("sessionId", args.sessionId)
          .eq("sourceStep", args.sourceStep)
          .eq("optionIndex", args.optionIndex),
      )
      .collect();

    for (const row of existingRows) {
      await ctx.db.delete(row._id);
    }

    return ctx.db.insert("prefetchedGenerations", {
      sessionId: args.sessionId,
      sourceStep: args.sourceStep,
      sourceNodeKey: args.sourceNodeKey,
      optionIndex: args.optionIndex,
      generatedScene: args.generatedScene,
      generationMeta: args.generationMeta,
      createdAt: now,
      expiresAt: now + PREFETCH_TTL_MS,
    });
  },
});

export const consumePrefetchedGenerationInternal = internalMutation({
  args: {
    prefetchId: v.id("prefetchedGenerations"),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.prefetchId);
    if (!row || row.consumedAt) {
      return null;
    }

    await ctx.db.patch(args.prefetchId, {
      consumedAt: Date.now(),
    });
    return args.prefetchId;
  },
});

export const commitTurnInternal = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    optionIndex: v.number(),
    expectedStep: v.number(),
    generatedScene: v.optional(generatedSceneValidator),
    generationMeta: v.optional(generationMetaValidator),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.steps !== args.expectedStep) {
      throw new Error("Session has changed. Please retry the action.");
    }

    const storyConfig = await getStoryConfigBySlug(ctx, session.storySlug);
    if (!storyConfig) {
      throw new Error(`Story config "${session.storySlug}" not found`);
    }

    const sceneState = await resolveSceneAndOptions(ctx, session);
    const selectedOption = sceneState.options[args.optionIndex];
    if (!selectedOption) {
      throw new Error("Selected option is not available");
    }

    const now = Date.now();
    const sourceNodeRef = session.currentNodeRef;
    const nextStep = session.steps + 1;

    let nextNodeRef = sourceNodeRef;
    let transitionEffects = [...selectedOption.effects];
    let memoryDelta = args.generatedScene?.memoryDelta;
    let status: "active" | "terminal" = "active";

    if (selectedOption.effects.includes("RESET")) {
      const startNode = await getAct1Node(
        ctx,
        session.storySlug,
        START_LEGACY_NODE_ID,
      );
      if (!startNode) {
        throw new Error("Missing Act I start node");
      }

      await ctx.db.patch(session._id, {
        currentNodeRef: {
          kind: "act1",
          legacyId: START_LEGACY_NODE_ID,
        },
        effects: uniqueStrings(startNode.effects),
        steps: 0,
        status: "active",
        updatedAt: now,
      });

      const memoryDoc = await getSessionMemory(ctx, session._id);
      if (memoryDoc) {
        await ctx.db.patch(memoryDoc._id, {
          ...defaultMemoryState(),
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("sessionMemories", {
          sessionId: session._id,
          ...defaultMemoryState(),
          updatedAt: now,
        });
      }

      return { ok: true, reset: true };
    }

    if (selectedOption.transition.kind === "act1") {
      const act1Node = await getAct1Node(
        ctx,
        session.storySlug,
        selectedOption.transition.legacyId,
      );
      if (!act1Node) {
        throw new Error(
          `Act I node ${selectedOption.transition.legacyId} could not be found`,
        );
      }

      transitionEffects = [...transitionEffects, ...act1Node.effects];
      nextNodeRef = {
        kind: "act1",
        legacyId: selectedOption.transition.legacyId,
      };
    } else if (
      selectedOption.transition.kind === "act2Hook" ||
      selectedOption.transition.kind === "act2Continue"
    ) {
      if (!args.generatedScene || !args.generationMeta) {
        throw new Error(
          "Generated scene payload is required for Act II transitions",
        );
      }

      const optionCount = args.generatedScene.options.length;
      if (
        optionCount < storyConfig.choiceCountMin ||
        optionCount > storyConfig.choiceCountMax
      ) {
        throw new Error(
          `Generated scene has ${optionCount} options, expected ${storyConfig.choiceCountMin}-${storyConfig.choiceCountMax}`,
        );
      }

      const generatedNodeId = await ctx.db.insert("generatedNodes", {
        sessionId: session._id,
        sequence: nextStep,
        title: args.generatedScene.title,
        description: args.generatedScene.description,
        options: args.generatedScene.options,
        memoryDelta: args.generatedScene.memoryDelta,
        provider: args.generationMeta.provider,
        model: args.generationMeta.model,
        promptHash: args.generationMeta.promptHash,
        originHookKey:
          selectedOption.transition.kind === "act2Hook"
            ? selectedOption.transition.hookKey
            : selectedOption.transition.hookKey,
        createdAt: now,
      });

      nextNodeRef = {
        kind: "act2",
        generatedNodeId,
      };

      await ctx.db.insert("generationEvents", {
        sessionId: session._id,
        step: nextStep,
        provider: args.generationMeta.provider,
        model: args.generationMeta.model,
        status: args.generationMeta.status,
        errorCode: args.generationMeta.errorCode,
        latencyMs: args.generationMeta.latencyMs,
        usedFallback: args.generationMeta.usedFallback,
        promptHash: args.generationMeta.promptHash,
        createdAt: now,
      });
    } else if (selectedOption.transition.kind === "gameOver") {
      status = "terminal";
      nextNodeRef = {
        kind: "terminal",
        code: selectedOption.transition.code ?? "GAME_OVER",
      };
    }

    const mergedEffects = applyEffects(session.effects, transitionEffects);
    if (
      selectedOption.transition.kind !== "gameOver" &&
      isGameOver(mergedEffects)
    ) {
      status = "terminal";
      nextNodeRef = {
        kind: "terminal",
        code: "GAME_OVER",
      };
    }

    await ctx.db.patch(session._id, {
      currentNodeRef: nextNodeRef,
      effects: mergedEffects,
      steps: nextStep,
      status,
      updatedAt: now,
    });

    const choiceId = await ctx.db.insert("sessionChoices", {
      sessionId: session._id,
      step: nextStep,
      sourceNodeRef,
      optionIndex: args.optionIndex,
      optionText: selectedOption.text,
      appliedEffects: transitionEffects,
      resultNodeRef: nextNodeRef,
      createdAt: now,
    });

    const memoryDoc = await getSessionMemory(ctx, session._id);
    const baseMemory = memoryFromDoc(memoryDoc);
    const mergedMemory = mergeMemory(baseMemory, {
      choiceText: selectedOption.text,
      appliedEffects: transitionEffects,
      memoryDelta,
      memoryWindowSize: storyConfig.memoryWindowSize,
    });
    const recentTurnIds = mergeRecentTurnIds(
      mergedMemory.recentTurnIds,
      choiceId,
      storyConfig.memoryWindowSize,
    );

    if (memoryDoc) {
      await ctx.db.patch(memoryDoc._id, {
        rollingSummary: mergedMemory.rollingSummary,
        facts: mergedMemory.facts,
        unresolvedThreads: mergedMemory.unresolvedThreads,
        resolvedThreads: mergedMemory.resolvedThreads,
        tone: mergedMemory.tone,
        flags: mergedMemory.flags,
        recentTurnIds,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("sessionMemories", {
        sessionId: session._id,
        rollingSummary: mergedMemory.rollingSummary,
        facts: mergedMemory.facts,
        unresolvedThreads: mergedMemory.unresolvedThreads,
        resolvedThreads: mergedMemory.resolvedThreads,
        tone: mergedMemory.tone,
        flags: mergedMemory.flags,
        recentTurnIds,
        updatedAt: now,
      });
    }

    return { ok: true };
  },
});

async function warmCurrentSceneImpl(
  ctx: any,
  args: { sessionId: Id<"sessions">; maxOptions?: number },
) {
  const turnState = await ctx.runQuery(
    internal.engine.getTurnStateForChoiceInternal,
    { sessionId: args.sessionId },
  );

  if (turnState.session.status !== "active") {
    return { warmed: 0, skipped: 0, failed: 0 };
  }

  const sourceStep = turnState.session.steps;
  const sourceNodeKey = serializeNodeRef(turnState.session.currentNodeRef);
  const maxOptions = Math.max(
    1,
    Math.min(args.maxOptions ?? DEFAULT_PREFETCH_OPTIONS, 4),
  );

  const generationCandidates = turnState.options
    .map((option: ResolvedOption, optionIndex: number) => ({
      option,
      optionIndex,
    }))
    .filter(
      ({ option }: { option: ResolvedOption }) =>
        option.transition.kind === "act2Hook" ||
        option.transition.kind === "act2Continue",
    )
    .slice(0, maxOptions);

  let warmed = 0;
  let skipped = 0;
  let failed = 0;

  for (const { option, optionIndex } of generationCandidates) {
    const existingPrefetch = await ctx.runQuery(
      internal.engine.getPrefetchedGenerationInternal,
      {
        sessionId: args.sessionId,
        sourceStep,
        sourceNodeKey,
        optionIndex,
      },
    );

    if (existingPrefetch) {
      skipped += 1;
      continue;
    }

    const hookKey =
      "hookKey" in option.transition ? option.transition.hookKey : undefined;
    const promptHash = simpleHash(
      JSON.stringify({
        prefetch: true,
        storySlug: turnState.session.storySlug,
        step: sourceStep + 1,
        sourceNodeKey,
        optionIndex,
        currentDescription: turnState.sceneDescription,
        choiceText: option.text,
        effects: turnState.session.effects,
        memory: turnState.memory,
        recentTurns: turnState.recentTurns,
        config: turnState.storyConfig,
      }),
    );

    const startedAt = Date.now();
    try {
      const generatedScene = await generateSceneWithProvider({
        config: {
          provider: turnState.storyConfig.provider,
          model: turnState.storyConfig.model,
          temperature: turnState.storyConfig.temperature,
          maxOutputTokens: turnState.storyConfig.maxOutputTokens,
        },
        context: {
          storySlug: turnState.session.storySlug,
          act: "act2",
          hookKey,
          currentDescription: turnState.sceneDescription,
          selectedOptionText: option.text,
          selectedOptionEffects: option.effects,
          sessionEffects: turnState.session.effects,
          rollingSummary: turnState.memory.rollingSummary,
          facts: turnState.memory.facts,
          unresolvedThreads: turnState.memory.unresolvedThreads,
          resolvedThreads: turnState.memory.resolvedThreads,
          tone: turnState.memory.tone,
          flags: turnState.memory.flags,
          recentTurns: turnState.recentTurns,
          choiceCountMin: turnState.storyConfig.choiceCountMin,
          choiceCountMax: turnState.storyConfig.choiceCountMax,
          systemPromptVersion: turnState.storyConfig.systemPromptVersion,
          worldBible: turnState.storyConfig.worldBible,
        },
      });

      await ctx.runMutation(internal.engine.storePrefetchedGenerationInternal, {
        sessionId: args.sessionId,
        sourceStep,
        sourceNodeKey,
        optionIndex,
        generatedScene,
        generationMeta: {
          provider: turnState.storyConfig.provider,
          model: turnState.storyConfig.model,
          status: "success",
          latencyMs: Date.now() - startedAt,
          usedFallback: false,
          promptHash,
        },
      });
      warmed += 1;
    } catch {
      failed += 1;
    }
  }

  return { warmed, skipped, failed };
}

async function resolveSceneAndOptions(ctx: any, session: any) {
  if (session.status === "terminal") {
    const code =
      session.currentNodeRef.kind === "terminal"
        ? session.currentNodeRef.code
        : "GAME_OVER";
    const terminal = terminalScene(code);
    const options: ResolvedOption[] = terminal.options.map((option) => ({
      text: option.text,
      requirements: option.requirements,
      effects: option.effects,
      transition: {
        kind: "act1",
        legacyId: START_LEGACY_NODE_ID,
      },
    }));

    return {
      scene: {
        kind: terminal.kind,
        act: "terminal" as const,
        code: terminal.code,
        title: terminal.title,
        description: terminal.description,
      },
      options,
    };
  }

  if (session.currentNodeRef.kind === "act1") {
    const act1Node = await getAct1Node(
      ctx,
      session.storySlug,
      session.currentNodeRef.legacyId,
    );
    if (!act1Node) {
      throw new Error(
        `Act I node ${session.currentNodeRef.legacyId} was not found in Convex`,
      );
    }

    const allOptions: ResolvedOption[] = (act1Node.options as Array<{
      text: string;
      requirements: string[];
      effects: string[];
      next: ResolvedOption["transition"];
    }>).map((option) => ({
        text: option.text,
        requirements: option.requirements,
        effects: option.effects,
        transition: option.next,
      }));
    const options = ensureAtLeastOneAvailableOption(
      allOptions,
      session.effects,
      {
        text: "Push forward despite missing context",
        requirements: [],
        effects: [],
        transition: allOptions[0]?.transition ?? {
          kind: "act1",
          legacyId: START_LEGACY_NODE_ID,
        },
      },
    );

    return {
      scene: {
        kind: "act1" as const,
        act: "act1" as const,
        legacyId: act1Node.legacyId,
        title: act1Node.title,
        description: act1Node.description,
      },
      options,
    };
  }

  if (session.currentNodeRef.kind === "act2") {
    const generatedNode = await ctx.db.get(session.currentNodeRef.generatedNodeId);
    if (!generatedNode) {
      throw new Error(
        `Generated node ${session.currentNodeRef.generatedNodeId} was not found`,
      );
    }

    const allOptions: ResolvedOption[] = (generatedNode.options as Array<{
      text: string;
      requirements: string[];
      effects: string[];
    }>).map((option) => ({
        text: option.text,
        requirements: option.requirements,
        effects: option.effects,
        transition: {
          kind: "act2Continue",
          hookKey: generatedNode.originHookKey,
        },
      }));
    const options = ensureAtLeastOneAvailableOption(
      allOptions,
      session.effects,
      {
        text: "Advance through the noise and improvise",
        requirements: [],
        effects: [],
        transition: {
          kind: "act2Continue",
          hookKey: generatedNode.originHookKey,
        },
      },
    );

    return {
      scene: {
        kind: "act2" as const,
        act: "act2" as const,
        generatedNodeId: generatedNode._id,
        title: generatedNode.title,
        description: generatedNode.description,
      },
      options,
    };
  }

  throw new Error("Unsupported node reference kind");
}

async function getStoryConfigBySlug(ctx: any, storySlug: string) {
  const rows = await ctx.db
    .query("storyConfigs")
    .withIndex("by_slug", (q: any) => q.eq("slug", storySlug))
    .collect();

  if (rows.length === 0) {
    return null;
  }

  return rows.find((row: any) => row.active) ?? rows[0];
}

async function getAct1Node(ctx: any, storySlug: string, legacyId: number) {
  return ctx.db
    .query("act1Nodes")
    .withIndex("by_story_legacy", (q: any) =>
      q.eq("storySlug", storySlug).eq("legacyId", legacyId),
    )
    .unique();
}

async function getSessionMemory(ctx: any, sessionId: Id<"sessions">) {
  return ctx.db
    .query("sessionMemories")
    .withIndex("by_session", (q: any) => q.eq("sessionId", sessionId))
    .unique();
}

async function loadRecentTurns(
  ctx: any,
  sessionId: Id<"sessions">,
  windowSize: number,
) {
  const rows = await ctx.db
    .query("sessionChoices")
    .withIndex("by_session_step", (q: any) => q.eq("sessionId", sessionId))
    .order("desc")
    .take(Math.max(1, windowSize));

  return rows
    .reverse()
    .map((row: any) => ({
      step: row.step,
      optionText: row.optionText,
      appliedEffects: row.appliedEffects,
    }));
}

async function loadLatestGenerationEvent(ctx: any, sessionId: Id<"sessions">) {
  const rows = await ctx.db
    .query("generationEvents")
    .withIndex("by_session", (q: any) => q.eq("sessionId", sessionId))
    .order("desc")
    .take(1);

  return rows[0] ?? null;
}

function serializeNodeRef(nodeRef: {
  kind: "act1" | "act2" | "terminal";
  legacyId?: number;
  generatedNodeId?: Id<"generatedNodes">;
  code?: string;
}) {
  if (nodeRef.kind === "act1") {
    return `act1:${nodeRef.legacyId}`;
  }
  if (nodeRef.kind === "act2") {
    return `act2:${nodeRef.generatedNodeId}`;
  }
  return `terminal:${nodeRef.code}`;
}

function ensureAtLeastOneAvailableOption(
  options: ResolvedOption[],
  currentEffects: string[],
  fallbackOption: ResolvedOption,
) {
  const available = options.filter((option) =>
    hasAnyRequirement(option.requirements, currentEffects),
  );
  if (available.length > 0) {
    return available;
  }

  if (options.length > 0) {
    // Force-unlock the least-restricted generated/authored option so the
    // player can always proceed.
    let bestIndex = 0;
    for (let index = 1; index < options.length; index += 1) {
      if (options[index].requirements.length < options[bestIndex].requirements.length) {
        bestIndex = index;
      }
    }
    return [
      {
        ...options[bestIndex],
        requirements: [],
      },
    ];
  }

  return [fallbackOption];
}

function normalizeErrorCode(error: unknown) {
  if (error instanceof Error) {
    return error.message.slice(0, 400);
  }
  if (typeof error === "string") {
    return error.slice(0, 400);
  }
  return "unknown_error";
}
