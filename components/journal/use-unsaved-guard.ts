"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export const LEAVE_MESSAGE = "Your latest changes have not saved yet. Leave anyway?";

interface UseUnsavedGuardOptions {
  /** True while writing is unsaved or a save is still running. */
  active: boolean;
  /** Saves now; resolves true when nothing is left unsaved. */
  saveNow: () => Promise<boolean>;
}

function findAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  const anchor = target.closest("a[href]");
  return anchor instanceof HTMLAnchorElement ? anchor : null;
}

function shouldIgnore(anchor: HTMLAnchorElement, event: MouseEvent): boolean {
  if (event.defaultPrevented) return true;
  if (event.button !== 0) return true;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return true;
  if (anchor.target && anchor.target !== "_self") return true;
  if (anchor.hasAttribute("download")) return true;
  const href = anchor.getAttribute("href") ?? "";
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return true;
  return false;
}

/**
 * Protects unsaved writing. Closing or reloading the tab asks the browser's
 * standard question. Clicking a same-origin link first saves; if that save
 * cannot be confirmed, the person is asked before leaving.
 */
export function useUnsavedGuard({ active, saveNow }: UseUnsavedGuardOptions): void {
  const router = useRouter();
  const activeRef = React.useRef(active);
  const saveNowRef = React.useRef(saveNow);

  React.useEffect(() => {
    activeRef.current = active;
    saveNowRef.current = saveNow;
  }, [active, saveNow]);

  React.useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!activeRef.current) return;
      event.preventDefault();
      // Older browsers need a value; modern ones show their own wording.
      event.returnValue = LEAVE_MESSAGE;
    };

    const onClick = (event: MouseEvent) => {
      if (!activeRef.current) return;
      const anchor = findAnchor(event.target);
      if (!anchor || shouldIgnore(anchor, event)) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      // Take over the navigation: save first, then continue.
      event.preventDefault();
      event.stopPropagation();
      const destination = `${url.pathname}${url.search}${url.hash}`;

      void saveNowRef.current().then((saved) => {
        if (saved || window.confirm(LEAVE_MESSAGE)) {
          router.push(destination);
        }
      });
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [router]);
}
