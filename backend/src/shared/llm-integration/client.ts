import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";
import { parseAuditResponse } from "./response";
import type { AuditAnalysis, AuditPreviewInput, AuditSignals } from "./types";

export class RetryableGeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryableGeminiError";
  }
}

const RETRYABLE_GEMINI_STATUSES = new Set([408, 429, 500, 502, 503, 504]);
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
}

export async function analyzeAuditWithGemini(
  business: AuditPreviewInput,
  signals: AuditSignals,
): Promise<AuditAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from the server environment.");
  }

  const model = process.env.GEMINI_MODEL_ID?.trim() || "gemini-3.8-flash";
  const endpoint = `${GEMINI_API_BASE_URL}/${encodeURIComponent(model)}:generateContent`;
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(180_000),
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [{
          role: "user",
          parts: [{ text: buildUserPrompt(business, signals) }],
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2500,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Network request failed.";
    throw new RetryableGeminiError(`Gemini request failed before receiving a response: ${reason}`);
  }

  if (!response.ok) {
    const details = (await response.text()).slice(0, 500);
    const message = `Gemini API returned HTTP ${response.status}: ${details}`;
    if (RETRYABLE_GEMINI_STATUSES.has(response.status)) {
      throw new RetryableGeminiError(message);
    }
    throw new Error(message);
  }

  const payload = await response.json() as GeminiGenerateContentResponse;
  const candidate = payload.candidates?.[0];
  const content = candidate?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!content) {
    const reason = candidate?.finishReason ?? payload.promptFeedback?.blockReason;
    throw new Error(reason
      ? `Gemini returned no text content (reason: ${reason}).`
      : "Gemini returned an empty response.");
  }

  return parseAuditResponse(content);
}
