import { describe, expect, it } from "vitest";
import {
  normalizeEmail,
  normalizePhone,
  validateResetPasswordInput,
  validateSignInInput,
  validateSignUpInput,
} from "./auth.validation.js";

describe("auth.validation", () => {
  describe("normalizeEmail", () => {
    it("normalizes and trims valid email", () => {
      expect(normalizeEmail("  USER@Example.COM ")).toBe("user@example.com");
    });

    it("rejects invalid email addresses", () => {
      expect(() => normalizeEmail("invalid-email")).toThrow("email must be a valid email address.");
      expect(() => normalizeEmail("")).toThrow();
    });
  });

  describe("normalizePhone", () => {
    it("normalizes international phone numbers", () => {
      expect(normalizePhone("+91 98765-43210")).toBe("+919876543210");
    });

    it("rejects invalid phone numbers", () => {
      expect(() => normalizePhone("123")).toThrow("phone must include a valid international country code.");
    });
  });

  describe("validateSignUpInput", () => {
    it("accepts valid sign up data", () => {
      const result = validateSignUpInput({
        fullName: " Alice Smith ",
        email: "alice@example.com",
        password: "securePassword123!",
        phone: "+91 98765 43210",
      });
      expect(result.fullName).toBe("Alice Smith");
      expect(result.email).toBe("alice@example.com");
      expect(result.phone).toBe("+919876543210");
    });

    it("rejects password too short", () => {
      expect(() =>
        validateSignUpInput({
          fullName: "Alice",
          email: "alice@example.com",
          password: "short",
        }),
      ).toThrow("password must be between 8 and 128 characters.");
    });
  });

  describe("validateSignInInput", () => {
    it("accepts valid sign in input", () => {
      const result = validateSignInInput({
        email: " alice@example.com ",
        password: "myPassword123",
      });
      expect(result.email).toBe("alice@example.com");
      expect(result.password).toBe("myPassword123");
    });

    it("rejects missing password", () => {
      expect(() =>
        validateSignInInput({
          email: "alice@example.com",
          password: "",
        }),
      ).toThrow("email or password is invalid.");
    });
  });

  describe("validateResetPasswordInput", () => {
    it("accepts valid reset password input", () => {
      const result = validateResetPasswordInput({
        email: " ALICE@example.com ",
        code: " 123456 ",
        newPassword: "brandNewPassword123",
      });
      expect(result.email).toBe("alice@example.com");
      expect(result.code).toBe("123456");
      expect(result.newPassword).toBe("brandNewPassword123");
    });

    it("rejects invalid OTP code", () => {
      expect(() =>
        validateResetPasswordInput({
          email: "alice@example.com",
          code: "12345",
          newPassword: "brandNewPassword123",
        }),
      ).toThrow("code must be a 6-digit code.");
    });
  });
});
