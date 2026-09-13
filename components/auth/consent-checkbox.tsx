"use client";

import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { VisuallyHidden } from "@/components/ui";

interface ConsentCheckboxProps {
  id: string;
  name: string;
  error?: string[] | null;
}

function PolicyLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener"
      className="text-primary hover:text-primary-hover rounded-sm font-medium underline underline-offset-4"
    >
      {children}
      <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
    </Link>
  );
}

/** Age and policy consent. A native checkbox keeps keyboard and form behaviour simple. */
export function ConsentCheckbox({ id, name, error }: ConsentCheckboxProps) {
  const errors = error ?? [];
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          value="on"
          aria-describedby={errors.length ? errorId : undefined}
          aria-invalid={errors.length ? true : undefined}
          className="border-border-strong accent-primary mt-1 size-5 shrink-0 cursor-pointer rounded-sm"
        />
        <label htmlFor={id} className="text-text cursor-pointer text-sm leading-relaxed">
          I am {siteConfig.minimumAge} or older and I accept the{" "}
          <PolicyLink href={siteConfig.links.terms}>use policy</PolicyLink> and{" "}
          <PolicyLink href={siteConfig.links.privacy}>privacy notice</PolicyLink>.
        </label>
      </div>
      <div id={errorId} role="alert" aria-live="polite" className="min-h-0">
        {errors.map((message) => (
          <p key={message} className="text-danger text-sm">
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}
