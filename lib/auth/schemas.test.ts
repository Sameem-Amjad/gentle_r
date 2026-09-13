import { describe, expect, it } from "vitest";
import {
  deleteAccountSchema,
  flattenFieldErrors,
  forgotPasswordSchema,
  formDataToObject,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "./schemas";

describe("auth schemas", () => {
  it("normalises email addresses", () => {
    const result = signInSchema.safeParse({ email: "  Person@Example.COM ", password: "hunter22" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("person@example.com");
  });

  it("asks kindly for missing sign-in fields", () => {
    const result = signInSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = flattenFieldErrors(result.error);
      expect(errors.email).toEqual(["Please enter your email address."]);
      expect(errors.password).toEqual(["Please enter your password."]);
    }
  });

  it("requires eight characters, matching passwords and consent on sign-up", () => {
    const result = signUpSchema.safeParse({
      email: "person@example.com",
      password: "short",
      confirmPassword: "different",
      accept: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = flattenFieldErrors(result.error);
      expect(errors.password?.[0]).toBe("Please use at least 8 characters.");
      expect(errors.accept?.[0]).toMatch(/18 or older/);
    }
  });

  it("reports a mismatch on the confirm field only", () => {
    const result = signUpSchema.safeParse({
      email: "person@example.com",
      password: "a calm sentence",
      confirmPassword: "a calm sentenc",
      accept: "on",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = flattenFieldErrors(result.error);
      expect(errors.password).toBeUndefined();
      expect(errors.confirmPassword).toEqual(["These passwords don't match yet."]);
    }
  });

  it("accepts a complete sign-up and coerces the checkbox", () => {
    const result = signUpSchema.safeParse({
      email: "person@example.com",
      password: "a calm sentence",
      confirmPassword: "a calm sentence",
      accept: "on",
      next: "/journal",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.accept).toBe(true);
  });

  it("validates the reset and forgot-password forms", () => {
    expect(forgotPasswordSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: "person@example.com" }).success).toBe(true);
    expect(
      resetPasswordSchema.safeParse({ password: "longenough", confirmPassword: "longenough" }).success,
    ).toBe(true);
    expect(resetPasswordSchema.safeParse({ password: "longenough", confirmPassword: "nope" }).success).toBe(
      false,
    );
  });

  it("accepts the deletion word regardless of case or spacing", () => {
    expect(deleteAccountSchema.safeParse({ confirmation: "  DELETE " }).success).toBe(true);
    expect(deleteAccountSchema.safeParse({ confirmation: "delete please" }).success).toBe(false);
    expect(deleteAccountSchema.safeParse({ confirmation: "" }).success).toBe(false);
  });

  it("turns FormData into strings, treating missing keys as empty", () => {
    const fd = new FormData();
    fd.set("email", "person@example.com");
    expect(formDataToObject(fd, ["email", "password"])).toEqual({
      email: "person@example.com",
      password: "",
    });
  });
});
