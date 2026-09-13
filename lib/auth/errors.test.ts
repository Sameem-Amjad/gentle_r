import { describe, expect, it } from "vitest";
import { authCopy, isExistingUserError, isExpiredLinkError, isRateLimitError, mapAuthError } from "./errors";
import { resolveNextPath, safeNextOrUndefined } from "./paths";

const err = (code?: string, status?: number, message = "") => ({ code, status, message });

describe("mapAuthError", () => {
  it("uses the kind sentence for each known code", () => {
    expect(mapAuthError(err("invalid_credentials", 400))).toBe(authCopy.invalidCredentials);
    expect(mapAuthError(err("email_not_confirmed", 400))).toBe(authCopy.emailNotConfirmed);
    expect(mapAuthError(err("over_request_rate_limit", 429))).toBe(authCopy.rateLimited);
    expect(mapAuthError(err("weak_password", 422))).toBe(authCopy.weakPassword);
    expect(mapAuthError(err("same_password", 422))).toBe(authCopy.samePassword);
    expect(mapAuthError(err("session_not_found", 403))).toBe(authCopy.sessionEnded);
  });

  it("falls back to status and message patterns, then to the generic sentence", () => {
    expect(mapAuthError(err(undefined, 429))).toBe(authCopy.rateLimited);
    expect(mapAuthError(err(undefined, 400, "Invalid login credentials"))).toBe(authCopy.invalidCredentials);
    expect(mapAuthError(err(undefined, 400, "Email not confirmed"))).toBe(authCopy.emailNotConfirmed);
    expect(mapAuthError(err("unexpected_failure", 500, "boom"))).toBe(authCopy.generic);
    expect(mapAuthError(null)).toBe(authCopy.generic);
  });

  it("classifies helper cases", () => {
    expect(isRateLimitError(err("over_email_send_rate_limit", 429))).toBe(true);
    expect(isRateLimitError(err("invalid_credentials", 400))).toBe(false);
    expect(isExpiredLinkError(err("otp_expired", 403))).toBe(true);
    expect(isExpiredLinkError(err(undefined, 403, "Email link is invalid or has expired"))).toBe(true);
    expect(isExpiredLinkError(err("bad_code_verifier", 400))).toBe(false);
    expect(isExistingUserError(err("user_already_exists", 422))).toBe(true);
  });
});

describe("post-auth redirect paths", () => {
  it("only follows safe, same-origin, non-auth paths", () => {
    expect(resolveNextPath("/journal/abc")).toBe("/journal/abc");
    expect(resolveNextPath("/account?updated=password")).toBe("/account?updated=password");
    expect(resolveNextPath("https://evil.example")).toBe("/journal");
    expect(resolveNextPath("//evil.example")).toBe("/journal");
    expect(resolveNextPath("/sign-in?next=/journal")).toBe("/journal");
    expect(resolveNextPath("/auth/confirm")).toBe("/journal");
    expect(resolveNextPath(undefined, "/reset-password")).toBe("/reset-password");
    expect(resolveNextPath(["/journal", "/x"])).toBe("/journal");
  });

  it("returns undefined for values that should not be echoed", () => {
    expect(safeNextOrUndefined("/journal")).toBe("/journal");
    expect(safeNextOrUndefined("javascript:alert(1)")).toBeUndefined();
    expect(safeNextOrUndefined("/sign-up")).toBeUndefined();
    expect(safeNextOrUndefined(null)).toBeUndefined();
  });
});
