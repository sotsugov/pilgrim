import { Id } from "./_generated/dataModel";
import { Doc } from "./_generated/dataModel";
import {
  GAME_OVER_EFFECT,
  RESET_EFFECT,
  START_LEGACY_NODE_ID,
} from "./engineConstants";
import { GeneratedScenePayload } from "./providers/types";

export type Act1Transition =
  | { kind: "act1"; legacyId: number }
  | { kind: "act2Hook"; hookKey: string }
  | { kind: "gameOver"; code?: string };

export type ResolvedOption = {
  text: string;
  requirements: string[];
  effects: string[];
  transition: Act1Transition | { kind: "act2Continue"; hookKey?: string };
};

export type TerminalScene = {
  kind: "terminal";
  code: string;
  title: string;
  description: string;
  options: Array<{ text: string; requirements: string[]; effects: string[] }>;
};

export function hasAnyRequirement(
  requirements: string[],
  effects: string[],
): boolean {
  return requirements.length === 0 || requirements.some((req) => effects.includes(req));
}

export function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function applyEffects(currentEffects: string[], appliedEffects: string[]) {
  if (appliedEffects.includes(RESET_EFFECT)) {
    return [];
  }
  return uniqueStrings([...currentEffects, ...appliedEffects]);
}

export function isGameOver(effects: string[], explicitGameOver = false): boolean {
  return explicitGameOver || effects.includes(GAME_OVER_EFFECT);
}

export function defaultMemoryState() {
  return {
    rollingSummary: "",
    facts: [] as string[],
    unresolvedThreads: [] as string[],
    resolvedThreads: [] as string[],
    tone: undefined as string | undefined,
    flags: [] as string[],
    recentTurnIds: [] as Id<"sessionChoices">[],
  };
}

export function memoryFromDoc(doc: Doc<"sessionMemories"> | null) {
  if (!doc) {
    return defaultMemoryState();
  }
  return {
    rollingSummary: doc.rollingSummary,
    facts: doc.facts,
    unresolvedThreads: doc.unresolvedThreads,
    resolvedThreads: doc.resolvedThreads,
    tone: doc.tone,
    flags: doc.flags,
    recentTurnIds: doc.recentTurnIds,
  };
}

export function mergeMemory(
  current: ReturnType<typeof defaultMemoryState>,
  args: {
    choiceText: string;
    appliedEffects: string[];
    memoryDelta?: GeneratedScenePayload["memoryDelta"];
    memoryWindowSize: number;
  },
) {
  const memoryDelta = args.memoryDelta ?? {
    facts: [],
    unresolvedThreads: [],
    resolvedThreads: [],
    flags: [],
  };

  const summaryLine =
    memoryDelta.summarySnippet ??
    `Choice: ${args.choiceText}. Effects: ${
      args.appliedEffects.length > 0 ? args.appliedEffects.join(", ") : "none"
    }.`;

  return {
    rollingSummary: mergeSummary(current.rollingSummary, summaryLine),
    facts: uniqueStrings([
      ...current.facts,
      ...memoryDelta.facts,
      ...args.appliedEffects.map((effect) => `effect:${effect}`),
    ]).slice(-80),
    unresolvedThreads: uniqueStrings([
      ...current.unresolvedThreads,
      ...memoryDelta.unresolvedThreads,
    ]).slice(-40),
    resolvedThreads: uniqueStrings([
      ...current.resolvedThreads,
      ...memoryDelta.resolvedThreads,
    ]).slice(-40),
    tone: memoryDelta.tone ?? current.tone,
    flags: uniqueStrings([...current.flags, ...memoryDelta.flags]).slice(-40),
    recentTurnIds: current.recentTurnIds.slice(-args.memoryWindowSize),
  };
}

export function mergeRecentTurnIds(
  recentTurnIds: Id<"sessionChoices">[],
  newTurnId: Id<"sessionChoices">,
  memoryWindowSize: number,
) {
  return [...recentTurnIds, newTurnId].slice(-memoryWindowSize);
}

export function mergeSummary(existingSummary: string, line: string) {
  const trimmedLine = line.trim();
  if (!trimmedLine) {
    return existingSummary;
  }
  const next = existingSummary ? `${existingSummary}\n${trimmedLine}` : trimmedLine;
  return next.slice(-4000);
}

export function simpleHash(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function buildFallbackScene(args: {
  hookKey?: string;
  selectedOptionText: string;
  step: number;
}): GeneratedScenePayload {
  const hook = args.hookKey ? ` (${args.hookKey})` : "";
  const selected = args.selectedOptionText.trim();
  const stepTag = `step ${args.step}`;

  const primaryChoiceText =
    args.step % 2 === 0
      ? "Re-route through maintenance shafts and trust your instincts"
      : "Trace the distortion source before committing to a direction";
  const secondaryChoiceText =
    args.step % 2 === 0
      ? "Anchor yourself with sensory checks and proceed carefully"
      : "Leverage your recovered patterns to force a coherent route";

  return {
    title: "Signal Distortion",
    description: `A burst of static tears across your perception${hook}. At ${stepTag}, the facility's lights pulse in impossible rhythms while the consequences of "${selected}" reverberate through the corridors. You force your breathing into rhythm and pick a direction through the noise.`,
    options: [
      {
        text: primaryChoiceText,
        requirements: [],
        effects: [],
      },
      {
        text: secondaryChoiceText,
        requirements: [],
        effects: ["ANALYTICAL", "CURIOUS"],
      },
    ],
    memoryDelta: {
      facts: [`fallback_step_${args.step}`],
      unresolvedThreads: ["signal_distortion"],
      resolvedThreads: [],
      flags: ["GENERATION_FALLBACK"],
      summarySnippet: `A signal distortion interrupted generation after: ${args.selectedOptionText}.`,
    },
  };
}

export function terminalScene(code: string): TerminalScene {
  if (code === "GAME_OVER") {
    return {
      kind: "terminal",
      code,
      title: "The Void",
      description:
        "Our inevitable end is not tragic; it is the merciful curtain fall on a grotesque performance none of us volunteered to give.",
      options: [
        {
          text: "Begin anew",
          requirements: [],
          effects: [RESET_EFFECT],
        },
      ],
    };
  }

  return {
    kind: "terminal",
    code,
    title: "End of Sequence",
    description:
      "The thread of this run has reached a terminal state. What remains is what you carry into the next attempt.",
    options: [
      {
        text: "Begin anew",
        requirements: [],
        effects: [RESET_EFFECT],
      },
    ],
  };
}

export function isStartNode(ref: { kind: string; legacyId?: number }) {
  return ref.kind === "act1" && ref.legacyId === START_LEGACY_NODE_ID;
}
