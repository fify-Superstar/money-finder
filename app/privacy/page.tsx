import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Privacy — Money Finder",
  description:
    "How Money Finder collects and uses assessment answers. This page is general information, not legal advice.",
};

export default function PrivacyPage() {
  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Money Finder"
        title="Privacy"
        description="This is a general description of how the current product uses information. It has not been reviewed by a lawyer and is not legal advice."
      />
      <div className="max-w-2xl space-y-6 leading-relaxed text-muted">
        <p>
          Money Finder is a personalised Money Map. The assessment asks for a
          first name, email address, and answers about your financial goal,
          available time, skills, starting budget, working style, technology
          comfort, existing assets or experience, risk tolerance, things you
          would rather avoid, and optional desired additional income.
        </p>
        <p>
          In this version, completed answers are stored in your browser
          (session storage) so this device can show your Money Map. They are
          used to rank opportunities. They are not sold. Email is collected so
          results can later be returned to you; this build does not yet email
          your Money Map.
        </p>
        <p>
          If checkout is connected, Stripe processes payment on Stripe’s
          systems. Money Finder then checks with Stripe whether a checkout
          session was paid before opening the assessment. Payment details are
          handled by Stripe, not stored in this app as card numbers.
        </p>
        <p>
          When paid access is enabled, a signed cookie may be stored in your
          browser so this device can return to the assessment. That cookie is
          not used as a public profile and is not a substitute for Stripe’s own
          payment record.
        </p>
        <p>
          If you have a privacy question about this demo, use the contact
          details you already have for Money Finder. Do not send payment card
          numbers by email.
        </p>
      </div>
    </Container>
  );
}
