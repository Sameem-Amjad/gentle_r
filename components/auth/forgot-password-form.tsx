"use client";

import * as React from "react";
import { useActionState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { requestPasswordReset } from "@/lib/auth/actions";
import { initialActionState } from "@/lib/auth/errors";
import { forgotPasswordSchema } from "@/lib/auth/schemas";
import { FormError } from "./form-error";
import { useClientValidation } from "./use-client-validation";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialActionState);
  // Controlled, because React resets uncontrolled fields after every action:
  // a failed attempt would otherwise empty the email box.
  const [email, setEmail] = React.useState("");
  const { clientErrors, onSubmit } = useClientValidation(forgotPasswordSchema);

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
      <Field id="forgot-email" label="Email" error={fieldErrors?.email}>
        {(props) => (
          <Input
            {...props}
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
          />
        )}
      </Field>

      <FormError message={formError} />

      <Button type="submit" size="lg" className="w-full" loading={pending} loadingText="Sending">
        Send reset link
      </Button>
    </form>
  );
}
