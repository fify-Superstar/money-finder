import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Terms — Money Finder",
  description:
    "General terms for using Money Finder. This page is not legal advice and has not been reviewed by a lawyer.",
};

export default function TermsPage() {
  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Money Finder"
        title="Terms"
        description="These notes describe how the current Money Finder site is meant to be used. They are not a lawyer-reviewed contract and are not legal advice."
      />
      <div className="max-w-2xl space-y-6 leading-relaxed text-muted">
        <p>
          Money Finder provides a personalised Money Map: ranked income
          opportunity matches based on your assessment answers, with scores,
          explanations, first actions, and milestones. It is a matching tool.
        </p>
        <p>
          Money Finder is not financial advice, investment advice, tax advice,
          credit advice, or employment placement. It does not guarantee income,
          clients, work, or financial outcomes. Results depend on your
          circumstances, effort, skills, and market demand.
        </p>
        <p>
          You are responsible for the accuracy of your answers. A retake starts
          a new assessment on this device. Your Money Map in this version lives
          in the browser session unless a later delivery method is added.
        </p>
        <p>
          If payment is connected, access to the assessment may require a
          completed, paid Stripe checkout that this site verifies on the
          server. Unpaid visits are not entitled to paid access. Demo or
          pre-launch builds may allow the assessment without a charge; that
          does not create a paid entitlement.
        </p>
        <p>
          The site may change as the product develops. If these terms conflict
          with a later written agreement, that later agreement applies.
        </p>
      </div>
    </Container>
  );
}
