import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

interface FieldProps {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string | string[] | null;
  optional?: boolean;
  className?: string;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
  }) => React.ReactNode;
}

/**
 * Accessible field wrapper: labels the control, links hint and error text
 * with aria-describedby, and announces errors politely.
 */
export function Field({ id, label, hint, error, optional, className, children }: FieldProps) {
  const errors = Array.isArray(error) ? error : error ? [error] : [];
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = errors.length ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {optional ? <span className="text-xs text-faint">Optional</span> : null}
      </div>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": errors.length ? true : undefined })}
      {hint ? (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      <div id={errorId} role="alert" aria-live="polite" className="min-h-0">
        {errors.map((e) => (
          <p key={e} className="text-sm text-danger">
            {e}
          </p>
        ))}
      </div>
    </div>
  );
}
