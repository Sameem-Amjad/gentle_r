"use client";

import * as React from "react";
import { useActionState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { signUp } from "@/lib/auth/actions";
import { initialActionState } from "@/lib/auth/errors";
import { PASSWORD_MIN_LENGTH, signUpSchema } from "@/lib/auth/schemas";
import { ConsentCheckbox } from "./consent-checkbox";
import { FormError } from "./form-error";
import { PasswordInput } from "./password-input";
import { useClientValidation } from "./use-client-validation";

export function SignUpForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signUp, initialActionState);
  const { clientErrors, onSubmit } = useClientValidation(signUpSchema);

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

      <Field
        id="sign-up-email"
        label="Email"
        error={fieldErrors?.email}
        hint="We'll send a confirmation link here."
      >
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

      <Field
        id="sign-up-password"
        label="Password"
        hint={`At least ${PASSWORD_MIN_LENGTH} characters. A short phrase you'll remember works well.`}
        error={fieldErrors?.password}
      >
        {(props) => <PasswordInput {...props} name="password" autoComplete="new-password" />}
      </Field>

      <Field id="sign-up-confirm" label="Confirm password" error={fieldErrors?.confirmPassword}>
        {(props) => <PasswordInput {...props} name="confirmPassword" autoComplete="new-password" />}
      </Field>

      <ConsentCheckbox id="sign-up-accept" name="accept" error={fieldErrors?.accept} />

      <FormError message={formError} />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={pending}
        loadingText="Creating your account"
      >
        Create account
      </Button>
    </form>
  );
}
