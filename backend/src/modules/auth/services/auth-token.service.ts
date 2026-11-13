import { createHmac, timingSafeEqual } from "node:crypto";
import type { Response } from "express";

const ACCESS_TOKEN_TTL_SECONDS = 60 * 15;
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const JWT_HEADER = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be configured in the environment.");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", jwtSecret()).update(value).digest("base64url");
}

export function assertJwtSecretConfigured() {
  jwtSecret();
}

function createToken(userId: string, tokenType: "access" | "refresh", ttlSeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    typ: tokenType,
    iat: now,
    exp: now + ttlSeconds,
  })).toString("base64url");
  const unsignedToken = `${JWT_HEADER}.${payload}`;
  return `${unsignedToken}.${sign(unsignedToken)}`;
}

export function createAccessToken(userId: string) {
  return createToken(userId, "access", ACCESS_TOKEN_TTL_SECONDS);
}

export function createRefreshToken(userId: string) {
  return createToken(userId, "refresh", REFRESH_TOKEN_TTL_SECONDS);
}

function decodeJsonSegment(segment: string): unknown {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
}

function verifyToken(token: string, expectedType: "access" | "refresh"): string | null {
  const secret = jwtSecret();
  if (token.length > 4096) return null;

  const [headerSegment, payloadSegment, signatureSegment, extra] = token.split(".");
  if (!headerSegment || !payloadSegment || !signatureSegment || extra !== undefined) return null;

  const expectedSignature = createHmac("sha256", secret)
    .update(`${headerSegment}.${payloadSegment}`)
    .digest();
  const providedSignature = Buffer.from(signatureSegment, "base64url");
  if (expectedSignature.length !== providedSignature.length ||
      !timingSafeEqual(expectedSignature, providedSignature)) {
    return null;
  }

  try {
    const header = decodeJsonSegment(headerSegment);
    const payload = decodeJsonSegment(payloadSegment);
    if (typeof header !== "object" || header === null || !("alg" in header) || header.alg !== "HS256" ||
        typeof payload !== "object" || payload === null ||
        !("sub" in payload) || typeof payload.sub !== "string" ||
        !("typ" in payload) || payload.typ !== expectedType ||
        !("exp" in payload) || typeof payload.exp !== "number" ||
        payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload.sub;
  } catch {
    return null;
  }
}

export function verifyAccessToken(token: string) {
  return verifyToken(token, "access");
}

export function verifyRefreshToken(token: string) {
  return verifyToken(token, "refresh");
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(response: Response, userId: string) {
  response.cookie(ACCESS_TOKEN_COOKIE, createAccessToken(userId), {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
  });
  response.cookie(REFRESH_TOKEN_COOKIE, createRefreshToken(userId), {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
  });
}

export function setAccessCookie(response: Response, userId: string) {
  response.cookie(ACCESS_TOKEN_COOKIE, createAccessToken(userId), {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
  });
}

export function clearAuthCookies(response: Response) {
  response.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions);
  response.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
}
