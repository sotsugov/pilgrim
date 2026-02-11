import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const storySlug = process.env.STORY_SLUG ?? "pilgrim";
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const openAiModel = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const raw = await readFile(
  path.join(rootDir, "data", "destinations.json"),
  "utf-8",
);
const destinations = JSON.parse(raw);
const knownLegacyIds = new Set(destinations.map((node) => node.id));

const migratedNodes = destinations.map((node) => ({
  legacyId: node.id,
  title: node.title ?? undefined,
  description: node.description,
  requirements: node.requirements ?? [],
  effects: node.effects ?? [],
  options: (node.options ?? []).map((option) => ({
    text: option.text,
    requirements: option.requirements ?? [],
    effects: option.effects ?? [],
    next: normalizeTransition(option.destination, knownLegacyIds),
  })),
}));

const client = new ConvexHttpClient(convexUrl);

await client.mutation(api.seed.upsertStoryConfig, {
  storySlug,
  provider: "openai",
  model: openAiModel,
  choiceCountMin: 2,
  choiceCountMax: 4,
  act1EndLegacyId: 66,
});

const importResult = await client.mutation(api.seed.importAct1Nodes, {
  storySlug,
  nodes: migratedNodes,
});

const stats = await client.query(api.seed.getAct1ImportStats, { storySlug });

const danglingTargets = new Set();
for (const node of destinations) {
  for (const option of node.options ?? []) {
    if (!knownLegacyIds.has(option.destination)) {
      danglingTargets.add(option.destination);
    }
  }
}

console.log(
  JSON.stringify(
    {
      storySlug,
      importedCount: migratedNodes.length,
      result: importResult,
      stats,
      danglingTargets: Array.from(danglingTargets).sort((a, b) => a - b),
    },
    null,
    2,
  ),
);

function normalizeTransition(destination, knownLegacyIds) {
  if (knownLegacyIds.has(destination)) {
    return { kind: "act1", legacyId: destination };
  }

  if (destination >= 67 && destination <= 100) {
    return {
      kind: "act2Hook",
      hookKey: `legacy_${destination}`,
    };
  }

  if (destination < 0) {
    return {
      kind: "gameOver",
      code: `legacy_${destination}`,
    };
  }

  return {
    kind: "act2Hook",
    hookKey: `legacy_${destination}`,
  };
}
