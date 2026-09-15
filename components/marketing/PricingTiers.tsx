import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type PricingTiersProps = {
  standardHref: string;
  premiumHref: string;
  paymentLinked: boolean;
  id?: string;
};

export function PricingTiers({
  standardHref,
  premiumHref,
  paymentLinked,
  id,
}: PricingTiersProps) {
  const checkoutNote = paymentLinked
    ? "A short assessment after a secure Stripe checkout. Matches are not a promise of income."
    : "Pre-launch private demo. Nothing is charged. Matches are not a promise of income.";

  return (
    <div id={id} className={id ? "scroll-mt-24" : undefined}>
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">
        Two ways to get your Money Map
      </p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <Card className="flex h-full flex-col">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
            Standard
          </p>
          <p className="mt-3 font-display text-3xl tracking-tight text-ink">
            A$19 Automated Assessment
          </p>
          <p className="mt-2 leading-relaxed text-muted">
            12 questions. Instant Top 3. Same matching engine, every time. You
            take it from there.
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-relaxed">
            <li>Ranked Top 3, scores, and why each one fits</li>
            <li>Standard first actions from the matching engine</li>
            <li>You plan the week yourself</li>
          </ul>
          <div className="mt-8 flex flex-1 flex-col justify-end gap-4">
            <Button href={standardHref} variant="secondary" fullWidth size="lg">
              Get the A$19 automated Money Map
            </Button>
            <p className="text-sm leading-relaxed text-muted">{checkoutNote}</p>
          </div>
        </Card>

        <Card
          className={cn(
            "flex h-full flex-col border-moss/35 bg-cream",
            "shadow-[0_1px_0_rgba(23,36,28,0.04)]",
          )}
        >
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-moss">
            Recommended · Premium
          </p>
          <p className="mt-3 font-display text-3xl tracking-tight text-ink">
            A$49 Personal Money Map
          </p>
          <p className="mt-2 leading-relaxed text-muted">
            Same assessment and engine — then a human reviews your answers and
            writes the first month around your Rank 1 fit.
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-relaxed">
            <li>Human-in-the-loop review of your diagnostic</li>
            <li>Tailored 7-day action path, written day-by-day</li>
            <li>Tailored 30-day milestone tracker</li>
          </ul>
          <div className="mt-8 flex flex-1 flex-col justify-end gap-4">
            <Button href={premiumHref} fullWidth size="lg">
              Get the A$49 Personal Money Map
            </Button>
            <p className="text-sm leading-relaxed text-muted">{checkoutNote}</p>
          </div>
        </Card>
      </div>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
        These are ranked fits based on your answers, not a promise of income.
        Neither tier guarantees income, clients, or work.
      </p>
    </div>
  );
}
