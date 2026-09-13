/**
 * Used by app/template.tsx so each route change fades and rises in.
 * CSS-driven (see .page-enter in app/globals.css): the template remounts on
 * navigation, which replays the animation; without JavaScript the page still
 * renders and simply fades in once.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="page-enter flex min-h-0 flex-1 flex-col">{children}</div>;
}
