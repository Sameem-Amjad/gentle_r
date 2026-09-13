import * as React from "react";
import { cn } from "@/lib/utils";
import { inputClasses } from "./input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(inputClasses, "min-h-32 resize-y leading-relaxed", className)} {...props} />;
  },
);
