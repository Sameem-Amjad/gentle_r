"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors duration-200 hover:text-text",
        active && "text-text",
        className,
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary transition-opacity duration-200",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </Link>
  );
}
