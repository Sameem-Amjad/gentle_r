"use client";

import * as React from "react";
import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Field,
  Input,
} from "@/components/ui";
import { deleteAccount } from "@/lib/auth/actions";
import { initialActionState, type AuthActionState } from "@/lib/auth/errors";
import { DELETE_CONFIRMATION_WORD } from "@/lib/auth/schemas";
import { FormError } from "./form-error";

/**
 * Two-step, typed confirmation before the account is deleted. The dialog
 * never claims success itself: the server redirects to /account-deleted only
 * after the database has confirmed the deletion.
 */
export function DeleteAccountDialog() {
  const [open, setOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState("");
  const [state, formAction, pending] = useActionState(deleteAccount, initialActionState);
  // Errors from a previous attempt should not greet the person when they reopen.
  const [dismissedState, setDismissedState] = React.useState<AuthActionState | null>(null);

  const ready = confirmation.trim().toLowerCase() === DELETE_CONFIRMATION_WORD;
  const visibleState = state === dismissedState ? initialActionState : state;
  const fieldError = visibleState.ok ? undefined : visibleState.fieldErrors?.confirmation;
  const formError = visibleState.ok ? undefined : visibleState.error;

  function handleOpenChange(nextOpen: boolean) {
    if (pending) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setConfirmation("");
      setDismissedState(state);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="danger">Delete my account</Button>
      </AlertDialogTrigger>

      <AlertDialogContent
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <div className="flex items-start gap-3">
          <span className="bg-danger-soft text-danger mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-md">
            <TriangleAlert className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <AlertDialogTitle className="text-2xl">Delete your account?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted mt-2 text-sm leading-relaxed">
              This removes your account and every journal entry, permanently. It cannot be undone. If you
              would like a copy first, you can{" "}
              <a
                href="/api/export"
                download
                className="text-primary hover:text-primary-hover rounded-sm font-medium underline underline-offset-4"
              >
                download your writing
              </a>{" "}
              before you continue.
            </AlertDialogDescription>
          </div>
        </div>

        <form action={formAction} className="mt-6 space-y-4" aria-busy={pending || undefined}>
          <Field
            id="delete-confirmation"
            label={`Type ${DELETE_CONFIRMATION_WORD} to confirm`}
            error={fieldError}
          >
            {(props) => (
              <Input
                {...props}
                name="confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                disabled={pending}
              />
            )}
          </Field>

          <FormError message={formError} />

          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel disabled={pending}>Keep my account</AlertDialogCancel>
            <Button type="submit" variant="danger" disabled={!ready} loading={pending} loadingText="Deleting">
              Delete my account
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
