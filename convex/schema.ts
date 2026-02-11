import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  act1OptionValidator,
  generatedSceneValidator,
  generatedOptionValidator,
  generationMetaValidator,
  generationStatusValidator,
  memoryDeltaValidator,
  nodeRefValidator,
} from "./validators";

export default defineSchema({
  storyConfigs: defineTable({
    slug: v.string(),
    active: v.boolean(),
    provider: v.string(),
    model: v.string(),
    temperature: v.number(),
    maxOutputTokens: v.number(),
    choiceCountMin: v.number(),
    choiceCountMax: v.number(),
    act1EndLegacyId: v.number(),
    memoryWindowSize: v.number(),
    systemPromptVersion: v.string(),
    worldBible: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["active"]),

  act1Nodes: defineTable({
    storySlug: v.string(),
    legacyId: v.number(),
    title: v.optional(v.string()),
    description: v.string(),
    requirements: v.array(v.string()),
    effects: v.array(v.string()),
    options: v.array(act1OptionValidator),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_legacyId", ["legacyId"])
    .index("by_story_legacy", ["storySlug", "legacyId"]),

  sessions: defineTable({
    playerId: v.optional(v.string()),
    storySlug: v.string(),
    currentNodeRef: nodeRefValidator,
    effects: v.array(v.string()),
    steps: v.number(),
    status: v.union(v.literal("active"), v.literal("terminal")),
    startedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_storySlug", ["storySlug"])
    .index("by_playerId", ["playerId"]),

  sessionChoices: defineTable({
    sessionId: v.id("sessions"),
    step: v.number(),
    sourceNodeRef: nodeRefValidator,
    optionIndex: v.number(),
    optionText: v.string(),
    appliedEffects: v.array(v.string()),
    resultNodeRef: nodeRefValidator,
    createdAt: v.number(),
  })
    .index("by_session_step", ["sessionId", "step"])
    .index("by_session", ["sessionId"]),

  generatedNodes: defineTable({
    sessionId: v.id("sessions"),
    sequence: v.number(),
    title: v.optional(v.string()),
    description: v.string(),
    options: v.array(generatedOptionValidator),
    memoryDelta: memoryDeltaValidator,
    provider: v.string(),
    model: v.string(),
    promptHash: v.string(),
    originHookKey: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_session_sequence", ["sessionId", "sequence"])
    .index("by_session", ["sessionId"]),

  sessionMemories: defineTable({
    sessionId: v.id("sessions"),
    rollingSummary: v.string(),
    facts: v.array(v.string()),
    unresolvedThreads: v.array(v.string()),
    resolvedThreads: v.array(v.string()),
    tone: v.optional(v.string()),
    flags: v.array(v.string()),
    recentTurnIds: v.array(v.id("sessionChoices")),
    updatedAt: v.number(),
  }).index("by_session", ["sessionId"]),

  generationEvents: defineTable({
    sessionId: v.id("sessions"),
    step: v.number(),
    provider: v.string(),
    model: v.string(),
    status: generationStatusValidator,
    errorCode: v.optional(v.string()),
    latencyMs: v.number(),
    usedFallback: v.boolean(),
    promptHash: v.string(),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_status", ["status"]),

  prefetchedGenerations: defineTable({
    sessionId: v.id("sessions"),
    sourceStep: v.number(),
    sourceNodeKey: v.string(),
    optionIndex: v.number(),
    generatedScene: generatedSceneValidator,
    generationMeta: generationMetaValidator,
    createdAt: v.number(),
    expiresAt: v.number(),
    consumedAt: v.optional(v.number()),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_source_option", ["sessionId", "sourceStep", "optionIndex"])
    .index("by_session_step", ["sessionId", "sourceStep"]),
});
