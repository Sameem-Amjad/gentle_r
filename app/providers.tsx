"use client";

import * as React from "react";
import { siteConfig } from "@/config/site";
import { PreferencesProvider } from "@/components/preferences/preferences-provider";
import { MotionProvider } from "@/components/motion/motion-provider";
import { ToastProvider } from "@/components/ui/toast";
import { AuthStatusProvider } from "@/components/shell/auth-status-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesProvider defaultMotion={siteConfig.features.defaultMotion} defaultTheme={siteConfig.features.defaultTheme}>
      <MotionProvider>
        <AuthStatusProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthStatusProvider>
      </MotionProvider>
    </PreferencesProvider>
  );
}
