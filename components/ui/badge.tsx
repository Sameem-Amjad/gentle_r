import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "green" | "brown" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted border-border",
  green: "bg-primary-soft text-primary border-sage-300/60",
  brown: "bg-accent-soft text-accent border-tan-400/50",
  danger: "bg-danger-soft text-danger border-danger/30",
};

export function Badge({ className, tone = "neutral", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
