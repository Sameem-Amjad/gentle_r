"use client";

import * as React from "react";
import { useActionState } from "react";
import { Button, Field } from "@/components/ui";
import { updatePassword } from "@/lib/auth/actions";
import { initialActionState } from "@/lib/auth/errors";
import { PASSWORD_MIN_LENGTH, resetPasswordSchema } from "@/lib/auth/schemas";
import { FormError } from "./form-error";
import { PasswordInput } from "./password-input";
import { useClientValidation } from "./use-client-validation";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialActionState);
  const { clientErrors, onSubmit } = useClientValidation(resetPasswordSchema);

  const fieldErrors = clientErrors ?? (state.ok ? undefined : state.fieldErrors);
  const formError = clientErrors ? undefined : state.ok ? undefined : state.error;

  return (
    <form
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      aria-busy={pending || undefined}
      className="space-y-5"
    >
      <Field
        id="reset-password"
        label="New password"
        hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
        error={fieldErrors?.password}
      >
        {(props) => <PasswordInput {...props} name="password" autoComplete="new-password" />}
      </Field>

      <Field id="reset-confirm" label="Confirm new password" error={fieldErrors?.confirmPassword}>
        {(props) => <PasswordInput {...props} name="confirmPassword" autoComplete="new-password" />}
      </Field>

      <FormError message={formError} />

      <Button type="submit" size="lg" className="w-full" loading={pending} loadingText="Saving">
        Save new password
      </Button>
    </form>
  );
}
