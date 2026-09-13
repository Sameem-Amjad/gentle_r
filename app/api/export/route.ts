import { NextResponse, type NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import { hasSupabaseEnv } from "@/lib/env";
import { exportFilename, formatJournalExport } from "@/lib/journal/export";
import { JournalQueryError, listEntriesForExport } from "@/lib/journal/queries";
import { getCurrentUser } from "@/lib/supabase/server";
import { withNext } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TEXT_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
};

/**
 * Downloads every entry the signed-in person has written as one readable
 * UTF-8 text file. Nothing is changed or removed by exporting.
 */
export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return new Response("Accounts are not set up on this preview yet.", {
      status: 503,
      headers: TEXT_HEADERS,
    });
  }

  const user = await getCurrentUser();
  if (!user) {
    const accept = request.headers.get("accept") ?? "";
    if (accept.includes("text/html")) {
      return NextResponse.redirect(new URL(withNext("/sign-in", "/account"), request.url));
    }
    return NextResponse.json(
      { error: "signed-out" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  let entries;
  try {
    entries = await listEntriesForExport(user.id);
  } catch (error) {
    console.error("journal.export failed", error instanceof JournalQueryError ? error.code : "unknown");
    return new Response("We couldn't prepare your export just now. Nothing has changed. Please try again.", {
      status: 500,
      headers: TEXT_HEADERS,
    });
  }

  const now = new Date();
  const text = formatJournalExport(entries, { siteName: siteConfig.name, exportedAt: now, timeZone: "UTC" });

  return new Response(text, {
    status: 200,
    headers: {
      ...TEXT_HEADERS,
      "Content-Disposition": `attachment; filename="${exportFilename(siteConfig.name, now)}"`,
    },
  });
}
