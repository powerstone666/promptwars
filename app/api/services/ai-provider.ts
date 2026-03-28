/**
 * AI Provider — LiteLLM wrapper.
 *
 * All LLM communication is isolated here.
 * Swap providers by changing MODEL_NAME and LITELLM_BASE_URL env vars.
 * Supports text-only and multimodal (text + image) messages.
 */

import { getLiteLLMBaseUrl, getLiteLLMApiKey, getModelName } from "@/lib/env";
import { AI_TIMEOUT_MS } from "@/lib/constants";
import { Logger } from "./logger";

const logger = new Logger({
  minLevel: 0,
  format: "json",
  includeCaller: false,
});

/* ── Multimodal message types (OpenAI Vision API format) ── */

type TextContentPart = { type: "text"; text: string };
type ImageContentPart = {
  type: "image_url";
  image_url: { url: string; detail?: "auto" | "low" | "high" };
};
type ContentPart = TextContentPart | ImageContentPart;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Build the user message content — text-only or multimodal.
 */
function buildUserContent(
  userPrompt: string,
  imageBase64?: string,
): string | ContentPart[] {
  if (!imageBase64) return userPrompt;

  // Multimodal: text + image
  return [
    { type: "text", text: userPrompt },
    {
      type: "image_url",
      image_url: { url: imageBase64, detail: "auto" },
    },
  ];
}

/**
 * Call the LLM via OpenAI-compatible API (LiteLLM).
 * Returns raw string content from the model.
 *
 * @param imageBase64 — Optional base64 data URI (e.g. "data:image/jpeg;base64,...")
 */
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  requestId: string,
  imageBase64?: string,
): Promise<string> {
  const baseUrl = getLiteLLMBaseUrl();
  const apiKey = getLiteLLMApiKey();
  const model = getModelName();

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: buildUserContent(userPrompt, imageBase64) },
  ];

  const isMultimodal = !!imageBase64;
  logger.info(`[${requestId}] Calling LLM`, {
    model,
    baseUrl: baseUrl.replace(/\/+$/, ""),
    multimodal: isMultimodal,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "unknown");
      logger.error(`[${requestId}] LLM API error`, {
        status: response.status,
        body: errorBody.slice(0, 500),
      });
      throw new Error(`LLM API returned ${response.status}: ${errorBody.slice(0, 200)}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;

    if (data.usage) {
      logger.info(`[${requestId}] LLM usage`, data.usage);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("LLM returned empty content");
    }

    return content;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      logger.error(`[${requestId}] LLM call timed out after ${AI_TIMEOUT_MS}ms`);
      throw new Error(`LLM call timed out after ${AI_TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
