"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value"> & {
  value: string;
};

/**
 * A textarea that grows with its content so the page scrolls, not the box.
 * Uses CSS field-sizing where available and measures scrollHeight elsewhere.
 */
export const AutoGrowTextarea = React.forwardRef<HTMLTextAreaElement, Props>(function AutoGrowTextarea(
  { className, value, ...props },
  forwardedRef,
) {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  const resize = React.useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    if ("fieldSizing" in el.style) return; // The browser handles it.
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  React.useLayoutEffect(() => {
    resize();
  }, [value, resize]);

  React.useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  return (
    <textarea
      ref={setRefs}
      value={value}
      rows={1}
      className={cn("block [field-sizing:content] w-full resize-none overflow-hidden", className)}
      {...props}
    />
  );
});
