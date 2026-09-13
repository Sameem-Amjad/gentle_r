import { cn } from "@/lib/utils";

/**
 * Stylised hummingbird, inline SVG. Decorative by default (aria-hidden);
 * pass `label` to expose it as an image. The float animation is decorative
 * and switches off under reduced motion via the .motion-decor rule.
 *
 * Placeholder art: swap for the supplied hummingbird reference once
 * permission and provenance are confirmed (see docs/CONTENT.md).
 */
export function Hummingbird({
  className,
  label,
  float = true,
}: {
  className?: string;
  label?: string;
  float?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 160"
      className={cn(float && "motion-decor animate-float", className)}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient id="hb-body" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="var(--teal-500)" />
          <stop offset="1" stopColor="var(--forest-600)" />
        </linearGradient>
        <linearGradient id="hb-wing" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0" stopColor="var(--sage-300)" />
          <stop offset="1" stopColor="var(--moss-500)" />
        </linearGradient>
        <linearGradient id="hb-tail" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--bark-600)" />
          <stop offset="1" stopColor="var(--tan-400)" />
        </linearGradient>
      </defs>

      {/* Tail feathers */}
      <path d="M62 96 C40 110, 22 128, 14 146 C34 134, 52 122, 70 108 Z" fill="url(#hb-tail)" opacity="0.9" />
      <path d="M68 100 C50 118, 40 134, 36 152 C52 138, 66 124, 78 110 Z" fill="var(--bark-700)" opacity="0.85" />

      {/* Rear wing (softer) */}
      <path
        d="M96 78 C72 44, 46 26, 22 22 C40 46, 62 68, 92 86 Z"
        fill="url(#hb-wing)"
        opacity="0.55"
      />

      {/* Body */}
      <path
        d="M60 100 C70 72, 96 60, 124 62 C148 64, 160 76, 164 84 C150 96, 126 108, 100 112 C84 114, 70 110, 60 100 Z"
        fill="url(#hb-body)"
      />
      {/* Throat / breast highlight */}
      <path d="M96 106 C110 104, 128 96, 146 86 C132 100, 114 108, 96 110 Z" fill="var(--rose-500)" opacity="0.55" />
      <path d="M78 104 C90 100, 100 100, 112 104 C100 110, 88 110, 78 104 Z" fill="var(--cream-50)" opacity="0.6" />

      {/* Head */}
      <circle cx="152" cy="72" r="15" fill="var(--forest-700)" />
      <circle cx="157" cy="69" r="2.4" fill="var(--cream-50)" />
      <circle cx="157.6" cy="69.4" r="1.2" fill="var(--forest-900)" />

      {/* Beak */}
      <path d="M165 72 L196 66 L166 76 Z" fill="var(--bark-800)" />

      {/* Front wing */}
      <path
        d="M104 80 C92 52, 74 30, 52 14 C66 44, 84 70, 108 92 Z"
        fill="url(#hb-wing)"
        opacity="0.95"
      />
    </svg>
  );
}
