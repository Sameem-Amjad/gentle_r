"use client";

import * as React from "react";
import { MotionConfig } from "motion/react";
import { usePreferences } from "@/components/preferences/preferences-provider";

/**
 * Bridges the user's motion preference into framer-motion. "reduced" and
 * "off" disable transform/layout animation (opacity fades still run for
 * "reduced"; CSS removes everything for "off").
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const { preferences } = usePreferences();
  const reducedMotion =
    preferences.motion === "full" ? "never" : preferences.motion === "system" ? "user" : "always";

  return (
    <MotionConfig reducedMotion={reducedMotion} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </MotionConfig>
  );
}

/** True when the user wants no decorative motion at all. */
export function useMotionOff(): boolean {
  const { preferences } = usePreferences();
  return preferences.motion === "off";
}
