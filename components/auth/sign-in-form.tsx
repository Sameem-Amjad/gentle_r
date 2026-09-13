"use client";

import * as React from "react";
import { useActionState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { signIn } from "@/lib/auth/actions";
import { initialActionState } from "@/lib/auth/errors";
import { signInSchema } from "@/lib/auth/schemas";
import { AuthLink } from "./auth-link";
import { FormError } from "./form-error";
import { PasswordInput } from "./password-input";
import { useClientValidation } from "./use-client-validation";

export function SignInForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialActionState);
  const { clientErrors, onSubmit } = useClientValidation(signInSchema);

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
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <Field id="sign-in-email" label="Email" error={fieldErrors?.email}>
        {(props) => (
          <Input
            {...props}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
          />
        )}
      </Field>

      <div className="space-y-2">
        <Field id="sign-in-password" label="Password" error={fieldErrors?.password}>
          {(props) => <PasswordInput {...props} name="password" autoComplete="current-password" />}
        </Field>
        <p className="text-right text-sm">
          <AuthLink href="/forgot-password">Forgot your password?</AuthLink>
        </p>
      </div>

      <FormError message={formError} />

      <Button type="submit" size="lg" className="w-full" loading={pending} loadingText="Signing in">
        Sign in
      </Button>
    </form>
  );
}
