/**
 * AI Provider routing.
 *
 * All model communication is isolated here.
 * LiteLLM is used only for text-only and text+image analysis.
 * DashScope is used only for requests that include recorded audio.
 */

import {
  getDashScopeApiKey,
  getDashScopeCompatApiUrl,
  getDashScopeVoiceModel,
  getLiteLLMBaseUrl,
  getLiteLLMApiKey,
  getModelName,
} from "@/lib/env";
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
type AudioContentPart = {
  type: "input_audio";
  input_audio: { data: string; format: string };
};
type ContentPart = TextContentPart | ImageContentPart | AudioContentPart;

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

interface DashScopeChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
  output?: {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };
}

/**
 * Build the LiteLLM user message content.
 * This path is intentionally limited to text-only and text+image requests.
 */
function buildUserContent(
  userPrompt: string,
  imageBase64?: string,
): string | ContentPart[] {
  if (!imageBase64) return userPrompt;

  const content: ContentPart[] = [
    { type: "text", text: userPrompt },
  ];

  if (imageBase64) {
    content.push({
      type: "image_url",
      image_url: { url: imageBase64, detail: "auto" },
    });
  }

  return content;
}

export function parseAudioDataUrl(audioBase64: string): { data: string; format: string } {
  const trimmed = audioBase64.trim();
  const match = trimmed.match(/^data:([^;,]+)(?:;[^,]*)?;base64,(.+)$/);

  if (!match) {
    if (/^[A-Za-z0-9+/=\s]+$/.test(trimmed)) {
      return {
        data: trimmed.replace(/\s+/g, ""),
        format: "webm",
      };
    }

    throw new Error("Audio must be a valid base64 audio payload");
  }

  const mimeType = match[1] || "audio/webm";
  const base64Data = match[2].replace(/\s+/g, "");
  const normalizedMimeType =
    mimeType === "application/octet-stream" ? "audio/webm" : mimeType;
  const format = normalizedMimeType.split("/")[1] ?? "webm";

  return { data: base64Data, format };
}

function normalizeDashScopeAudioInput(audioInput: string): { data: string; format: string } {
  const trimmed = audioInput.trim();
  const dataUrlMatch = trimmed.match(/^data:audio\/([a-zA-Z0-9.+-]+)(?:;[^,]*)?;base64,(.+)$/);
  if (dataUrlMatch) {
    const rawFormat = dataUrlMatch[1];
    return {
      data: trimmed,
      format: rawFormat.toLowerCase().replace("x-", ""),
    };
  }

  if (trimmed.startsWith("data:;base64,")) {
    return { data: trimmed, format: "mp3" };
  }

  return {
    data: `data:;base64,${trimmed}`,
    format: "mp3",
  };
}

function extractTextContent(content: string | Array<{ type?: string; text?: string }> | undefined): string | null {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const text = content
      .filter((part) => part?.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("\n")
      .trim();

    return text || null;
  }

  return null;
}

async function callDashScopeWithAudio(
  systemPrompt: string,
  userPrompt: string,
  requestId: string,
  audioBase64: string,
): Promise<string> {
  const apiUrl = getDashScopeCompatApiUrl();
  const apiKey = getDashScopeApiKey();
  const model = getDashScopeVoiceModel();
  const normalizedAudio = normalizeDashScopeAudioInput(audioBase64);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "input_audio",
              input_audio: {
                data: normalizedAudio.data,
                format: normalizedAudio.format,
              },
            },
            { type: "text", text: userPrompt },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "unknown");
    logger.error(`[${requestId}] DashScope API error`, {
      provider: "dashscope",
      status: response.status,
      model,
      audioFormat: normalizedAudio.format,
      audioLength: normalizedAudio.data.length,
      body: errorBody.slice(0, 500),
    });
    throw new Error(`DashScope API returned ${response.status}: ${errorBody.slice(0, 200)}`);
  }

  const data = (await response.json()) as DashScopeChatCompletionResponse;
  const content =
    extractTextContent(data.choices?.[0]?.message?.content) ??
    extractTextContent(data.output?.choices?.[0]?.message?.content);

  if (!content) {
    throw new Error("DashScope returned empty content");
  }

  return content;
}

/**
 * Route analysis to the correct provider.
 * LiteLLM handles text-only and text+image.
 * DashScope handles any request that includes audio.
 */
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  requestId: string,
  imageBase64?: string,
  audioBase64?: string,
): Promise<string> {
  if (audioBase64) {
    return callDashScopeWithAudio(systemPrompt, userPrompt, requestId, audioBase64);
  }

  const baseUrl = getLiteLLMBaseUrl();
  const apiKey = getLiteLLMApiKey();
  const model = getModelName();

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: buildUserContent(userPrompt, imageBase64) },
  ];

  const isMultimodal = !!imageBase64;
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
        provider: "litellm",
        status: response.status,
        model,
        multimodal: isMultimodal,
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
      logger.error(`[${requestId}] LLM call timed out after ${AI_TIMEOUT_MS}ms`, {
        provider: "litellm",
        model,
        multimodal: isMultimodal,
      });
      throw new Error(`LLM call timed out after ${AI_TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
