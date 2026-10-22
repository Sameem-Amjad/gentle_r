/**
 * GentleR — demo seed for the shared Supabase hub (schema public).
 *
 * Creates three demo accounts (@demo.gentler.app, password GentleR@2026) and
 * fills their journals with entries spread over the last seven weeks:
 *   amara.okafor  — a well-used journal (12 entries over seven weeks, some untitled, some after a lesson)
 *   daniel.reyes  — a new habit (3 entries)
 *   hannah.berg   — an empty journal, for the first-time experience
 *
 * Every account gets app_metadata.demo = true, which the app and
 * delete_own_account() use to refuse password changes and deletion.
 *
 * Idempotent: accounts are reused (looked up by email) and their passwords and
 * flags reset; their entries are replaced on every run.
 * Needs the table from supabase/hub/schema.sql.
 *
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
 *     node --experimental-websocket scripts/seed-hub.mjs
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("✗ set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const APP = "journalist"; // hub tag: tagged users get no CMS profile
const PASSWORD = "GentleR@2026";
const DOMAIN = "demo.gentler.app";

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Dates are anchored to the most recent Sunday, so entries that mention a
// weekday ("Sunday afternoon", "an early night on Wednesday") land on one.
// `day(-2, "22:30")` → the Friday before last Sunday at 22:30 UTC.
const today = new Date();
const lastSunday = new Date(
  Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (today.getUTCDay() || 7)),
);
function day(offset, hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(lastSunday);
  d.setUTCDate(d.getUTCDate() + offset);
  d.setUTCHours(h, m, 0, 0);
  return d.toISOString();
}

const PEOPLE = [
  {
    slug: "amara.okafor",
    name: "Amara Okafor",
    entries: [
      {
        at: day(-46, "21:40"),
        title: "First evening here",
        body: "I don't really know how to start this, so I'm just going to say what today was. Long. The train was late, the meeting ran over, and by the time I got home the kitchen light had gone again.\n\nI read the first lesson on my phone while the kettle boiled. The part about taking attendance stayed with me. So: I'm here. Tired shoulders. A bit hungry. Glad the day is over. That's enough for a first entry.",
      },
      {
        at: day(-45, "07:15"),
        title: "",
        body: "Woke before the alarm and didn't reach for my phone straight away. Lay there for a few minutes listening to the rain on the skylight. Small thing, but it felt like the morning was mine for once.",
      },
      {
        at: day(-42, "22:05"),
        title: "After “Arriving”",
        body: "The question was: what do I notice right now, without trying to change it?\n\nMy jaw is clenched. I only noticed because I tried to answer honestly. My feet are cold. There's a dog barking two streets away and the fridge is humming. I feel restless, like I should be doing something more useful than sitting here writing about the fridge.\n\nI'm letting the restlessness sit next to me instead of obeying it. It's quieter after ten minutes.",
      },
      {
        at: day(-38, "19:30"),
        title: "Mum's birthday call",
        body: "Called Mum for her birthday. She told the same story about the caravan holiday in 1994 and I laughed in the right places. I used to get impatient with the repeating. Tonight I mostly felt lucky that she still wants to tell it.\n\nNote to self: send her the photos from the summer before I forget again.",
      },
      {
        at: day(-34, "08:10"),
        edited: day(-30, "12:45"),
        revision: 2,
        title: "One small kindness",
        body: "Today's small action was to do one kind thing without telling anyone.\n\nI left a note on the shared printer thanking whoever keeps refilling the paper. No name. I felt silly writing it, then oddly happy all morning.\n\nThe reflection question asked what kindness I could offer myself too. I think: lunch away from my desk. I managed it on Tuesday and Thursday.",
      },
      {
        at: day(-26, "23:20"),
        title: "",
        body: "Can't sleep. Running through tomorrow's presentation on a loop. Writing it down so it stops circling:\n\n1. Open with the customer quote.\n2. Show the three numbers, not the twelve.\n3. Stop talking when I've made the point.\n\nOkay. It's on paper now. Going to try again.",
      },
      {
        at: day(-25, "18:45"),
        title: "It went fine",
        body: "The presentation went fine. Better than fine, actually. Priya asked for the slides afterwards.\n\nI spent so much energy last night worrying about something that took twenty minutes and went well. Not a lesson I'll learn in one go, but I'm writing it down so I can read it next time.",
      },
      {
        at: day(-22, "16:00"),
        title: "Rest without earning it",
        body: "This lesson was uncomfortable to read. I realised I only let myself sit down once everything is done, and everything is never done.\n\nSo this afternoon I sat in the garden with a cup of tea at four o'clock with the washing still in the machine. The world did not end. The washing waited. I watched a blackbird pull at the lawn for a long time.\n\nI want to try this again on Sunday, on purpose.",
      },
      {
        at: day(-17, "21:10"),
        title: "Walking home the long way",
        body: "Took the canal path instead of the bus. Forty minutes instead of fifteen. Two herons, narrowboats with smoke curling out of their chimneys, and a man teaching his daughter to ride a bike who kept saying \"you've got it, you've got it\" long after she had.",
      },
      {
        at: day(-10, "07:50"),
        title: "",
        body: "A grateful list, because I haven't written one in a while: the first coffee, the radiator finally working, Sam's voice note about the cat, and that the dentist was only a check-up.",
      },
      {
        at: day(-2, "22:30"),
        title: "A harder week",
        body: "This week has been heavy. Work is fine, but I feel flat and I don't fully know why. I'm not going to force a lesson out of it. I'm just noting that it's here, like the first lesson said, without judging it.\n\nThings that helped a little: an early night on Wednesday, a long shower, telling Sam I was having a quiet week instead of pretending.",
      },
      {
        at: day(0, "20:15"),
        title: "Sunday rest, on purpose",
        body: "Did the thing I said I would. Two hours on Sunday afternoon with no list. Read half a novel on the sofa, fell asleep for twenty minutes, and woke up to the light going orange on the wall.\n\nI noticed the urge to make up for it in the evening. I didn't. Ending the weekend rested instead of caught up. That's new.",
      },
    ],
  },
  {
    slug: "daniel.reyes",
    name: "Daniel Reyes",
    entries: [
      {
        at: day(-11, "06:40"),
        title: "Starting small",
        body: "My counsellor suggested writing things down. I'm not a diary person, so I'm keeping it short.\n\nToday: ran 3 km, the first time in months. Legs hate me. Head feels clearer.",
      },
      {
        at: day(-5, "21:00"),
        title: "",
        body: "Bad sleep, short temper with the kids at breakfast. Apologised to Leo before school and he said \"it's okay Dad, you were hungry\". He's not wrong.",
      },
      {
        at: day(-3, "12:30"),
        title: "Lunch break",
        body: 'Read "One Small Kindness" on my lunch break. Bought a coffee for the man who sells the magazine outside the station and asked his name for once. It\'s Kev. We talked about football for five minutes and I went back to work in a better mood than I left.',
      },
    ],
  },
  { slug: "hannah.berg", name: "Hannah Berg", entries: [] },
];

async function findUserByEmail(email) {
  for (let page = 1; ; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit || data.users.length < 1000) return hit ?? null;
  }
}

async function ensureUser({ slug, name }) {
  const email = `${slug}@${DOMAIN}`;
  const attrs = {
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { app: APP, full_name: name },
    app_metadata: { demo: true },
  };
  const existing = await findUserByEmail(email);
  const { data, error } = existing
    ? await sb.auth.admin.updateUserById(existing.id, attrs)
    : await sb.auth.admin.createUser({ email, ...attrs });
  if (error) throw new Error(`${email}: ${error.message}`);
  return data.user;
}

let total = 0;
for (const person of PEOPLE) {
  const user = await ensureUser(person);
  const { error: delError } = await sb.from("journal_entries").delete().eq("user_id", user.id);
  if (delError) throw new Error(`clear entries for ${user.email}: ${delError.message}`);
  if (person.entries.length) {
    const rows = person.entries.map((e) => ({
      user_id: user.id,
      title: e.title,
      body: e.body,
      created_at: e.at,
      updated_at: e.edited ?? e.at,
      revision: e.revision ?? 1,
    }));
    const { error } = await sb.from("journal_entries").insert(rows);
    if (error) throw new Error(`insert entries for ${user.email}: ${error.message}`);
  }
  total += person.entries.length;
  console.log(`✓ ${user.email}: ${person.entries.length} entries`);
}
console.log(`done: ${PEOPLE.length} accounts, ${total} entries (password ${PASSWORD})`);
