"use client";

import * as React from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import type { AutosaveState } from "@/lib/journal/autosave-machine";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useLocalDateTime } from "./local-date-time";

interface SaveStatusProps {
  state: AutosaveState;
  onRetry: () => void;
  onCopy: () => void;
  className?: string;
}

/** Calm wording for content-free error codes. */
export function describeSaveError(code: string | null): string {
  switch (code) {
    case "too-long":
      return "This entry is longer than we can save. Copy your text somewhere safe, then shorten it.";
    case "signed-out":
      return "You seem to be signed out. Copy your text, then sign in again.";
    case "not-found":
      return "This entry no longer exists on the server. Copy your text to keep it.";
    case "unconfigured":
      return "Saving isn't available on this preview. Copy your text to keep it.";
    default:
      return "Couldn't save. Your text is still here.";
  }
}

function SavedAt({ value }: { value: string }) {
  const time = useLocalDateTime(value, "time");
  return <>Saved at {time}</>;
}

/**
 * Live save indicator. Announces politely so screen readers hear changes
 * without interrupting typing. "Saved" appears only after the server
 * confirmed the save.
 */
export function SaveStatus({ state, onRetry, onCopy, className }: SaveStatusProps) {
  const { status } = state;

  let content: React.ReactNode = null;
  switch (status) {
    case "idle":
      content = <span className="text-faint">Not saved yet. It saves as you write.</span>;
      break;
    case "unsaved":
      content = <span className="text-muted">Unsaved changes</span>;
      break;
    case "saving":
      content = (
        <span className="text-muted inline-flex items-center gap-1.5">
          <Spinner className="size-3.5" label="Saving" />
          Saving
        </span>
      );
      break;
    case "saved":
      content = (
        <span className="text-success inline-flex items-center gap-1.5">
          <CircleCheck className="size-4" aria-hidden="true" />
          {state.savedAt ? <SavedAt value={state.savedAt} /> : "Saved"}
        </span>
      );
      break;
    case "error":
      content = (
        <span className="text-danger inline-flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
            {describeSaveError(state.error)}
          </span>
          <span className="inline-flex gap-1">
            <Button variant="ghost" size="sm" className="text-danger h-8 px-2.5" onClick={onRetry}>
              Retry
            </Button>
            <Button variant="ghost" size="sm" className="text-danger h-8 px-2.5" onClick={onCopy}>
              Copy text
            </Button>
          </span>
        </span>
      );
      break;
    case "conflict":
      // The ConflictBanner explains this; keep the status quiet.
      content = <span className="text-muted">Not saved</span>;
      break;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Save status"
      className={cn("text-sm", className)}
    >
      <span key={status} className="animate-fade-in motion-decor inline-block">
        {content}
      </span>
    </div>
  );
}
