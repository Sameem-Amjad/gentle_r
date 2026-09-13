"use client";

import * as React from "react";
import { GitCompareArrows } from "lucide-react";
import type { ConflictVersion } from "@/lib/journal/autosave-machine";
import { Button } from "@/components/ui/button";
import { LocalDateTime } from "./local-date-time";

interface ConflictBannerProps {
  current: ConflictVersion;
  onUseTheirs: () => void;
  onKeepMine: () => void;
  onCopyMine: () => void;
}

/**
 * Shown when another tab or device saved a newer version. Nothing is
 * overwritten until the person chooses.
 */
export function ConflictBanner({ current, onUseTheirs, onKeepMine, onCopyMine }: ConflictBannerProps) {
  return (
    <div
      role="alert"
      className="border-accent/40 bg-accent-soft/60 text-text shadow-soft rounded-lg border p-4 text-sm sm:p-5"
    >
      <div className="flex items-start gap-3">
        <GitCompareArrows className="text-accent mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">This entry was changed somewhere else.</p>
          <p className="text-muted mt-1">
            Another tab or device saved it at <LocalDateTime value={current.updated_at} />. Which version do
            you want to keep? Your text stays here until you decide.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={onKeepMine}>
              Keep mine
            </Button>
            <Button size="sm" variant="secondary" onClick={onUseTheirs}>
              Use that version
            </Button>
            <Button size="sm" variant="ghost" onClick={onCopyMine}>
              Copy my text
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
