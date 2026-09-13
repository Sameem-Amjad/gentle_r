import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Pending, PolicyLayout, PolicySection, type PolicyTocItem } from "@/components/policy";

export const metadata: Metadata = {
  title: "Privacy notice (draft)",
  description:
    "What this app stores, why, where, and who can see it. Draft wording pending the owner's review.",
};

const LAST_UPDATED = "2026-09-14";

const toc: PolicyTocItem[] = [
  { id: "who-we-are", title: "Who we are" },
  { id: "what-we-collect", title: "What we collect" },
  { id: "why-we-use-it", title: "Why we use it" },
  { id: "where-it-is-stored", title: "Where it is stored" },
  { id: "who-can-see-your-writing", title: "Who can see your writing" },
  { id: "cookies", title: "Cookies" },
  { id: "keeping-and-deleting", title: "Keeping and deleting" },
  { id: "your-rights", title: "Your rights" },
  { id: "children", title: "Children" },
  { id: "changes", title: "Changes" },
  { id: "contact", title: "Contact" },
];

export default function PrivacyPage() {
  const email = siteConfig.supportEmail;
  const mailto = `mailto:${email}`;

  return (
    <PolicyLayout
      eyebrow="Privacy"
      title="Privacy notice"
      description="What this app stores, why, where, and who can see it. Written plainly."
      lastUpdated={LAST_UPDATED}
      toc={toc}
      draftNote="Square brackets mark details still to be decided."
    >
      <PolicySection id="who-we-are" title="Who we are">
        <p>
          {siteConfig.name} is run by {siteConfig.ownerName}. It offers three short lessons that anyone can
          read, and one private journal for people who choose to make an account.
        </p>
        <p>
          This notice explains what personal information the app handles and why. If anything here is unclear,
          email <a href={mailto}>{email}</a>.
        </p>
      </PolicySection>

      <PolicySection id="what-we-collect" title="What we collect">
        <p>Only what the account and the journal need to work:</p>
        <ul>
          <li>Your email address, used to sign in and to send account emails.</li>
          <li>
            Your password, kept only as a hash by our authentication provider. We never see or store the
            password itself.
          </li>
          <li>
            The journal text you write: each entry&rsquo;s title, body, and the times it was created and last
            edited.
          </li>
          <li>
            Basic technical logs, such as IP address and browser type, held briefly by our hosting providers
            to run and protect the service.
          </li>
        </ul>
        <p>
          We do not ask for your name, phone number, date of birth or payment details. Display preferences
          (theme, text size, motion) stay in your browser and are not sent to us.
        </p>
      </PolicySection>

      <PolicySection id="why-we-use-it" title="Why we use it">
        <p>
          To provide your account and your journal, and to send the emails those need: verifying your address,
          resetting a forgotten password, and confirming changes to your account.
        </p>
        <p>
          Nothing else. There is no marketing, no profiling, no selling of data, and your writing is never
          used to train software or AI systems.
        </p>
      </PolicySection>

      <PolicySection id="where-it-is-stored" title="Where it is stored">
        <p>
          Accounts and journal entries are stored by Supabase in the{" "}
          <Pending>Supabase project region</Pending>. The app itself is hosted on <Pending>Vercel</Pending>.
          Both providers encrypt data in transit and at rest.
        </p>
        <p>
          <Pending>
            Confirm the region, the hosting provider and any data-transfer terms before launch.
          </Pending>
        </p>
      </PolicySection>

      <PolicySection id="who-can-see-your-writing" title="Who can see your writing">
        <p>
          Only you. Every journal entry is tied to your account, and the database itself enforces that rule on
          every request. Staff do not read journal entries, and the app is built so that private writing never
          appears in logs, error reports or analytics.
        </p>
        <p>
          There are no analytics or advertising services and no third-party tracking scripts on any page. We
          may see technical error codes when something goes wrong, but not the text you wrote.
        </p>
        <p>
          <Pending>
            Wording about how lawful requests from authorities would be handled is to be agreed.
          </Pending>
        </p>
      </PolicySection>

      <PolicySection id="cookies" title="Cookies">
        <p>
          One sign-in cookie, set by our authentication provider, keeps you signed in between visits. It is
          removed when you sign out.
        </p>
        <p>
          Your display preferences are kept in your browser&rsquo;s local storage, on your device only. There
          are no advertising, analytics or tracking cookies.
        </p>
      </PolicySection>

      <PolicySection id="keeping-and-deleting" title="Keeping and deleting">
        <p>We keep your account and entries for as long as your account exists.</p>
        <ul>
          <li>
            You can download all of your writing at any time from <Link href="/account">Account</Link>.
            Exporting does not remove anything.
          </li>
          <li>You can edit or delete individual entries whenever you like.</li>
          <li>
            Deleting your account removes the account and all of its entries from the live database
            immediately.
          </li>
          <li>
            Backup copies kept by our providers expire within <Pending>N days</Pending> and are used only to
            recover from failures.
          </li>
        </ul>
        <p>
          <Pending>Confirm the backup retention period with the storage provider.</Pending>
        </p>
      </PolicySection>

      <PolicySection id="your-rights" title="Your rights">
        <p>You can, at any time and without asking us:</p>
        <ul>
          <li>See everything we hold about you by signing in.</li>
          <li>Export your writing as a plain text file.</li>
          <li>Correct anything by editing it.</li>
          <li>Delete individual entries or your whole account.</li>
        </ul>
        <p>
          For anything else, including questions about this notice, email <a href={mailto}>{email}</a>. We
          will reply by email.
        </p>
        <p>
          <Pending>
            Add the legal basis for processing and the relevant data-protection authority once the operating
            jurisdiction is confirmed.
          </Pending>
        </p>
      </PolicySection>

      <PolicySection id="children" title="Children">
        <p>
          This app is for adults aged {siteConfig.minimumAge} and over. We do not knowingly hold accounts for
          anyone younger. If you believe such an account exists, email us and we will remove it.
        </p>
      </PolicySection>

      <PolicySection id="changes" title="Changes">
        <p>
          If this notice changes, we will update this page and the date at the top.{" "}
          <Pending>Decide whether and how significant changes are announced inside the app.</Pending>
        </p>
      </PolicySection>

      <PolicySection id="contact" title="Contact">
        <p>
          {siteConfig.ownerName}, <a href={mailto}>{email}</a>.
        </p>
        <p>
          <Pending>Add a postal address if one is required in the operating jurisdiction.</Pending>
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
