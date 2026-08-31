import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Assessment — Money Finder",
  description:
    "The Money Finder assessment will collect your answers and produce a personalised Top 3 Money Map.",
};

export default function AssessmentPage() {
  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-moss">
        Coming next
      </p>
      <h1 className="font-display text-4xl tracking-tight text-ink sm:text-5xl">
        Assessment
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">
        The Money Finder assessment is not ready yet. This page is a placeholder
        for the questions that will collect your answers, run them through the
        matching logic, and produce your personalised Top 3 Money Map.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center justify-center rounded-full border border-line bg-cream px-6 py-3 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
      >
        Back to Money Finder
      </Link>
    </section>
  );
}
