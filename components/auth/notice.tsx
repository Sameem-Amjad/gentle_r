import * as React from "react";
import { CircleCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success";

const tones: Record<Tone, { box: string; icon: React.ReactNode }> = {
  info: {
    box: "border-border bg-surface-2/70 text-text",
    icon: <Info className="text-muted size-5 shrink-0" aria-hidden="true" />,
  },
  success: {
    box: "border-sage-300/70 bg-primary-soft text-text",
    icon: <CircleCheck className="text-success size-5 shrink-0" aria-hidden="true" />,
  },
};

/** Calm status message. Announced politely; never blocks anything. */
export function Notice({
  tone = "info",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-md border px-4 py-3 text-sm leading-relaxed",
        tones[tone].box,
        className,
      )}
      {...props}
    >
      <span className="mt-0.5">{tones[tone].icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
