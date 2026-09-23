"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import {
  buildIncomeMilestonePoints,
  buildIncomeMilestoneSeries,
} from "@/lib/results/incomeMilestones";
import type { MoneyMapMatch } from "@/lib/results/types";

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

function ChartTooltip({
  active,
  payload,
  label,
}: TooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-line bg-cream px-3 py-2.5 shadow-[0_12px_32px_rgba(23,36,28,0.12)]">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        {label}
      </p>
      <ul className="mt-2 space-y-1">
        {payload.map((entry) => (
          <li
            key={String(entry.dataKey)}
            className="flex items-center justify-between gap-6 text-sm"
          >
            <span className="text-muted">{entry.name}</span>
            <span className="tabular-nums font-medium text-ink">
              {AUD.format(Number(entry.value ?? 0))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type IncomeMilestonesChartProps = {
  matches: MoneyMapMatch[];
};

export function IncomeMilestonesChart({ matches }: IncomeMilestonesChartProps) {
  const [mounted, setMounted] = useState(false);
  const series = buildIncomeMilestoneSeries(matches);
  const data = buildIncomeMilestonePoints(matches);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (series.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="income-milestones-heading"
      className="rounded-3xl border border-line bg-cream p-6 shadow-[0_20px_50px_rgba(23,36,28,0.06)] sm:p-8"
    >
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-copper">
        Income milestones
      </p>
      <h2
        id="income-milestones-heading"
        className="mt-2 font-display text-3xl tracking-tight"
      >
        A 12-month illustrative path
      </h2>
      <p className="mt-3 max-w-[650px] leading-relaxed text-muted">
        This chart ramps the listed monthly ranges from your ranked fits over
        twelve months, weighted by match score. It is a planning sketch of
        listed opportunity ranges — not a forecast, and not a promise of
        income.
      </p>

      <div className="mt-8 h-72 w-full min-w-0 sm:h-80">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="rank1Fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d5a3e" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#1d5a3e" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="rank2Fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#12c98d" stopOpacity={0.24} />
                  <stop offset="100%" stopColor="#12c98d" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="rank3Fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c45c26" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#c45c26" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#d9d0c1"
                strokeDasharray="4 8"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#5a6b61", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#d9d0c1" }}
              />
              <YAxis
                tickFormatter={(value: number) =>
                  AUD.format(value).replace("A$", "$")
                }
                tick={{ fill: "#5a6b61", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={64}
                domain={[0, "auto"]}
              />
              <Tooltip
                content={ChartTooltip}
                cursor={{ stroke: "#c45c26", strokeOpacity: 0.35 }}
              />
              {series.map((item) => (
                <Area
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  name={`Rank ${item.rank} · ${item.name}`}
                  stroke={item.color}
                  strokeWidth={item.rank === 1 ? 3 : 2.25}
                  strokeDasharray={item.rank === 2 ? "7 5" : undefined}
                  fill={`url(#${item.key}Fill)`}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0, fill: item.color }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {series.map((item) => (
          <li key={item.key} className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted">
              Rank {item.rank} · {item.name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
