export type MemoryDelta = {
  facts: string[];
  unresolvedThreads: string[];
  resolvedThreads: string[];
  tone?: string;
  flags: string[];
  summarySnippet?: string;
};

export type GeneratedOption = {
  text: string;
  requirements: string[];
  effects: string[];
};

export type GeneratedScenePayload = {
  title?: string;
  description: string;
  options: GeneratedOption[];
  memoryDelta: MemoryDelta;
};

export type RecentTurn = {
  step: number;
  optionText: string;
  appliedEffects: string[];
};

export type GenerationContext = {
  storySlug: string;
  act: "act2";
  hookKey?: string;
  currentDescription: string;
  selectedOptionText: string;
  selectedOptionEffects: string[];
  sessionEffects: string[];
  rollingSummary: string;
  facts: string[];
  unresolvedThreads: string[];
  resolvedThreads: string[];
  tone?: string;
  flags: string[];
  recentTurns: RecentTurn[];
  choiceCountMin: number;
  choiceCountMax: number;
  systemPromptVersion: string;
  worldBible?: string;
};

export type ProviderConfig = {
  provider: string;
  model: string;
  temperature: number;
  maxOutputTokens: number;
};

export type ProviderGenerationInput = {
  config: ProviderConfig;
  context: GenerationContext;
};

export type ProviderAdapter = {
  generateScene: (
    input: ProviderGenerationInput,
  ) => Promise<GeneratedScenePayload>;
};
