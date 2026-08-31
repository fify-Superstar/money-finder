import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";

const steps = [
  {
    number: "01",
    title: "Answer the assessment",
    body: "A focused set of questions about your situation, capacity, and what you are looking for.",
  },
  {
    number: "02",
    title: "Get matched",
    body: "Your answers are processed against Money Finder opportunity-matching logic — not generic advice.",
  },
  {
    number: "03",
    title: "Receive your Money Map",
    body: "A personalised Top 3 with match scores, explanations, milestones, and first actions.",
  },
];

const outcomes = [
  "Your Top 3 personalised money opportunities",
  "Match scores and a clear explanation for each result",
  "Milestones and first actions you can start with",
  "Yours after a single A$19 payment — no subscription",
];

export default function Home() {
  return (
    <div>
      <Container className="pb-16 pt-12 sm:pt-20">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-moss">
          Personalised Money Map
        </p>
        <h1 className="font-display max-w-3xl text-4xl leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Find the money opportunities that actually fit you.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          Money Finder is a one-time assessment. You answer the questions, we
          match them to the opportunities that fit your situation, and you get a
          personalised Top 3 Money Map — with scores, explanations, milestones,
          and first actions.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button href="/assessment" size="lg">
            Find My Money Map
          </Button>
          <p className="text-sm text-muted sm:pl-2">
            <span className="font-semibold text-ink">A$19</span> one-time. No
            subscription.
          </p>
        </div>
      </Container>

      <section className="border-y border-line/80 bg-cream/60">
        <Container className="grid gap-10 py-14 sm:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number}>
              <p className="font-display text-sm text-copper">{step.number}</p>
              <h2 className="mt-2 font-display text-2xl tracking-tight">
                {step.title}
              </h2>
              <p className="mt-3 leading-relaxed text-muted">{step.body}</p>
            </article>
          ))}
        </Container>
      </section>

      <Container className="grid gap-10 py-16 sm:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
            What you walk away with
          </h2>
          <ul className="mt-8 space-y-4">
            {outcomes.map((item) => (
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
            One-time price
          </p>
          <p className="mt-3 font-display text-5xl tracking-tight text-ink">
            A$19
          </p>
          <p className="mt-2 text-muted">Pay once. No subscription.</p>
          <Button href="/assessment" fullWidth className="mt-8">
            Find My Money Map
          </Button>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Results are personalised matches based on your answers. They are not
            a guarantee of income, work, or financial outcomes.
          </p>
        </Card>
      </Container>
    </div>
  );
}
