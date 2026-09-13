import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { PreferencesScript } from "@/components/preferences/preferences-script";
import { ForestBackdrop } from "@/components/art/forest-backdrop";
import { SiteHeader } from "@/components/shell/site-header";
import { SiteFooter } from "@/components/shell/site-footer";
import { SkipLink } from "@/components/shell/skip-link";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  robots: { index: true, follow: true },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    siteName: siteConfig.name,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Never block browser zoom.
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7ef" },
    { media: "(prefers-color-scheme: dark)", color: "#14211a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <PreferencesScript
          defaultMotion={siteConfig.features.defaultMotion}
          defaultTheme={siteConfig.features.defaultTheme}
        />
      </head>
      <body className="flex min-h-full flex-col bg-bg text-text">
        <Providers>
          <SkipLink />
          <ForestBackdrop />
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex flex-1 flex-col pb-12 pt-8 outline-none sm:pt-12">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
