import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, formatTime, isSafeInternalPath, slugify, withNext } from "@/lib/utils";

describe("isSafeInternalPath", () => {
  it("accepts same-origin relative paths", () => {
    expect(isSafeInternalPath("/")).toBe(true);
    expect(isSafeInternalPath("/journal")).toBe(true);
    expect(isSafeInternalPath("/journal/abc?x=1")).toBe(true);
    expect(isSafeInternalPath("/lessons/gentler/arriving#small-action")).toBe(true);
  });

  it("rejects empty values", () => {
    expect(isSafeInternalPath("")).toBe(false);
    expect(isSafeInternalPath(null)).toBe(false);
    expect(isSafeInternalPath(undefined)).toBe(false);
  });

  it("rejects protocol-relative URLs that would leave the site", () => {
    expect(isSafeInternalPath("//evil.example")).toBe(false);
    expect(isSafeInternalPath("//evil.example/journal")).toBe(false);
  });

  it("rejects absolute URLs and scheme-like paths", () => {
    expect(isSafeInternalPath("https://evil.example/")).toBe(false);
    expect(isSafeInternalPath("javascript:alert(1)")).toBe(false);
    expect(isSafeInternalPath("/javascript:alert(1)")).toBe(false);
    expect(isSafeInternalPath("/HTTP:evil")).toBe(false);
  });

  it("rejects backslashes, which some browsers treat as slashes", () => {
    expect(isSafeInternalPath("/\\evil.example")).toBe(false);
    expect(isSafeInternalPath("/journal\\..\\x")).toBe(false);
  });

  it("rejects relative paths without a leading slash", () => {
    expect(isSafeInternalPath("journal")).toBe(false);
    expect(isSafeInternalPath("./journal")).toBe(false);
    expect(isSafeInternalPath("../journal")).toBe(false);
  });
});

describe("withNext", () => {
  it("returns the path unchanged when there is no next", () => {
    expect(withNext("/sign-in")).toBe("/sign-in");
    expect(withNext("/sign-in", null)).toBe("/sign-in");
    expect(withNext("/sign-in", "")).toBe("/sign-in");
  });

  it("drops unsafe next values instead of encoding them", () => {
    expect(withNext("/sign-in", "//evil.example")).toBe("/sign-in");
    expect(withNext("/sign-in", "https://evil.example")).toBe("/sign-in");
    expect(withNext("/sign-in", "journal")).toBe("/sign-in");
  });

  it("appends an encoded next parameter", () => {
    expect(withNext("/sign-in", "/journal")).toBe("/sign-in?next=%2Fjournal");
    expect(withNext("/sign-in", "/journal/abc?x=1")).toBe("/sign-in?next=%2Fjournal%2Fabc%3Fx%3D1");
  });

  it("keeps existing query parameters and replaces an existing next", () => {
    expect(withNext("/sign-in?mode=code", "/journal")).toBe("/sign-in?mode=code&next=%2Fjournal");
    expect(withNext("/sign-in?next=%2Fold", "/new")).toBe("/sign-in?next=%2Fnew");
  });

  it("round-trips through URLSearchParams", () => {
    const href = withNext("/sign-in", "/journal/abc?x=1&y=2");
    const params = new URL(href, "http://local").searchParams;
    expect(params.get("next")).toBe("/journal/abc?x=1&y=2");
  });
});

describe("slugify", () => {
  it("lower-cases and replaces runs of punctuation with single dashes", () => {
    expect(slugify("Hello, World")).toBe("hello-world");
    expect(slugify("A   quiet   morning")).toBe("a-quiet-morning");
    expect(slugify("What's on your mind?")).toBe("what-s-on-your-mind");
  });

  it("strips accents", () => {
    expect(slugify("Café crème")).toBe("cafe-creme");
    expect(slugify("Señor Ångström")).toBe("senor-angstrom");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify(" -- arriving -- ")).toBe("arriving");
    expect(slugify("!!!")).toBe("");
    expect(slugify("")).toBe("");
  });

  it("caps the result at 60 characters", () => {
    const long = "word ".repeat(40);
    const slug = slugify(long);
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.startsWith("word-word")).toBe(true);
  });
});

describe("date formatting (en-GB)", () => {
  // Local-time constructors keep the calendar day stable in any time zone.
  const september = new Date(2026, 8, 14, 9, 41, 7);
  const march = new Date(2026, 2, 3, 16, 5);

  it("formatDate writes the day, full month and year", () => {
    expect(formatDate(september)).toBe("14 September 2026");
    expect(formatDate(march)).toBe("3 March 2026");
  });

  it("formatDateTime writes a short month and a 24-hour time", () => {
    expect(formatDateTime(march)).toBe("3 Mar 2026, 16:05");
  });

  it("formatTime writes a zero-padded 24-hour time", () => {
    expect(formatTime(september)).toBe("09:41");
    expect(formatTime(march)).toBe("16:05");
  });

  it("accepts ISO strings as well as Date objects", () => {
    const iso = september.toISOString();
    expect(formatDate(iso)).toBe(formatDate(september));
    expect(formatDateTime(iso)).toBe(formatDateTime(september));
    expect(formatTime(iso)).toBe(formatTime(september));
  });

  it("honours an explicit locale", () => {
    expect(formatDate(september, "en-US")).toBe("September 14, 2026");
  });
});
