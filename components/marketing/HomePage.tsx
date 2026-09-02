import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";
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

type HomePageProps = {
  startHref: string;
  ctaLabel: string;
  paymentLinked: boolean;
};

export function HomePage({ startHref, ctaLabel, paymentLinked }: HomePageProps) {
  return (
    <div>
      <ReferralCapture />

      <Container className="pb-16 pt-12 sm:pt-20">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-moss">
          Personalised Money Map
        </p>
        <h1 className="font-display max-w-3xl text-4xl leading-[1.15] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          A Money Map of income opportunities that fit your real situation.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          Answer a short assessment about your goal, time, skills, budget, and
          how you like to work. Money Finder turns those answers into a
          personalised Top 3 Money Map — with scores, explanations, and first
          steps. It does not guarantee income.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button href={startHref} size="lg">
            {ctaLabel}
          </Button>
          <p className="max-w-sm text-sm leading-relaxed text-muted sm:pl-2">
            {paymentLinked
              ? "A short assessment after a secure Stripe checkout. Matches are not a promise of income."
              : "Pre-launch private demo. Nothing is charged. Matches are not a promise of income."}
          </p>
        </div>
      </Container>

      <section
        id="how-it-works"
        className="border-y border-line/80 bg-cream/60"
      >
        <Container className="py-14 sm:py-16">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">
            How it works
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
            Three steps to your Money Map
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number}>
                <p className="font-display text-sm text-copper">{step.number}</p>
                <h3 className="mt-2 font-display text-2xl tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted">{step.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section id="what-you-get">
        <Container className="grid gap-10 py-16 sm:grid-cols-[1.1fr_0.9fr] sm:items-start">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">
              What you get
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
              A ranked plan you can actually use
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">
              Your Money Map is built from your answers, not a one-size-fits-all
              list of side hustles. You see why each opportunity was selected
              and what to do first.
            </p>
            <ul className="mt-8 space-y-4">
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
          </div>
          <Card as="aside">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
              {paymentLinked ? "Start here" : "Pre-launch"}
            </p>
            <p className="mt-3 font-display text-3xl tracking-tight text-ink">
              Short assessment. Clear next steps.
            </p>
            <p className="mt-2 leading-relaxed text-muted">
              {paymentLinked
                ? "Checkout is handled by Stripe. The assessment opens after payment is verified. No income is guaranteed."
                : "This public site is a private demo. Checkout is not taking live charges in this build."}
            </p>
            <Button href={startHref} fullWidth className="mt-8">
              {ctaLabel}
            </Button>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              These are ranked fits based on your answers, not a promise of
              income.
            </p>
          </Card>
        </Container>
      </section>

      <section id="who-it-is-for" className="border-y border-line/80 bg-cream/40">
        <Container className="py-16">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">
            Who it is for
          </p>
          <h2 className="mt-2 max-w-3xl font-display text-3xl tracking-tight sm:text-4xl">
            For people who want realistic options, not a generic hustle list.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Money Finder is useful if you want to see which income opportunities
            fit the time, budget, skills, and risk you actually have — instead
            of scrolling through ideas that ignore those constraints. It is not
            a job board, an investment product, or a get-rich system.
          </p>
        </Container>
      </section>

      <section id="example">
        <Container className="py-16">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">
            Example Money Map
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
            What the results look like
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">
            This is an illustrative example of the layout you will see. It is
            not a real customer result, not your result, and not a prediction of
            income.
          </p>
          <Card as="aside" className="mt-8 space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
              Illustrative example
            </p>
            <ol className="space-y-5">
              {exampleMatches.map((match) => (
                <li
                  key={match.rank}
                  className="border-b border-line/80 pb-5 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <p className="font-medium leading-snug">
                      <span className="text-muted">Rank {match.rank} · </span>
                      {match.name}
                    </p>
                    <p className="shrink-0 text-sm text-muted">
                      Match score {match.score} / 100
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {match.why}
                  </p>
                  {match.rank === 1 ? (
                    <p className="mt-3 text-sm leading-relaxed">
                      First actions might include: practise a sample, assemble a
                      simple offer, and contact a small number of local
                      businesses.
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
            <p className="text-sm leading-relaxed text-muted">
              These are ranked fits based on your answers, not a promise of
              income.
            </p>
          </Card>
        </Container>
      </section>

      <section id="expectations" className="border-y border-line/80 bg-cream/60">
        <Container className="py-16">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">
            Trust and expectations
          </p>
          <h2 className="mt-2 max-w-3xl font-display text-3xl tracking-tight sm:text-4xl">
            These are ranked fits based on your answers, not a promise of
            income.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            What you earn — if anything — depends on your circumstances, the
            effort you put in, market demand, and many factors Money Finder
            cannot control. Use the map as a starting point, not as financial
            advice or a guarantee of work.
          </p>
        </Container>
      </section>

      <section id="faq">
        <Container className="py-16">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">
            FAQ
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
            Common questions
          </h2>
          <div className="mt-8 divide-y divide-line/80 border-y border-line/80">
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
                <p className="pb-4 leading-relaxed text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section id="get-started" className="border-t border-line/80 bg-cream/40">
        <Container className="py-16">
          <h2 className="font-display max-w-2xl text-3xl tracking-tight sm:text-4xl">
            Start with the assessment
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Twelve questions. A personalised Top 3. Clear first moves. Results
            are matches, not guaranteed income.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button href={startHref} size="lg">
              {ctaLabel}
            </Button>
            <p className="text-sm text-muted">
              {paymentLinked
                ? "You will be taken to checkout, then the assessment."
                : "Unpaid private demo — payment is not connected in this build."}
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
