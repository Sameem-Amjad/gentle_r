"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  description?: string;
}

interface SegmentedControlProps<T extends string> {
  name: string;
  legend: React.ReactNode;
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  hint?: React.ReactNode;
  className?: string;
}

/** Radio group styled as a segmented control. Keyboard: arrows move, Space/Enter select. */
export function SegmentedControl<T extends string>({
  name,
  legend,
  value,
  onChange,
  options,
  hint,
  className,
}: SegmentedControlProps<T>) {
  const hintId = hint ? `${name}-hint` : undefined;
  return (
    <fieldset className={cn("space-y-2", className)} aria-describedby={hintId}>
      <legend className="text-sm font-medium text-text">{legend}</legend>
      <div className="grid gap-1 rounded-md border border-border bg-surface-2 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((option) => {
          const checked = option.value === value;
          const id = `${name}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center rounded-sm px-2 py-2 text-center text-sm transition-colors duration-200",
                checked ? "bg-surface text-text shadow-soft" : "text-muted hover:text-text",
              )}
              title={option.description}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span className="pointer-events-none absolute inset-0 rounded-sm ring-ring peer-focus-visible:ring-3" aria-hidden="true" />
              <span className="font-medium">{option.label}</span>
            </label>
          );
        })}
      </div>
      {hint ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}
