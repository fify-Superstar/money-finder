"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { MoneyMap, MoneyMapMatch, MoneyMapStep } from "@/lib/results/types";

const RANK1_ACTIONS_ID = "rank-1-this-week";

function ThisWeekList({
  items,
  headingId,
  sectionId,
}: {
  items: [MoneyMapStep, MoneyMapStep, MoneyMapStep];
  headingId: string;
  sectionId?: string;
}) {
  return (
    <section
      id={sectionId}
      tabIndex={sectionId ? -1 : undefined}
      aria-labelledby={headingId}
      className="space-y-3 scroll-mt-24 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-moss"
    >
      <h4
        id={headingId}
        className="text-sm font-medium uppercase tracking-[0.16em] text-muted"
      >
        This week
      </h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={`${headingId}-${item.label}`}
            className="rounded-2xl border border-line bg-paper/80 px-4 py-3 font-medium leading-relaxed"
          >
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

function BuildTowardList({
  items,
  headingId,
}: {
  items: [MoneyMapStep, MoneyMapStep, MoneyMapStep];
  headingId: string;
}) {
  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <h4
        id={headingId}
        className="text-sm font-medium uppercase tracking-[0.16em] text-muted"
      >
        Build toward
      </h4>
      <ol className="space-y-2">
        {items.map((item, index) => (
          <li
            key={`${headingId}-${item.label}`}
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
      </ol>
    </section>
  );
}

function Rank1Hero({
  match,
  firstName,
}: {
  match: MoneyMapMatch;
  firstName: string;
}) {
  const headingId = `money-map-${match.id}`;
  const firstAction = match.actions[0]?.label;

  return (
    <Card
      as="article"
      className="space-y-6 border-moss/35 bg-cream"
      aria-labelledby={headingId}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-moss">
            Best fit for you
          </p>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">
            Rank {match.rank}
          </p>
          <h2
            id={headingId}
            className="font-display text-3xl tracking-tight break-words sm:text-4xl"
          >
            {match.name}
          </h2>
          <p className="text-lg leading-relaxed text-muted">
            {firstName}, here is where to start.
          </p>
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

      {firstAction ? (
        <div className="rounded-2xl border border-moss/25 bg-paper px-4 py-4 sm:px-5">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-moss">
            Start with this
          </p>
          <p className="mt-2 font-display text-2xl tracking-tight break-words">
            {firstAction}
          </p>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
          Why it fits
        </h3>
        <p className="mt-2 leading-relaxed text-muted">{match.explanation}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ThisWeekList
          headingId={`${match.id}-actions`}
          sectionId={RANK1_ACTIONS_ID}
          items={match.actions}
        />
        <BuildTowardList
          headingId={`${match.id}-milestones`}
          items={match.milestones}
        />
      </div>
    </Card>
  );
}

function SecondaryMatch({ match }: { match: MoneyMapMatch }) {
  const headingId = `money-map-${match.id}`;

  return (
    <details className="group rounded-3xl border border-line bg-cream shadow-[0_1px_0_rgba(23,36,28,0.04)]">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-6 py-5 sm:px-8 sm:py-6 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">
            Rank {match.rank}
          </p>
          <h3
            id={headingId}
            className="font-display text-2xl tracking-tight break-words"
          >
            {match.name}
          </h3>
          <p className="text-sm text-muted group-open:hidden">View plan</p>
          <p className="hidden text-sm text-muted group-open:block">Hide plan</p>
        </div>
        <p className="shrink-0 text-right">
          <span className="block text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Match score
          </span>
          <span className="mt-1 block font-display text-3xl tracking-tight tabular-nums">
            {match.score}
            <span className="text-base text-muted"> / 100</span>
          </span>
        </p>
      </summary>
      <div className="space-y-5 border-t border-line/80 px-6 py-5 sm:px-8 sm:py-6">
        <div>
          <h4 className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
            Why it fits
          </h4>
          <p className="mt-2 leading-relaxed text-muted">{match.explanation}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <ThisWeekList
            headingId={`${match.id}-actions`}
            items={match.actions}
          />
          <BuildTowardList
            headingId={`${match.id}-milestones`}
            items={match.milestones}
          />
        </div>
      </div>
    </details>
  );
}

function focusRank1Actions() {
  document.getElementById(RANK1_ACTIONS_ID)?.focus({ preventScroll: true });
}

type MoneyMapViewProps = {
  map: MoneyMap;
};

export function MoneyMapView({ map }: MoneyMapViewProps) {
  const [rank1, ...rest] = map.matches;

  if (!rank1) {
    return null;
  }

  return (
    <div className="min-w-0 space-y-8">
      <Rank1Hero match={rank1} firstName={map.firstName} />

      <p className="text-sm leading-relaxed text-muted">
        These are ranked fits based on your answers, not a promise of income.
      </p>

      {rest.length > 0 ? (
        <div className="space-y-4">
          <h2 className="font-display text-2xl tracking-tight">Also a strong fit</h2>
          {rest.map((match) => (
            <SecondaryMatch key={match.id} match={match} />
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={`#${RANK1_ACTIONS_ID}`}
          className="inline-flex min-h-11 max-w-full items-center justify-center whitespace-normal rounded-full bg-moss px-6 py-3 text-center text-base font-medium text-cream transition hover:bg-moss-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          onClick={focusRank1Actions}
        >
          Start with {rank1.name}
        </a>
        <Button href="/assessment" variant="secondary">
          Retake assessment
        </Button>
      </div>
    </div>
  );
}
