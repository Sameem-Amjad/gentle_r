import { expect, test, type Page } from "@playwright/test";

/**
 * Smoke tests for everything a signed-out visitor can reach. They run in the
 * "desktop" and "phone" projects from playwright.config.ts against a local
 * production build. Account and journal flows need a Supabase project and
 * are checked manually (docs/TESTING.md).
 */

const LESSON_PATH = /^\/lessons\/[a-z0-9-]+\/[a-z0-9-]+$/;
/** The same shape at the end of a full URL, for toHaveURL. */
const LESSON_URL = /\/lessons\/[a-z0-9-]+\/[a-z0-9-]+$/;

/** Distinct lesson links inside <main> on the lesson list page. */
async function lessonHrefs(page: Page): Promise<string[]> {
  const links = page.getByRole("main").locator('a[href^="/lessons/"]');
  await expect(links.first()).toBeVisible();
  const hrefs = await links.evaluateAll((elements) =>
    elements.map((el) => el.getAttribute("href") ?? "").filter(Boolean),
  );
  return Array.from(new Set(hrefs.filter((href) => LESSON_PATH.test(href))));
}

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    `document is ${scrollWidth}px wide but the viewport is ${clientWidth}px`,
  ).toBeLessThanOrEqual(clientWidth + 1);
}

test.describe("home", () => {
  test("renders a heading and the two main links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const main = page.getByRole("main");
    await expect(main.getByRole("link", { name: /read a lesson/i }).first()).toBeVisible();
    await expect(main.getByRole("link", { name: /my journal/i }).first()).toBeVisible();
  });

  test("the skip link is the first Tab stop", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard navigation is checked in the desktop project.");
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /skip to content/i })).toBeFocused();
  });
});

test.describe("lessons", () => {
  test("lists three lessons and opens the first one", async ({ page }) => {
    await page.goto("/lessons");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const hrefs = await lessonHrefs(page);
    expect(hrefs).toHaveLength(3);

    await page.getByRole("main").locator(`a[href="${hrefs[0]}"]`).first().click();

    await expect(page).toHaveURL(LESSON_URL);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /small action/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /sources/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /next/i }).first()).toBeVisible();
  });
});

test.describe("help and policies", () => {
  test("help shows the support email as a mailto link", async ({ page }) => {
    await page.goto("/help");
    await expect(page.getByRole("heading", { level: 1, name: "Help" })).toBeVisible();

    const mailLink = page.getByRole("main").locator('a[href^="mailto:"]').first();
    await expect(mailLink).toBeVisible();
    await expect(mailLink).toHaveAttribute("href", /^mailto:.+@.+/);
  });

  for (const path of ["/privacy", "/terms"]) {
    test(`${path} shows the draft notice`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("main").getByText(/draft wording/i)).toBeVisible();
      await expect(page.getByRole("main").getByText(/last updated/i)).toBeVisible();
    });
  }
});

test.describe("display settings", () => {
  test("motion can be switched off and the choice survives a reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Display settings" }).click();

    const dialog = page.getByRole("dialog", { name: "Display" });
    await expect(dialog).toBeVisible();

    // The radio input is visually hidden; the label text is what a person clicks.
    await dialog.getByText("Off", { exact: true }).click();
    await expect(dialog.getByRole("radio", { name: "Off" })).toBeChecked();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  });
});

test.describe("private areas", () => {
  test("visiting the journal while signed out redirects to sign in", async ({ page }) => {
    await page.goto("/journal");
    await expect(page).toHaveURL(/\/sign-in\?next=(%2F|\/)journal$/);
  });
});

test.describe("phone layout", () => {
  test.skip(({ isMobile }) => !isMobile, "Runs in the phone project only.");

  test("home has no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("a lesson page has no horizontal overflow", async ({ page }) => {
    await page.goto("/lessons");
    const [first] = await lessonHrefs(page);
    expect(first).toBeTruthy();

    await page.goto(first);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
