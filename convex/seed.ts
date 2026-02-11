import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  DEFAULT_OPENAI_MODEL,
  DEFAULT_STORY_SLUG,
  DEFAULT_SYSTEM_PROMPT_VERSION,
} from "./engineConstants";
import { act1OptionValidator } from "./validators";

export const upsertStoryConfig = mutation({
  args: {
    storySlug: v.optional(v.string()),
    active: v.optional(v.boolean()),
    provider: v.optional(v.string()),
    model: v.optional(v.string()),
    temperature: v.optional(v.number()),
    maxOutputTokens: v.optional(v.number()),
    choiceCountMin: v.optional(v.number()),
    choiceCountMax: v.optional(v.number()),
    act1EndLegacyId: v.optional(v.number()),
    memoryWindowSize: v.optional(v.number()),
    systemPromptVersion: v.optional(v.string()),
    worldBible: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const storySlug = args.storySlug ?? DEFAULT_STORY_SLUG;
    const existing = await ctx.db
      .query("storyConfigs")
      .withIndex("by_slug", (q) => q.eq("slug", storySlug))
      .collect();

    const activeConfig = existing.find((config) => config.active) ?? existing[0];

    const payload = {
      slug: storySlug,
      active: args.active ?? true,
      provider: args.provider ?? "openai",
      model: args.model ?? DEFAULT_OPENAI_MODEL,
      temperature: args.temperature ?? 0.8,
      maxOutputTokens: args.maxOutputTokens ?? 700,
      choiceCountMin: args.choiceCountMin ?? 2,
      choiceCountMax: args.choiceCountMax ?? 4,
      act1EndLegacyId: args.act1EndLegacyId ?? 66,
      memoryWindowSize: args.memoryWindowSize ?? 12,
      systemPromptVersion:
        args.systemPromptVersion ?? DEFAULT_SYSTEM_PROMPT_VERSION,
      worldBible: args.worldBible,
      updatedAt: now,
    };

    if (activeConfig) {
      await ctx.db.patch(activeConfig._id, payload);
      return activeConfig._id;
    }

    return ctx.db.insert("storyConfigs", {
      ...payload,
      createdAt: now,
    });
  },
});

export const importAct1Nodes = mutation({
  args: {
    storySlug: v.optional(v.string()),
    nodes: v.array(
      v.object({
        legacyId: v.number(),
        title: v.optional(v.string()),
        description: v.string(),
        requirements: v.array(v.string()),
        effects: v.array(v.string()),
        options: v.array(act1OptionValidator),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const storySlug = args.storySlug ?? DEFAULT_STORY_SLUG;

    let inserted = 0;
    let updated = 0;

    for (const node of args.nodes) {
      const existing = await ctx.db
        .query("act1Nodes")
        .withIndex("by_story_legacy", (q) =>
          q.eq("storySlug", storySlug).eq("legacyId", node.legacyId),
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: node.title,
          description: node.description,
          requirements: node.requirements,
          effects: node.effects,
          options: node.options,
          updatedAt: now,
        });
        updated += 1;
      } else {
        await ctx.db.insert("act1Nodes", {
          storySlug,
          legacyId: node.legacyId,
          title: node.title,
          description: node.description,
          requirements: node.requirements,
          effects: node.effects,
          options: node.options,
          createdAt: now,
          updatedAt: now,
        });
        inserted += 1;
      }
    }

    return {
      storySlug,
      totalInput: args.nodes.length,
      inserted,
      updated,
    };
  },
});

export const getAct1ImportStats = query({
  args: {
    storySlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const storySlug = args.storySlug ?? DEFAULT_STORY_SLUG;
    const nodes = await ctx.db
      .query("act1Nodes")
      .withIndex("by_story_legacy", (q) => q.eq("storySlug", storySlug))
      .collect();

    const legacyIds = nodes.map((node) => node.legacyId).sort((a, b) => a - b);
    return {
      storySlug,
      count: nodes.length,
      minLegacyId: legacyIds[0] ?? null,
      maxLegacyId: legacyIds[legacyIds.length - 1] ?? null,
    };
  },
});
