"use client";

import * as React from "react";
import { LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecoveredDraftBannerProps {
  onRestore: () => void;
  onDiscard: () => void;
}

/** Offers back writing that was kept on this device after a failed save. */
export function RecoveredDraftBanner({ onRestore, onDiscard }: RecoveredDraftBannerProps) {
  return (
    <div
      role="status"
      className="border-primary/30 bg-primary-soft/60 text-text shadow-soft rounded-lg border p-4 text-sm sm:p-5"
    >
      <div className="flex items-start gap-3">
        <LifeBuoy className="text-primary mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">We kept writing from earlier on this device that didn&apos;t save.</p>
          <p className="text-muted mt-1">You can bring it back into this entry, or leave it out.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={onRestore}>
              Restore it
            </Button>
            <Button size="sm" variant="ghost" onClick={onDiscard}>
              Discard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
