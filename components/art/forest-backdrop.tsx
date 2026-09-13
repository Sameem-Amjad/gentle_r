import { cn } from "@/lib/utils";

/**
 * Layered forest silhouette rendered as inline SVG. Deterministic (seeded)
 * so server and client markup match. Colours come from CSS variables so the
 * scene follows the theme. Sits behind content at low contrast; content
 * surfaces are translucent cream so text stays readable.
 *
 * Placeholder art: the brief's supplied forest reference image should be
 * placed in public/images and swapped in via <ForestBackdrop image="/images/forest.jpg" />
 * once permission and provenance are confirmed.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function conifer(x: number, base: number, h: number, w: number): string {
  // Three tiers, slightly irregular, drawn as a closed path.
  const t1 = base - h * 0.34;
  const t2 = base - h * 0.64;
  const top = base - h;
  const pts: [number, number][] = [
    [x - w * 0.5, base],
    [x - w * 0.36, t1],
    [x - w * 0.44, t1],
    [x - w * 0.26, t2],
    [x - w * 0.32, t2],
    [x, top],
    [x + w * 0.32, t2],
    [x + w * 0.26, t2],
    [x + w * 0.44, t1],
    [x + w * 0.36, t1],
    [x + w * 0.5, base],
  ];
  return `M${pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join("L")}Z`;
}

function layer(seed: number, count: number, base: number, hMin: number, hMax: number, wRatio: number): string {
  const rnd = mulberry32(seed);
  const paths: string[] = [];
  const step = 1600 / count;
  for (let i = 0; i < count; i++) {
    const x = -60 + i * step + rnd() * step * 0.8;
    const h = hMin + rnd() * (hMax - hMin);
    const w = h * wRatio * (0.85 + rnd() * 0.3);
    paths.push(conifer(x, base + rnd() * 10, h, w));
  }
  return paths.join(" ");
}

const FAR = layer(11, 34, 620, 120, 210, 0.42);
const MID = layer(23, 26, 700, 180, 300, 0.46);
const NEAR = layer(37, 18, 800, 260, 420, 0.5);
const FRONT = layer(53, 12, 920, 300, 520, 0.52);

export function ForestBackdrop({ className, image }: { className?: string; image?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}
      data-forest-backdrop
    >
      {image ? (
        <div
          className="absolute inset-0 bg-cover bg-bottom opacity-30 dark:opacity-25"
          style={{ backgroundImage: `url(${image})` }}
        />
      ) : null}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-[62vh] w-full min-w-[900px] sm:h-[58vh]"
        role="presentation"
      >
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--sky-top)" />
            <stop offset="1" stopColor="var(--sky-bottom)" />
          </linearGradient>
          <linearGradient id="fadeTop" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--bg)" stopOpacity="1" />
            <stop offset="0.45" stopColor="var(--bg)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="sun" cx="0.78" cy="0.18" r="0.5">
            <stop offset="0" stopColor="var(--cream-50)" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--cream-50)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#sky)" />
        <rect width="1440" height="900" fill="url(#sun)" className="dark:opacity-20" />
        <g className="motion-decor animate-drift" style={{ animationDuration: "60s" }}>
          <path d={FAR} fill="var(--forest-far)" opacity="0.9" />
        </g>
        <ellipse cx="720" cy="680" rx="900" ry="80" fill="var(--mist)" />
        <path d={MID} fill="var(--forest-mid)" opacity="0.95" />
        <ellipse cx="500" cy="790" rx="700" ry="60" fill="var(--mist)" />
        <path d={NEAR} fill="var(--forest-near)" />
        <ellipse cx="1000" cy="880" rx="900" ry="50" fill="var(--mist)" />
        <path d={FRONT} fill="var(--forest-front)" />
        <rect width="1440" height="900" fill="url(#fadeTop)" />
      </svg>
      {/* Soft vignette so headings over the forest stay readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--bg)_100%)] opacity-60" />
    </div>
  );
}
