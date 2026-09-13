import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Pending, PolicyLayout, PolicySection, type PolicyTocItem } from "@/components/policy";

export const metadata: Metadata = {
  title: "Use policy (draft)",
  description:
    "Who may use this app, what it is and is not, and how we look after your account. Draft wording.",
};

const LAST_UPDATED = "2026-09-14";

const toc: PolicyTocItem[] = [
  { id: "who-may-use-this", title: "Who may use this" },
  { id: "what-this-is", title: "What this is and is not" },
  { id: "your-account", title: "Your account" },
  { id: "your-content", title: "Your content" },
  { id: "acceptable-use", title: "Acceptable use" },
  { id: "availability", title: "Availability" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  const email = siteConfig.supportEmail;
  const mailto = `mailto:${email}`;

  return (
    <PolicyLayout
      eyebrow="Use policy"
      title="Use policy"
      description="A short, plain description of how this app may be used and what you can expect from it."
      lastUpdated={LAST_UPDATED}
      toc={toc}
      draftNote="Square brackets mark details still to be decided."
    >
      <PolicySection id="who-may-use-this" title="Who may use this">
        <p>
          {siteConfig.name} is for adults aged {siteConfig.minimumAge} and over, for personal use. By making
          an account you confirm that you are at least {siteConfig.minimumAge}.
        </p>
        <p>The app is run by {siteConfig.ownerName}.</p>
      </PolicySection>

      <PolicySection id="what-this-is" title="What this is and is not">
        <p>
          This app offers three short lessons to read at your own pace, and one private journal. The lessons
          are general reflections, written gently. They are not advice for your particular situation.
        </p>
        <p>
          This is not therapy, medical care, legal advice or crisis support, and it does not replace a
          conversation with a qualified person. If you are in immediate danger or worried about your safety,
          contact your local emergency services or a crisis line in your country.
        </p>
      </PolicySection>

      <PolicySection id="your-account" title="Your account">
        <ul>
          <li>Keep your email account and password safe. They are the only keys to your journal.</li>
          <li>One person per account. Please do not share sign-in details.</li>
          <li>If you think someone else has used your account, change your password and email us.</li>
        </ul>
        <p>
          We may close an account that is used to break this policy.{" "}
          <Pending>Decide on notice period and whether an export is offered first.</Pending>
        </p>
      </PolicySection>

      <PolicySection id="your-content" title="Your content">
        <p>
          What you write is yours. We only store it and show it back to you. We do not read it, publish it,
          share it or use it to train anything.
        </p>
        <p>
          You can download everything you have written or delete it, entry by entry or all at once, from{" "}
          <Link href="/account">Account</Link>. Deleting your account removes all of your entries as well.
        </p>
        <p>
          You are responsible for what you write. Please do not store other people&rsquo;s private information
          without their agreement.
        </p>
      </PolicySection>

      <PolicySection id="acceptable-use" title="Acceptable use">
        <p>Please do not:</p>
        <ul>
          <li>Try to read, change or delete anyone else&rsquo;s data.</li>
          <li>Probe, overload or disrupt the service, or try to get around its security.</li>
          <li>Use automated tools to copy the lessons or to create accounts.</li>
          <li>Use the app for anything unlawful.</li>
        </ul>
      </PolicySection>

      <PolicySection id="availability" title="Availability">
        <p>
          This is a small service run with care and on a modest budget. We do our best to keep it available,
          but it may be unavailable at times, for example during maintenance or when a provider has a problem.
        </p>
        <p>
          Please export your writing from time to time so that you always hold a copy. The export is a plain
          text file that you can open anywhere.
        </p>
        <p>
          <Pending>
            Liability and governing-law wording to be supplied by the owner or a legal adviser.
          </Pending>
        </p>
      </PolicySection>

      <PolicySection id="changes" title="Changes to this policy">
        <p>
          If this policy changes, we will update this page and the date at the top.{" "}
          <Pending>Decide whether and how significant changes are announced inside the app.</Pending>
        </p>
      </PolicySection>

      <PolicySection id="contact" title="Contact">
        <p>
          {siteConfig.ownerName}, <a href={mailto}>{email}</a>. Replies come by email.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
