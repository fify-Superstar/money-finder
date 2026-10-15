import { exampleMatches } from "@/lib/marketing/exampleMap";
import { Container } from "@/components/layout/Container";
import { PricingTiers } from "@/components/marketing/PricingTiers";
import { ReferralCapture } from "@/components/share/ReferralCapture";
import { ShareMoneyMapCta } from "@/components/share/ShareMoneyMapCta";
import { Button } from "@/components/ui/Button";

const faqs = [
  {
    question: "What is Money Finder?",
    answer:
      "Money Finder is a personalised digital Money Map. You answer a short assessment, and the system ranks income opportunities based on your skills, time, budget, working style, and goals.",
  },
  {
    question: "How long does the assessment take?",
    answer:
      "Most people finish in about five to ten minutes. There are twelve focused questions. Some items, including desired additional income, are optional.",
  },
  {
    question: "What do I receive?",
    answer:
      "A personalised Money Map with your strongest matches, scores, explanations, first actions, and milestones. It is generated from the answers you give in that session.",
  },
  {
    question: "Is this financial advice?",
    answer:
      "No. Money Finder is not financial advice, investment advice, tax advice, or employment placement. It is a matching tool that ranks opportunities from your answers.",
  },
  {
    question: "Does Money Finder guarantee income?",
    answer:
      "No. Results are ranked fits based on your answers, not a promise of income. What you earn depends on your circumstances, effort, skills, and market demand.",
  },
  {
    question: "Can I retake the assessment?",
    answer:
      "Yes. After you have a Money Map, you can retake the assessment. A retake starts a fresh questionnaire rather than showing a completed screen.",
  },
  {
    question: "Which Money Map should I choose?",
    answer:
      "A$47 is the automated assessment: an instant Top 3 from the matching engine. A$97 is the Personal Money Map: the same engine, plus human review, a tailored 7-day action path, and a 30-day milestone tracker. Neither guarantees income.",
  },
];

type HomePageProps = {
  standardHref: string;
  premiumHref: string;
  paymentLinked: boolean;
};

export function HomePage({
  standardHref,
  premiumHref,
  paymentLinked,
}: HomePageProps) {
  return (
    <div className="premium-home">
      <ReferralCapture />
      <section className="premium-hero">
        <Container className="relative py-14 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div>
              <p className="premium-eyebrow">
                <span className="inline-block h-2 w-2 rounded-full bg-mint" />{" "}
                YOUR POTENTIAL. A CLEARER DIRECTION.
              </p>
              <h1 className="mt-6 text-5xl font-medium leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Your next income move.
                <br />
                <span className="font-display italic text-mint-glow">
                  Made personal.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Turn your skills, time and starting budget into a personalised
                Top 3 of income opportunities — with reasons they fit and
                practical steps to begin.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="#pricing" size="lg">
                  Find my Money Map{" "}
                  <span aria-hidden="true" className="ml-3">
                    ↗
                  </span>
                </Button>
                <Button href="#example" variant="secondary" size="lg">
                  Explore an example
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
                <span>12 focused questions</span>
                <span>Built around your situation</span>
                <span>One-time payment</span>
              </div>
              <p className="mt-5 text-xs text-muted">
                Ranked fits, not a promise of income.
              </p>
            </div>
            <div className="premium-dashboard">
              <div className="flex items-center justify-between border-b border-line pb-5">
                <div>
                  <p className="premium-eyebrow">FICTIONAL EXAMPLE MONEY MAP</p>
                  <p className="mt-2 text-xl">Alex’s sample matches.</p>
                </div>
                <span aria-hidden="true" className="text-3xl text-mint">
                  ↗
                </span>
              </div>
              <div className="my-5 flex flex-wrap gap-2">
                {["Writing skills", "Under 5 hrs / week", "A$100 budget"].map(
                  (x) => (
                    <span
                      key={x}
                      className="rounded-full border border-line px-3 py-1.5 text-[11px] text-muted"
                    >
                      {x}
                    </span>
                  ),
                )}
              </div>
              <ol className="space-y-3">
                {exampleMatches.map((match) => (
                  <li
                    key={match.rank}
                    className={
                      match.rank === 1
                        ? "premium-match premium-match-first"
                        : "premium-match"
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted">0{match.rank}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-widest text-mint-glow">
                          {match.rank === 1
                            ? "Strongest fit"
                            : "Also worth exploring"}
                        </p>
                        <p className="mt-1 text-base font-medium">
                          {match.opportunity.name}
                        </p>
                      </div>
                      <p className="text-2xl tracking-tight">
                        {match.score}
                        <span className="text-xs text-muted"> /100</span>
                      </p>
                    </div>
                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-mint"
                        style={{ width: `${match.score}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-5 text-center text-xs text-muted">
                <span>Fit scores</span>
                <span>Clear reasons</span>
                <span>First actions</span>
              </div>
              <p className="mt-4 text-[10px] leading-relaxed text-muted">
                Illustrative example · Alex, a fictional profile. Your results
                depend on your answers. Scores measure fit, not earnings
                potential.
              </p>
            </div>
          </div>
        </Container>
      </section>
      <div className="border-y border-line bg-cream">
        <Container className="grid gap-6 py-7 sm:grid-cols-3">
          {[
            [
              "01",
              "Your circumstances first",
              "Time, budget, skills and goals.",
            ],
            [
              "02",
              "Your strongest three fits",
              "Ranked with clear explanations.",
            ],
            ["03", "Your next practical steps", "Move from ideas to action."],
          ].map(([n, title, body]) => (
            <div key={n} className="flex items-start gap-4">
              <span className="font-display text-2xl text-mint-glow">{n}</span>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1 text-xs text-muted">{body}</p>
              </div>
            </div>
          ))}
        </Container>
      </div>
      <section id="how-it-works" className="scroll-mt-24">
        <Container className="py-16 sm:py-20">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="premium-eyebrow">LESS GUESSWORK. MORE DIRECTION.</p>
              <h2 className="premium-heading mt-4">
                A clearer way to find
                <br />
                where you could start.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              You bring the real-life details. Money Finder connects them to
              opportunities that suit your situation.
            </p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              [
                "01",
                "Tell us about you",
                "Answer 12 focused questions about your skills, available time, budget, goals and working preferences.",
              ],
              [
                "02",
                "Discover your Top 3",
                "Our matching engine compares your answers with income opportunities and ranks their fit.",
              ],
              [
                "03",
                "Make your first move",
                "Understand why each option fits, then use practical first actions and milestones to explore it.",
              ],
            ].map(([n, title, body]) => (
              <article key={n} className="premium-panel">
                <p className="text-sm text-mint-glow">
                  {n}{" "}
                  <span aria-hidden="true" className="float-right">
                    ↗
                  </span>
                </p>
                <h3 className="mt-8 text-2xl tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <section
        id="example"
        className="scroll-mt-24 border-y border-line bg-cream"
      >
        <Container className="grid items-start gap-10 py-16 sm:py-20 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="premium-eyebrow">
              LOOK INSIDE FICTIONAL EXAMPLE MONEY MAP
            </p>
            <h2 className="premium-heading mt-4">
              More than an idea.
              <br />
              <span className="font-display italic text-mint-glow">
                A place to begin.
              </span>
            </h2>
            <p className="mt-5 text-muted leading-relaxed">
              See how one fictional profile becomes a ranked plan. Alex has
              writing skills, under five hours a week, an A$100 starting budget
              and a preference for project-based work.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {[
                "Ranked opportunities",
                "Fit explanations",
                "Practical actions",
                "Planning milestones",
              ].map((x) => (
                <span
                  key={x}
                  className="rounded-full border border-line px-3 py-2 text-xs text-muted"
                >
                  {x}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {exampleMatches.map((match) => (
              <article key={match.rank} className="premium-panel">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="premium-eyebrow">RANK 0{match.rank}</p>
                    <h3 className="mt-2 text-xl">{match.opportunity.name}</h3>
                  </div>
                  <p className="shrink-0 text-2xl text-mint-glow">
                    {match.score}
                    <span className="text-xs text-muted"> /100</span>
                  </p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {match.fits.skill === 1
                    ? "Uses Alex’s writing skills. "
                    : "Builds on content work. "}
                  Meets this sample’s time, budget and risk constraints.
                </p>
                {match.rank === 1 && (
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="text-xs uppercase tracking-widest text-mint-glow">
                      Alex’s example first actions
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-muted">
                      {match.opportunity.actions.map((action) => (
                        <li key={action} className="flex gap-3">
                          <span aria-hidden="true" className="text-mint">
                            ↗
                          </span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
            <p className="text-xs text-muted">
              Fictional example using our matching engine. Results are ranked
              fits, not guaranteed income.
            </p>
          </div>
        </Container>
      </section>
      <section id="pricing" className="scroll-mt-24">
        <Container className="py-16 sm:py-20">
          <div className="mb-9 text-center">
            <p className="premium-eyebrow">CHOOSE YOUR NEXT STEP</p>
            <h2 className="premium-heading mt-4">Clarity, at your pace.</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Start with an automated Money Map, or add a human review and a
              tailored plan for your first month.
            </p>
          </div>
          <PricingTiers
            standardHref={standardHref}
            premiumHref={premiumHref}
            paymentLinked={paymentLinked}
          />
        </Container>
      </section>
      <section id="faq" className="border-y border-line bg-cream">
        <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="premium-eyebrow">A LITTLE MORE CLARITY</p>
            <h2 className="premium-heading mt-4">
              Good questions.
              <br />
              Straight answers.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              Money Finder is a starting point for exploring income
              opportunities. Your results depend on your answers; earnings
              depend on effort, circumstances and market demand.
            </p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((item) => (
              <details key={item.question} className="group">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-5 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="text-xl text-mint group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>
      <Container className="py-16 sm:py-20">
        <div className="premium-closing p-8 text-center sm:p-14">
          <p className="premium-eyebrow">
            YOUR NEXT CHAPTER STARTS WITH A DIRECTION
          </p>
          <h2 className="premium-heading mx-auto mt-5 max-w-2xl">
            You have possibilities.
            <br />
            <span className="font-display italic text-mint-glow">
              Find the ones that fit.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-muted">
            Twelve questions. Your personalised Top 3. Practical first moves.
          </p>
          <div className="mt-7">
            <Button href="#pricing" size="lg">
              Find my Money Map ↗
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted">
            One-time payment · Ranked fits, not a promise of income.
          </p>
        </div>
        <div className="mt-10">
          <ShareMoneyMapCta />
        </div>
      </Container>
    </div>
  );
}
