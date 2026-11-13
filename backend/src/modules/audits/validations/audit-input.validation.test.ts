import { describe, expect, it } from "vitest";
import { parseAuditJobInput } from "./audit-input.validation";

describe("parseAuditJobInput", () => {
  it("normalizes a valid audit request", () => {
    expect(parseAuditJobInput({
      url: " https://example.com ",
      businessType: " Dental clinic ",
      city: " Pune ",
      state: " Maharashtra ",
    })).toEqual({
      url: "https://example.com/",
      businessType: "Dental clinic",
      city: "Pune",
      state: "Maharashtra",
    });
  });

  it("rejects unsupported URL protocols", () => {
    expect(parseAuditJobInput({
      url: "ftp://example.com",
      businessType: "Retail",
      city: "Pune",
      state: "Maharashtra",
    })).toBe("url must use http or https.");
  });
});
