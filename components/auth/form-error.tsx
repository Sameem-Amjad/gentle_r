import * as React from "react";
import { CircleAlert } from "lucide-react";

/**
 * Form-level error region. Always rendered so the live region exists before
 * a message arrives, which is what makes screen readers announce it.
 */
export function FormError({ message, id }: { message?: string; id?: string }) {
  return (
    <div id={id} role="alert" aria-live="polite" className="min-h-0">
      {message ? (
        <p className="border-danger/30 bg-danger-soft text-danger flex items-start gap-2.5 rounded-md border px-3.5 py-2.5 text-sm">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </p>
      ) : null}
    </div>
  );
}
