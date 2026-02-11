import {
  GeneratedScenePayload,
  ProviderAdapter,
  ProviderGenerationInput,
} from "./types";

const OPENAI_CHAT_COMPLETIONS_URL =
  "https://api.openai.com/v1/chat/completions";
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

export const openaiProvider: ProviderAdapter = {
  async generateScene(input) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const systemPrompt = buildSystemPrompt(input);
    const userPrompt = buildUserPrompt(input);
    const content = await requestOpenAiJsonContent({
      apiKey,
      model: input.config.model,
      temperature: input.config.temperature,
      maxOutputTokens: input.config.maxOutputTokens,
      systemPrompt,
      userPrompt,
    });
    const parsed = parseJsonLenient(content);

    return normalizeGeneratedScene(
      parsed,
      input.context.choiceCountMin,
      input.context.choiceCountMax,
    );
  },
};

function buildSystemPrompt(input: ProviderGenerationInput) {
  return [
    "You are writing a narrative scene for a futuristic dystopian psychological thriller CYOA game.",
    "Themes: identity fracture, manipulated memory, existential mystery, experimental technology.",
    "Return ONLY valid JSON and no extra text.",
    `Output schema: {"title"?:string,"description":string,"options":[{"text":string,"requirements":string[],"effects":string[]}],"memoryDelta":{"facts":string[],"unresolvedThreads":string[],"resolvedThreads":string[],"tone"?:string,"flags":string[],"summarySnippet"?:string}}`,
    `Number of options must be between ${input.context.choiceCountMin} and ${input.context.choiceCountMax}.`,
    "Keep scene grounded in the same world state and continuity.",
    "Options should be meaningfully distinct and psychologically charged.",
    "requirements and effects values should be concise uppercase tokens when used.",
  ].join("\n");
}

function buildUserPrompt(input: ProviderGenerationInput) {
  return JSON.stringify(
    {
      systemPromptVersion: input.context.systemPromptVersion,
      storySlug: input.context.storySlug,
      act: input.context.act,
      hookKey: input.context.hookKey ?? null,
      currentDescription: input.context.currentDescription,
      selectedOptionText: input.context.selectedOptionText,
      selectedOptionEffects: input.context.selectedOptionEffects,
      sessionEffects: input.context.sessionEffects,
      memory: {
        rollingSummary: input.context.rollingSummary,
        facts: input.context.facts,
        unresolvedThreads: input.context.unresolvedThreads,
        resolvedThreads: input.context.resolvedThreads,
        tone: input.context.tone ?? null,
        flags: input.context.flags,
        recentTurns: input.context.recentTurns,
      },
      worldBible: input.context.worldBible ?? null,
      constraints: {
        optionCountMin: input.context.choiceCountMin,
        optionCountMax: input.context.choiceCountMax,
      },
    },
    null,
    2,
  );
}

async function requestOpenAiJsonContent(args: {
  apiKey: string;
  model: string;
  temperature: number;
  maxOutputTokens: number;
  systemPrompt: string;
  userPrompt: string;
}) {
  const normalizedArgs = {
    ...args,
    maxOutputTokens: isGpt5Model(args.model)
      ? Math.max(args.maxOutputTokens, 1800)
      : args.maxOutputTokens,
  };

  if (isGpt5Model(args.model)) {
    const responsesResult = await requestViaResponsesApi(normalizedArgs).catch(
      (error) => (error instanceof Error ? error : new Error(String(error))),
    );
    if (!(responsesResult instanceof Error)) {
      return responsesResult;
    }

    const chatResult = await requestViaChatCompletions(normalizedArgs).catch(
      (error) => (error instanceof Error ? error : new Error(String(error))),
    );
    if (!(chatResult instanceof Error)) {
      return chatResult;
    }

    throw new Error(
      `OpenAI generation failed. responses=${responsesResult.message}. chat=${chatResult.message}`,
    );
  }

  const chatError = await requestViaChatCompletions(normalizedArgs).catch((error) =>
    error instanceof Error ? error : new Error(String(error)),
  );

  const responsesResult = await requestViaResponsesApi(normalizedArgs).catch((error) =>
    error instanceof Error ? error : new Error(String(error)),
  );

  if (!(responsesResult instanceof Error)) {
    return responsesResult;
  }

  if (!(chatError instanceof Error)) {
    return chatError;
  }

  throw new Error(
    `OpenAI generation failed. chat=${chatError.message}. responses=${responsesResult.message}`,
  );
}

async function requestViaChatCompletions(args: {
  apiKey: string;
  model: string;
  temperature: number;
  maxOutputTokens: number;
  systemPrompt: string;
  userPrompt: string;
}) {
  const basePayload = {
    model: args.model,
    messages: [
      { role: "system", content: args.systemPrompt },
      { role: "user", content: args.userPrompt },
    ],
  };
  const basePayloadWithTemperature = {
    ...basePayload,
    temperature: args.temperature,
  };

  const attempts: Array<Record<string, unknown>> = isGpt5Model(args.model)
    ? [
      {
        ...basePayload,
        max_completion_tokens: args.maxOutputTokens,
        response_format: { type: "json_object" },
      },
      {
        ...basePayload,
        max_completion_tokens: Math.max(args.maxOutputTokens * 2, 2400),
      },
    ]
    : [
      {
        ...basePayloadWithTemperature,
        max_completion_tokens: args.maxOutputTokens,
        response_format: { type: "json_object" },
      },
      {
        ...basePayload,
        max_completion_tokens: args.maxOutputTokens,
      },
      {
        ...basePayload,
        max_completion_tokens: args.maxOutputTokens,
        response_format: { type: "json_object" },
      },
      {
        ...basePayload,
        max_tokens: args.maxOutputTokens,
      },
      {
        ...basePayload,
        max_tokens: args.maxOutputTokens,
        response_format: { type: "json_object" },
      },
      {
        ...basePayload,
        max_completion_tokens: Math.max(args.maxOutputTokens * 2, 2200),
      },
    ];

  let lastError: Error | null = null;
  for (const attempt of attempts) {
    try {
      const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${args.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attempt),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenAI request failed (${response.status}): ${errorText.slice(0, 400)}`,
        );
      }

      const payload = await response.json();
      const content = extractContentFromPayload(payload);
      if (!content) {
        throw buildNoContentError("chat", payload);
      }

      return content;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw (
    lastError ??
    new Error("OpenAI chat/completions failed with an unknown error")
  );
}

async function requestViaResponsesApi(args: {
  apiKey: string;
  model: string;
  temperature: number;
  maxOutputTokens: number;
  systemPrompt: string;
  userPrompt: string;
}) {
  const baseInput = [
    {
      role: "system",
      content: [{ type: "input_text", text: args.systemPrompt }],
    },
    {
      role: "user",
      content: [{ type: "input_text", text: args.userPrompt }],
    },
  ];

  const basePayload = {
    model: args.model,
    input: baseInput,
    max_output_tokens: args.maxOutputTokens,
    reasoning: isGpt5Model(args.model) ? { effort: "low" } : undefined,
  };
  const basePayloadWithTemperature = {
    ...basePayload,
    temperature: args.temperature,
  };

  const attempts: Array<Record<string, unknown>> = isGpt5Model(args.model)
    ? [
      {
        ...basePayload,
        text: { format: { type: "json_object" } },
      },
      {
        ...basePayload,
        max_output_tokens: Math.max(args.maxOutputTokens * 2, 2400),
      },
    ]
    : [
      {
        ...basePayloadWithTemperature,
        text: { format: { type: "json_object" } },
      },
      {
        ...basePayload,
        text: { format: { type: "json_object" } },
      },
      {
        ...basePayloadWithTemperature,
      },
      {
        ...basePayload,
      },
    ];

  let lastError: Error | null = null;
  for (const attempt of attempts) {
    try {
      const response = await fetch(OPENAI_RESPONSES_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${args.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attempt),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenAI responses request failed (${response.status}): ${errorText.slice(0, 400)}`,
        );
      }

      const payload = await response.json();
      const resolvedPayload = await resolvePossiblyIncompleteResponsePayload(
        args.apiKey,
        payload,
      );
      const content = extractContentFromPayload(resolvedPayload);
      if (!content) {
        throw buildNoContentError("responses", resolvedPayload);
      }

      return content;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw (
    lastError ??
    new Error("OpenAI responses API failed with an unknown error")
  );
}

function extractContentFromPayload(payload: any): string {
  console.log("payload", payload);
  const directOutputText = payload?.output_text;
  if (typeof directOutputText === "string" && directOutputText.trim()) {
    return directOutputText;
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) {
    return content;
  }

  const refusal = payload?.choices?.[0]?.message?.refusal;
  if (typeof refusal === "string" && refusal.trim()) {
    throw new Error(`OpenAI refusal: ${refusal.slice(0, 240)}`);
  }

  if (
    content &&
    typeof content === "object" &&
    typeof content.value === "string" &&
    content.value.trim()
  ) {
    return content.value;
  }

  if (Array.isArray(content)) {
    const textParts = content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (
          part &&
          typeof part.text === "object" &&
          typeof part.text?.value === "string"
        ) {
          return part.text.value;
        }
        if (part && typeof part.text === "string") {
          return part.text;
        }
        if (
          part &&
          typeof part.content === "object" &&
          typeof part.content?.text?.value === "string"
        ) {
          return part.content.text.value;
        }
        if (
          part &&
          typeof part.content === "object" &&
          typeof part.content?.text === "string"
        ) {
          return part.content.text;
        }
        return "";
      })
      .filter(Boolean);
    if (textParts.length > 0) {
      return textParts.join("\n");
    }
  }

  const responsesOutput = payload?.output;
  if (Array.isArray(responsesOutput)) {
    const textParts: string[] = [];
    for (const item of responsesOutput) {
      if (item?.type === "message" && Array.isArray(item?.content)) {
        for (const chunk of item.content) {
          if (typeof chunk?.text === "string" && chunk.text.trim()) {
            textParts.push(chunk.text.trim());
          } else if (
            typeof chunk?.text?.value === "string" &&
            chunk.text.value.trim()
          ) {
            textParts.push(chunk.text.value.trim());
          }
        }
      }
    }

    if (textParts.length > 0) {
      return textParts.join("\n");
    }
  }

  return "";
}

function buildNoContentError(apiKind: "chat" | "responses", payload: any) {
  const payloadObject = payload && typeof payload === "object" ? payload : {};
  const payloadKeys = Object.keys(payloadObject as Record<string, unknown>)
    .slice(0, 20)
    .join(",");
  const finishReason =
    payload?.choices?.[0]?.finish_reason ??
    payload?.status ??
    payload?.output?.[0]?.status ??
    "unknown";
  const choiceKeys = Object.keys(payload?.choices?.[0] ?? {})
    .slice(0, 20)
    .join(",");
  const messageKeys = Object.keys(payload?.choices?.[0]?.message ?? {})
    .slice(0, 20)
    .join(",");
  return new Error(
    `OpenAI ${apiKind} response did not contain usable text content (keys=${payloadKeys || "none"}, choiceKeys=${choiceKeys || "none"}, messageKeys=${messageKeys || "none"}, finish=${finishReason}, complete=${String(payload?.complete ?? "n/a")})`,
  );
}

async function resolvePossiblyIncompleteResponsePayload(
  apiKey: string,
  payload: any,
) {
  if (!shouldPollResponsesPayload(payload)) {
    return payload;
  }

  const responseId = payload?.id;
  if (typeof responseId !== "string" || responseId.trim().length === 0) {
    return payload;
  }

  let latest = payload;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await sleep(200 + attempt * 250);
    const response = await fetch(
      `${OPENAI_RESPONSES_URL}/${encodeURIComponent(responseId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      return latest;
    }

    latest = await response.json();
    if (!shouldPollResponsesPayload(latest)) {
      return latest;
    }
  }

  return latest;
}

function shouldPollResponsesPayload(payload: any) {
  const status = payload?.status;
  const complete = payload?.complete;
  return (
    typeof payload?.id === "string" &&
    ((typeof status === "string" &&
      !["completed", "failed", "cancelled", "incomplete"].includes(status)) ||
      complete === false)
  );
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isGpt5Model(model: string) {
  return /^gpt-5/i.test(model);
}

function parseJsonLenient(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fencedMatch?.[1]) {
      try {
        return JSON.parse(fencedMatch[1].trim());
      } catch {
        // Continue to brace extraction.
      }
    }

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const objectSlice = trimmed.slice(firstBrace, lastBrace + 1);
      return JSON.parse(objectSlice);
    }

    throw new Error("OpenAI response could not be parsed as JSON");
  }
}

function normalizeGeneratedScene(
  raw: unknown,
  minChoices: number,
  maxChoices: number,
): GeneratedScenePayload {
  if (!isRecord(raw)) {
    throw new Error("Generated scene is not an object");
  }

  const title = typeof raw.title === "string" ? raw.title.trim() : undefined;
  const description =
    typeof raw.description === "string" ? raw.description.trim() : "";
  if (!description) {
    throw new Error("Generated scene is missing description");
  }

  if (!Array.isArray(raw.options)) {
    throw new Error("Generated scene options must be an array");
  }
  if (raw.options.length < minChoices || raw.options.length > maxChoices) {
    throw new Error(
      `Generated options length ${raw.options.length} is outside ${minChoices}-${maxChoices}`,
    );
  }

  const options = raw.options.map((option, index) => {
    if (!isRecord(option)) {
      throw new Error(`Generated option ${index} is not an object`);
    }
    const text = typeof option.text === "string" ? option.text.trim() : "";
    if (!text) {
      throw new Error(`Generated option ${index} is missing text`);
    }

    return {
      text,
      requirements: asStringArray(option.requirements),
      effects: asStringArray(option.effects),
    };
  });

  // Gameplay safety: never allow a generated scene to have zero universally
  // available options. If the model gated every option behind requirements,
  // unlock the least-restricted one.
  ensureAtLeastOneUniversalOption(options);

  const memoryDelta = isRecord(raw.memoryDelta) ? raw.memoryDelta : {};

  return {
    title: title || undefined,
    description,
    options,
    memoryDelta: {
      facts: asStringArray(memoryDelta.facts),
      unresolvedThreads: asStringArray(memoryDelta.unresolvedThreads),
      resolvedThreads: asStringArray(memoryDelta.resolvedThreads),
      tone:
        typeof memoryDelta.tone === "string" && memoryDelta.tone.trim()
          ? memoryDelta.tone.trim()
          : undefined,
      flags: asStringArray(memoryDelta.flags),
      summarySnippet:
        typeof memoryDelta.summarySnippet === "string" &&
          memoryDelta.summarySnippet.trim()
          ? memoryDelta.summarySnippet.trim()
          : undefined,
    },
  };
}

function ensureAtLeastOneUniversalOption(
  options: Array<{ text: string; requirements: string[]; effects: string[] }>,
) {
  if (options.some((option) => option.requirements.length === 0)) {
    return;
  }

  if (options.length === 0) {
    options.push({
      text: "Advance through the uncertainty and improvise.",
      requirements: [],
      effects: [],
    });
    return;
  }

  let bestIndex = 0;
  for (let index = 1; index < options.length; index += 1) {
    if (options[index].requirements.length < options[bestIndex].requirements.length) {
      bestIndex = index;
    }
  }

  options[bestIndex] = {
    ...options[bestIndex],
    requirements: [],
  };
}

function asStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}
