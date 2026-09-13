"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(function Switch({ className, ...props }, ref) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-border-strong/50 bg-surface-2 p-0.5",
        "transition-colors duration-200 data-[state=checked]:bg-primary disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5.5 rounded-full bg-surface shadow-soft transition-transform duration-200 data-[state=checked]:translate-x-5 data-[state=checked]:bg-primary-fg" />
    </SwitchPrimitive.Root>
  );
});
