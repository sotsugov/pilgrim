import { openaiProvider } from "./openai";
import { ProviderAdapter, ProviderGenerationInput } from "./types";

const PROVIDER_REGISTRY: Record<string, ProviderAdapter> = {
  openai: openaiProvider,
};

export async function generateSceneWithProvider(
  input: ProviderGenerationInput,
) {
  const adapter = PROVIDER_REGISTRY[input.config.provider];
  if (!adapter) {
    throw new Error(`Unsupported provider: ${input.config.provider}`);
  }
  return adapter.generateScene(input);
}
