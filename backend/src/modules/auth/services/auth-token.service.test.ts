import { beforeEach, describe, expect, it } from "vitest";
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./auth-token.service.js";

describe("auth-token.service", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-with-more-than-enough-entropy";
  });

  it("verifies access and refresh tokens only for their intended use", () => {
    const accessToken = createAccessToken("user-123");
    const refreshToken = createRefreshToken("user-123");

    expect(verifyAccessToken(accessToken)).toBe("user-123");
    expect(verifyRefreshToken(refreshToken)).toBe("user-123");
    expect(verifyAccessToken(refreshToken)).toBeNull();
    expect(verifyRefreshToken(accessToken)).toBeNull();
  });

  it("rejects malformed or tampered tokens", () => {
    expect(verifyAccessToken("not-a-token")).toBeNull();
    expect(verifyAccessToken(`${createAccessToken("user-123")}x`)).toBeNull();
  });
});
