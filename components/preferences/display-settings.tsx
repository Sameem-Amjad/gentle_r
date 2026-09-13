"use client";

import * as React from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { usePreferences } from "./preferences-provider";
import type { MotionPreference, TextSizePreference, ThemePreference } from "./types";

/**
 * "Display" settings: motion, text size and theme. Everything the page does
 * with animation is controllable from here, and the choice is remembered on
 * this device only (nothing is sent to the server).
 */
export function DisplaySettings({ triggerClassName }: { triggerClassName?: string }) {
  const { preferences, setPreferences, reset } = usePreferences();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={triggerClassName} aria-label="Display settings">
          <Settings2 className="size-5" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="display-settings-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">Display</DialogTitle>
          <DialogDescription id="display-settings-description">
            Adjust how this site looks and moves. Saved on this device only.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <SegmentedControl<MotionPreference>
            name="motion"
            legend="Motion"
            value={preferences.motion}
            onChange={(motion) => setPreferences({ motion })}
            options={[
              { value: "system", label: "Auto", description: "Follow your device setting" },
              { value: "full", label: "Full", description: "Gentle animation everywhere" },
              { value: "reduced", label: "Reduced", description: "Fades only, no movement" },
              { value: "off", label: "Off", description: "No animation at all" },
            ]}
            hint="Auto follows your device's reduce-motion setting."
          />

          <SegmentedControl<TextSizePreference>
            name="textSize"
            legend="Text size"
            value={preferences.textSize}
            onChange={(textSize) => setPreferences({ textSize })}
            options={[
              { value: "default", label: "Default" },
              { value: "large", label: "Large" },
              { value: "larger", label: "Larger" },
            ]}
            hint="Browser zoom works too."
          />

          <SegmentedControl<ThemePreference>
            name="theme"
            legend="Theme"
            value={preferences.theme}
            onChange={(theme) => setPreferences({ theme })}
            options={[
              { value: "system", label: "Auto" },
              { value: "light", label: "Daylight" },
              { value: "dark", label: "Evening" },
            ]}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset to defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
