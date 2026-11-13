import { randomUUID } from "node:crypto";
import type { RequestHandler, Response } from "express";

const MAX_RESPONSE_LOG_LENGTH = 3_000;
const REDACTED = "[REDACTED]";
const sensitiveKeyPattern = /password|token|secret|authorization|cookie|otp|verification.?code|reset.?code/i;

function debugErrorsEnabled() {
  const setting = process.env.DEBUG_API_ERRORS?.trim().toLowerCase();
  if (setting === "true") return true;
  if (setting === "false") return false;
  return process.env.NODE_ENV !== "production";
}

function redactSensitiveFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSensitiveFields);
  if (typeof value !== "object" || value === null) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      sensitiveKeyPattern.test(key) ? REDACTED : redactSensitiveFields(nestedValue),
    ]),
  );
}

function responsePreview(response: Response, body: unknown) {
  const contentType = response.getHeader("content-type");
  if (typeof contentType !== "string" || !contentType.includes("json") || body === undefined) {
    return undefined;
  }

  let parsedBody = body;
  if (typeof body === "string") {
    try {
      parsedBody = JSON.parse(body) as unknown;
    } catch {
      // Keep an invalid JSON response visible as text for debugging.
    }
  }

  let serialized: string;
  try {
    serialized = JSON.stringify(redactSensitiveFields(parsedBody));
  } catch {
    return "[response body could not be serialized]";
  }

  if (serialized.length <= MAX_RESPONSE_LOG_LENGTH) return serialized;
  return `${serialized.slice(0, MAX_RESPONSE_LOG_LENGTH)}... [truncated]`;
}

function hasGraphqlErrors(body: unknown) {
  if (typeof body !== "string") return false;
  try {
    const parsedBody = JSON.parse(body) as { errors?: unknown[] };
    return Array.isArray(parsedBody.errors) && parsedBody.errors.length > 0;
  } catch {
    return false;
  }
}

export const requestLogger: RequestHandler = (request, response, next) => {
  const requestId = randomUUID();
  const startedAt = Date.now();
  const path = request.originalUrl.split("?")[0] || request.path;
  let responseBody: unknown;

  response.locals.requestId = requestId;
  response.setHeader("X-Request-Id", requestId);

  const send = response.send.bind(response);
  response.send = ((body?: unknown) => {
    responseBody = body;
    return send(body);
  }) as typeof response.send;

  response.once("finish", () => {
    const preview = responsePreview(response, responseBody);
    const isGraphqlRequest = path === "/graphql";
    const graphqlErrors = isGraphqlRequest && hasGraphqlErrors(responseBody);

    const status = response.statusCode;
    const entry = {
      type: "http.response",
      requestId,
      method: request.method,
      path,
      ...(isGraphqlRequest && typeof request.body?.operationName === "string"
        ? { operationName: request.body.operationName }
        : {}),
      status,
      durationMs: Date.now() - startedAt,
      ...(preview === undefined ? {} : { response: preview }),
    };
    const line = JSON.stringify(entry);

    if (status >= 500 || graphqlErrors) console.error(line);
    else if (status >= 400) console.warn(line);
    else console.log(line);
  });

  next();
};

export { debugErrorsEnabled };
