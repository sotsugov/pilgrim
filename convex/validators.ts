import { v } from "convex/values";

export const transitionValidator = v.union(
  v.object({
    kind: v.literal("act1"),
    legacyId: v.number(),
  }),
  v.object({
    kind: v.literal("act2Hook"),
    hookKey: v.string(),
  }),
  v.object({
    kind: v.literal("gameOver"),
    code: v.optional(v.string()),
  }),
);

export const nodeRefValidator = v.union(
  v.object({
    kind: v.literal("act1"),
    legacyId: v.number(),
  }),
  v.object({
    kind: v.literal("act2"),
    generatedNodeId: v.id("generatedNodes"),
  }),
  v.object({
    kind: v.literal("terminal"),
    code: v.string(),
  }),
);

export const act1OptionValidator = v.object({
  text: v.string(),
  requirements: v.array(v.string()),
  effects: v.array(v.string()),
  next: transitionValidator,
});

export const generatedOptionValidator = v.object({
  text: v.string(),
  requirements: v.array(v.string()),
  effects: v.array(v.string()),
});

export const memoryDeltaValidator = v.object({
  facts: v.array(v.string()),
  unresolvedThreads: v.array(v.string()),
  resolvedThreads: v.array(v.string()),
  tone: v.optional(v.string()),
  flags: v.array(v.string()),
  summarySnippet: v.optional(v.string()),
});

export const generatedSceneValidator = v.object({
  title: v.optional(v.string()),
  description: v.string(),
  options: v.array(generatedOptionValidator),
  memoryDelta: memoryDeltaValidator,
});

export const generationStatusValidator = v.union(
  v.literal("success"),
  v.literal("fallback"),
  v.literal("error"),
);

export const generationMetaValidator = v.object({
  provider: v.string(),
  model: v.string(),
  status: generationStatusValidator,
  errorCode: v.optional(v.string()),
  latencyMs: v.number(),
  usedFallback: v.boolean(),
  promptHash: v.string(),
});
