import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { PricingTiers } from "@/components/marketing/PricingTiers";
import { ReferralCapture } from "@/components/share/ReferralCapture";

const steps = [
  {
    number: "01",
    title: "Tell us about yourself",
    body: "A short assessment covering your goal, time, skills, starting budget, working style, technology comfort, risk tolerance, and the extra income you would like.",
  },
  {
    number: "02",
    title: "We analyse your fit",
    body: "Your answers are compared with a set of income opportunities using the same matching logic each time — not a generic side-hustle list.",
  },
  {
    number: "03",
    title: "Get your personalised Money Map",
    body: "You receive ranked opportunities, why each one fits, and practical first steps. These are matches, not a promise of income.",
  },
];

const mapIncludes = [
  "Ranked opportunities that fit your circumstances",
  "Match scores so you can see relative fit",
  "A plain-language explanation of why each one was selected",
  "Practical first actions you can start with",
  "Milestones to build toward over time",
];

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
      "A$19 is the automated assessment: an instant Top 3 from the matching engine. A$49 is the Personal Money Map: the same engine, plus human review, a tailored 7-day action path, and a 30-day milestone tracker. Neither guarantees income.",
  },
];

const exampleMatches = [
  {
    rank: 1,
    name: "Short writing projects for local businesses",
    score: "81",
    why: "Fits a writing skill set, a modest starting budget, and limited weekly time.",
  },
  {
    rank: 2,
    name: "Professional profile and document updates",
    score: "74",
    why: "Uses existing communication skills and can be done in short sessions.",
  },
  {
    rank: 3,
    name: "Turning existing material into smaller content pieces",
    score: "68",
    why: "Builds on writing comfort without needing a large upfront spend.",
  },
];

function SectionSplit({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid items-start gap-4 md:grid-cols-3 md:gap-8">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper md:col-span-1 md:pt-1">
        {label}
      </p>
      <div className="min-w-0 md:col-span-2">{children}</div>
    </div>
  );
}

function ContentFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-neutral-200/60 bg-white p-6 shadow-sm sm:p-8">
      {children}
    </div>
  );
}

const stepBadgeTints = [
  "bg-moss/12 text-moss",
  "bg-copper/12 text-copper",
  "bg-mint-deep/15 text-moss-dark",
] as const;

function HeroDashboardMockup() {
  return (
    <aside
      className="relative isolate min-h-[22rem] overflow-hidden rounded-[1.75rem] border-2 border-ink shadow-[0_24px_60px_rgba(23,36,28,0.16)] sm:min-h-[26rem]"
      aria-label="Illustrative Money Map dashboard mockup"
    >
      <div className="hero-mesh absolute inset-0" />
      <div className="relative flex h-full flex-col p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-cream/75">
          Money Map dashboard
        </p>
        <p className="mt-1 font-display text-xl text-cream">
          Illustrative Top 3
        </p>
        <ol className="mt-5 space-y-3">
          {exampleMatches.map((match) => (
            <li
              key={match.rank}
              className="rounded-2xl border border-cream/15 bg-cream/92 px-4 py-3 shadow-[0_8px_24px_rgba(16,38,27,0.12)]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium leading-snug text-ink">
                  <span className="text-muted">Rank {match.rank} · </span>
                  {match.name}
                </p>
                <p className="shrink-0 font-display text-lg tabular-nums text-moss">
                  {match.score}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-auto pt-4 text-[11px] leading-relaxed text-cream/70">
          Placeholder layout — not a real customer result.
        </p>
      </div>
    </aside>
  );
}

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
    <div>
      <ReferralCapture />

      <Container className="pb-12 pt-8 sm:pb-14 sm:pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="max-w-[650px]">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-moss">
              Personalised Money Map
            </p>
            <h1 className="font-display text-4xl leading-[1.15] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              A Money Map of income opportunities that fit your real situation.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
              Answer a short assessment about your goal, time, skills, budget,
              and how you like to work. Money Finder turns those answers into a
              personalised Top 3 Money Map — with scores, explanations, and
              first steps. It does not guarantee income.
            </p>
          </div>
          <HeroDashboardMockup />
        </div>
        <div className="mt-10">
          <PricingTiers
            id="pricing"
            standardHref={standardHref}
            premiumHref={premiumHref}
            paymentLinked={paymentLinked}
          />
        </div>
      </Container>

      <section
        id="how-it-works"
        className="border-y border-line/80 bg-cream/60"
      >
        <Container className="py-12 sm:py-14">
          <SectionSplit label="How it works">
            <h2 className="font-display max-w-[650px] text-3xl tracking-tight sm:text-4xl">
              Three steps to your Money Map
            </h2>
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              {steps.map((step, index) => (
                <article key={step.number}>
                  <p
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl font-display text-sm font-medium ${stepBadgeTints[index]}`}
                  >
                    {step.number}
                  </p>
                  <h3 className="mt-4 font-display text-2xl tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-[650px] leading-relaxed text-muted">
                    {step.body}
                  </p>
                </article>
              ))}
            </div>
          </SectionSplit>
        </Container>
      </section>

      <section id="what-you-get">
        <Container className="py-12 sm:py-14">
          <SectionSplit label="What you get">
            <h2 className="font-display max-w-[650px] text-3xl tracking-tight sm:text-4xl">
              A ranked plan you can actually use
            </h2>
            <p className="mt-4 max-w-[650px] leading-relaxed text-muted">
              Your Money Map is built from your answers, not a one-size-fits-all
              list of side hustles. You see why each opportunity was selected
              and what to do first.
            </p>
            <ul className="mt-8 max-w-[650px] space-y-4">
              {mapIncludes.map((item) => (
                <li key={item} className="flex gap-3 text-base leading-relaxed">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-moss"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <PricingTiers
                standardHref={standardHref}
                premiumHref={premiumHref}
                paymentLinked={paymentLinked}
              />
            </div>
          </SectionSplit>
        </Container>
      </section>

      <section id="who-it-is-for" className="border-y border-line/80 bg-cream/40">
        <Container className="py-12 sm:py-14">
          <SectionSplit label="Who it is for">
            <ContentFrame>
              <h2 className="max-w-[650px] font-display text-3xl tracking-tight sm:text-4xl">
                For people who want realistic options, not a generic hustle
                list.
              </h2>
              <p className="mt-5 max-w-[650px] text-lg leading-relaxed text-muted">
                Money Finder is useful if you want to see which income
                opportunities fit the time, budget, skills, and risk you
                actually have — instead of scrolling through ideas that ignore
                those constraints. It is not a job board, an investment product,
                or a get-rich system.
              </p>
            </ContentFrame>
          </SectionSplit>
        </Container>
      </section>

      <section id="example">
        <Container className="py-12 sm:py-14">
          <SectionSplit label="Example Money Map">
            <ContentFrame>
              <h2 className="font-display max-w-[650px] text-3xl tracking-tight sm:text-4xl">
                What the results look like
              </h2>
              <p className="mt-4 max-w-[650px] leading-relaxed text-muted">
                This is an illustrative example of the layout you will see. It
                is not a real customer result, not your result, and not a
                prediction of income.
              </p>
              <aside className="mt-8 space-y-5">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
                  Illustrative example
                </p>
                <ol className="space-y-5">
                  {exampleMatches.map((match) => (
                    <li
                      key={match.rank}
                      className="border-b border-neutral-200/80 pb-5 last:border-b-0 last:pb-0"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                        <p className="font-medium leading-snug">
                          <span className="text-muted">
                            Rank {match.rank} ·{" "}
                          </span>
                          {match.name}
                        </p>
                        <p className="shrink-0 text-sm text-muted">
                          Match score {match.score} / 100
                        </p>
                      </div>
                      <p className="mt-2 max-w-[650px] text-sm leading-relaxed text-muted">
                        {match.why}
                      </p>
                      {match.rank === 1 ? (
                        <p className="mt-3 max-w-[650px] text-sm leading-relaxed">
                          First actions might include: practise a sample,
                          assemble a simple offer, and contact a small number of
                          local businesses.
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
                <p className="max-w-[650px] text-sm leading-relaxed text-muted">
                  These are ranked fits based on your answers, not a promise of
                  income.
                </p>
              </aside>
            </ContentFrame>
          </SectionSplit>
        </Container>
      </section>

      <section id="expectations" className="border-y border-line/80 bg-cream/60">
        <Container className="py-12 sm:py-14">
          <SectionSplit label="Trust and expectations">
            <ContentFrame>
              <h2 className="max-w-[650px] font-display text-3xl tracking-tight sm:text-4xl">
                These are ranked fits based on your answers, not a promise of
                income.
              </h2>
              <p className="mt-5 max-w-[650px] text-lg leading-relaxed text-muted">
                What you earn — if anything — depends on your circumstances, the
                effort you put in, market demand, and many factors Money Finder
                cannot control. Use the map as a starting point, not as
                financial advice or a guarantee of work.
              </p>
            </ContentFrame>
          </SectionSplit>
        </Container>
      </section>

      <section id="faq">
        <Container className="py-12 sm:py-14">
          <SectionSplit label="FAQ">
            <h2 className="font-display max-w-[650px] text-3xl tracking-tight sm:text-4xl">
              Common questions
            </h2>
            <div className="mt-8 max-w-[650px] divide-y divide-line/80 border-y border-line/80">
              {faqs.map((item) => (
                <details key={item.question} className="group py-2">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-moss group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-[650px] pb-4 leading-relaxed text-muted">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </SectionSplit>
        </Container>
      </section>

      <section
        id="get-started"
        className="border-t border-neutral-200/70 bg-white"
      >
        <Container className="py-12 sm:py-14">
          <div className="max-w-[650px]">
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
              Start with the assessment
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Twelve questions. A personalised Top 3. Clear first moves. Results
              are matches, not guaranteed income.
            </p>
          </div>
          <div className="mt-10">
            <PricingTiers
              standardHref={standardHref}
              premiumHref={premiumHref}
              paymentLinked={paymentLinked}
            />
          </div>
        </Container>
      </section>
    </div>
  );
}
