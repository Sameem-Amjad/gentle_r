import * as React from "react";
import { cn } from "@/lib/utils";

export const inputClasses =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-text placeholder:text-faint " +
  "shadow-[inset_0_1px_2px_rgb(0_0_0/0.03)] transition-[border-color,box-shadow] duration-200 " +
  "hover:border-border-strong focus:border-primary focus:outline-none focus:ring-3 focus:ring-ring/30 " +
  "aria-invalid:border-danger aria-invalid:focus:ring-danger/30 disabled:opacity-60";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(inputClasses, "h-11", className)} {...props} />;
  },
);
