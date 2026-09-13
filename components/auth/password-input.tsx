"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

/**
 * Password field with a show/hide toggle. The toggle is a real button with a
 * stable label and aria-pressed for its state, so it reads the same to
 * everyone.
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className, disabled, ...props },
  ref,
) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn("pr-12", className)}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        aria-pressed={visible}
        aria-label="Show password"
        disabled={disabled}
        onClick={() => setVisible((v) => !v)}
        className={cn(
          "text-muted absolute inset-y-1 right-1 inline-flex w-10 items-center justify-center rounded-sm",
          "hover:bg-surface-2 hover:text-text transition-colors duration-200 disabled:opacity-60",
        )}
      >
        {visible ? (
          <EyeOff className="size-5" aria-hidden="true" />
        ) : (
          <Eye className="size-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
});
