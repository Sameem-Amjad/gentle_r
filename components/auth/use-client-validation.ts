"use client";

import * as React from "react";
import { z } from "zod";
import type { FieldErrors } from "@/lib/auth/errors";

/**
 * Light, early feedback before a form is sent. The server runs the same
 * schema again and is the real check; this only saves a round trip for
 * obvious slips like an empty field.
 */
export function useClientValidation(schema: z.ZodType) {
  const [clientErrors, setClientErrors] = React.useState<FieldErrors | null>(null);

  const onSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      const data: Record<string, string> = {};
      new FormData(event.currentTarget).forEach((value, key) => {
        if (typeof value === "string") data[key] = value;
      });
      const result = schema.safeParse(data);
      if (!result.success) {
        event.preventDefault();
        setClientErrors(z.flattenError(result.error).fieldErrors as FieldErrors);
        return;
      }
      setClientErrors(null);
    },
    [schema],
  );

  const clear = React.useCallback(() => setClientErrors(null), []);

  return { clientErrors, onSubmit, clear };
}
