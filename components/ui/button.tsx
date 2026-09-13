import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap select-none " +
  "transition-[background-color,color,box-shadow,transform] duration-200 ease-out " +
  "disabled:opacity-60 disabled:pointer-events-none " +
  "active:translate-y-px";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-fg shadow-soft hover:bg-primary-hover hover:shadow-lift",
  secondary:
    "bg-surface text-text border border-border-strong/60 shadow-soft hover:bg-surface-2 hover:border-border-strong",
  ghost: "bg-transparent text-text hover:bg-primary-soft/70",
  danger:
    "bg-danger-soft text-danger border border-danger/30 hover:bg-danger hover:text-cream-50",
  link: "bg-transparent text-primary underline underline-offset-4 hover:text-primary-hover rounded-sm px-1",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
  icon: "h-11 w-11 p-0",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render the child element (e.g. next/link) with button styling. */
  asChild?: boolean;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  /** Announced to screen readers while loading. */
  loadingText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", asChild, loading, loadingText, children, disabled, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...(asChild ? {} : { type: props.type ?? "button" })}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className="size-4" />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
});

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}
