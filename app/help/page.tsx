import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/shell/container";
import { PageHeading } from "@/components/shell/page-heading";
import { Reveal } from "@/components/motion/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Faq, FaqItem } from "@/components/policy";

export const metadata: Metadata = {
  title: "Help",
  description:
    "Questions, problems or feedback about the lessons or your journal. Email us and a person will reply.",
};

export default function HelpPage() {
  const mailto = `mailto:${siteConfig.supportEmail}`;

  return (
    <Container width="reading">
      <PageHeading
        title="Help"
        description="Questions, problems or feedback: email us and a person will reply."
      />

      <Reveal delay={0.05}>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:gap-5">
            <span
              className="bg-primary-soft text-primary grid size-12 shrink-0 place-items-center rounded-md"
              aria-hidden="true"
            >
              <Mail className="size-6" />
            </span>
            <div className="min-w-0">
              <a
                href={mailto}
                className="text-primary hover:text-primary-hover inline-block font-serif text-2xl break-all underline underline-offset-4 sm:text-3xl"
              >
                {siteConfig.supportEmail}
              </a>
              <p className="text-muted mt-2 text-sm">
                Replies come by email. There is no live chat and no phone line, and you do not need an account
                to write to us.
              </p>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal as="section" delay={0.1} className="mt-12" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-text text-2xl">
          Common questions
        </h2>
        <Faq className="mt-4">
          <FaqItem question="Do I need an account?">
            <p>No, not for the lessons. All three can be read without signing up.</p>
            <p>You do need an account to save writing in the journal, so it can be kept privately for you.</p>
          </FaqItem>

          <FaqItem question="How does saving work?">
            <p>
              Saving is automatic. A short pause after you stop typing is enough. You will see
              &ldquo;Saved&rdquo; only after the server has confirmed it has your text.
            </p>
            <p>
              If a save fails, your words stay on the screen and you can retry or copy them. You can also
              download everything you have written at any time.
            </p>
          </FaqItem>

          <FaqItem question="How do I export my writing?">
            <p>
              Open <Link href="/account">Account</Link> and choose &ldquo;Download all entries&rdquo;. You get
              a plain text file with every entry, its title, date and time. Your entries stay in the journal
              afterwards.
            </p>
          </FaqItem>

          <FaqItem question="How do I delete my account?">
            <p>
              Open <Link href="/account">Account</Link> and choose &ldquo;Delete account&rdquo;. You will be
              offered an export first and asked to confirm.
            </p>
            <p>
              Deleting removes your account and every journal entry straight away. This cannot be undone, so
              download a copy first if you would like to keep one.
            </p>
          </FaqItem>

          <FaqItem question="Is my writing private?">
            <p>
              Yes. Only you can read your entries. Access is enforced in the database, and staff do not read
              journal entries. There is no advertising and no third-party tracking.
            </p>
            <p>
              The <Link href={siteConfig.links.privacy}>privacy notice</Link> describes what is stored and
              where.
            </p>
          </FaqItem>

          <FaqItem question="Will you send reminders or track streaks?">
            <p>No. There are no reminders, streaks or timers. You read and write when you choose to.</p>
          </FaqItem>

          <FaqItem question="Something looks wrong on my phone">
            <p>
              Browser zoom is always allowed, so pinch or use your browser&rsquo;s text size setting. The
              Display settings button in the header also lets you change text size, theme and motion.
            </p>
            <p>If something still looks off, email us with the page and the phone you are using.</p>
          </FaqItem>
        </Faq>
      </Reveal>

      <Reveal delay={0.15} className="text-muted mt-12">
        <p>
          You can also read the{" "}
          <Link
            className="text-primary hover:text-primary-hover underline underline-offset-4"
            href={siteConfig.links.privacy}
          >
            privacy notice
          </Link>{" "}
          and the{" "}
          <Link
            className="text-primary hover:text-primary-hover underline underline-offset-4"
            href={siteConfig.links.terms}
          >
            use policy
          </Link>
          .
        </p>
      </Reveal>
    </Container>
  );
}
