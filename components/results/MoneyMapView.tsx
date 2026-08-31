import { ShareMoneyMapCta } from "@/components/share/ShareMoneyMapCta";
import { Card } from "@/components/ui/Card";
import type { MoneyMap, MoneyMapMatch, MoneyMapStep } from "@/lib/results/types";

function StepList({
  heading,
  headingId,
  items,
  ordered,
}: {
  heading: string;
  headingId: string;
  items: [MoneyMapStep, MoneyMapStep, MoneyMapStep];
  ordered: boolean;
}) {
  const List = ordered ? "ol" : "ul";

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <h4 id={headingId} className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
        {heading}
      </h4>
      <List className="space-y-2">
        {items.map((item, index) => (
          <li
            key={`${headingId}-${index}`}
            className="flex gap-3 rounded-2xl border border-line bg-paper/80 px-4 py-3"
          >
            <span
              aria-hidden="true"
              className="font-display text-lg text-copper"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-medium leading-relaxed">{item.label}</span>
          </li>
        ))}
      </List>
    </section>
  );
}

function MatchCard({ match }: { match: MoneyMapMatch }) {
  const headingId = `money-map-${match.id}`;

  return (
    <Card as="article" className="space-y-6" aria-labelledby={headingId}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">
            Rank {match.rank}
          </p>
          <h3 id={headingId} className="font-display text-3xl tracking-tight">
            {match.name}
          </h3>
        </div>
        <p className="shrink-0">
          <span className="block text-sm font-medium uppercase tracking-[0.16em] text-muted">
            Match score
          </span>
          <span className="mt-1 block font-display text-5xl tracking-tight tabular-nums">
            {match.score}
            <span className="text-lg text-muted"> / 100</span>
          </span>
        </p>
      </div>
      <div>
        <h4 className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
          Why it fits
        </h4>
        <p className="mt-2 leading-relaxed text-muted">{match.explanation}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <StepList
          heading="Milestones"
          headingId={`${match.id}-milestones`}
          items={match.milestones}
          ordered
        />
        <StepList
          heading="First actions"
          headingId={`${match.id}-actions`}
          items={match.actions}
          ordered={false}
        />
      </div>
    </Card>
  );
}

type MoneyMapViewProps = {
  map: MoneyMap;
};

export function MoneyMapView({ map }: MoneyMapViewProps) {
  return (
    <div className="space-y-8">
      <Card className="border-moss/20 bg-cream">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-moss">
          Money Map insight
        </p>
        <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
          {map.firstName}, here is where to start.
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">
          {map.insight}
        </p>
      </Card>
      {map.matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
      <ShareMoneyMapCta />
      <p className="text-sm leading-relaxed text-muted">
        These matches are a fit against the current catalog. They are not a
        guarantee of income, work, or financial outcomes.
      </p>
    </div>
  );
}
