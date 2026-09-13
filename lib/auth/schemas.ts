import { z } from "zod";

/**
 * Form schemas shared by the client (light, early feedback) and the server
 * (the real check). Messages are plain and unhurried.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const DELETE_CONFIRMATION_WORD = "delete";

export const emailSchema = z
  .string({ error: "Please enter your email address." })
  .trim()
  .toLowerCase()
  .min(1, { error: "Please enter your email address." })
  .max(254, { error: "That email address is too long." })
  .pipe(z.email({ error: "Please enter a valid email address." }));

export const newPasswordSchema = z
  .string({ error: "Please choose a password." })
  .min(PASSWORD_MIN_LENGTH, { error: `Please use at least ${PASSWORD_MIN_LENGTH} characters.` })
  .max(PASSWORD_MAX_LENGTH, { error: `Please use ${PASSWORD_MAX_LENGTH} characters or fewer.` });

/** Optional same-origin path to return to after signing in. Checked again before use. */
export const nextPathSchema = z.string().max(2048).optional();

const passwordsMatch = {
  error: "These passwords don't match yet.",
  path: ["confirmPassword"],
};

export const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: "Please enter your password." })
    .min(1, { error: "Please enter your password." })
    .max(PASSWORD_MAX_LENGTH * 4),
  next: nextPathSchema,
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: z.string({ error: "Please confirm your password." }),
    accept: z.preprocess(
      (value) => value === true || value === "on" || value === "true",
      z.literal(true, {
        error: "Please confirm you are 18 or older and accept the use policy and privacy notice.",
      }),
    ),
    next: nextPathSchema,
  })
  .refine((data) => data.password === data.confirmPassword, passwordsMatch);

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string({ error: "Please confirm your new password." }),
  })
  .refine((data) => data.password === data.confirmPassword, passwordsMatch);

export const deleteAccountSchema = z.object({
  confirmation: z
    .string({ error: `Please type "${DELETE_CONFIRMATION_WORD}" to confirm.` })
    .trim()
    .toLowerCase()
    .refine((value) => value === DELETE_CONFIRMATION_WORD, {
      error: `Please type "${DELETE_CONFIRMATION_WORD}" to confirm.`,
    }),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

/**
 * Turns FormData into a plain string record so schemas always receive
 * strings (missing fields become ""). Files are ignored.
 */
export function formDataToObject(formData: FormData, keys: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of keys) {
    const value = formData.get(key);
    out[key] = typeof value === "string" ? value : "";
  }
  return out;
}

/** Field errors flattened into { field: [messages] } for Field components. */
export function flattenFieldErrors(error: z.ZodError): Record<string, string[] | undefined> {
  return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}
