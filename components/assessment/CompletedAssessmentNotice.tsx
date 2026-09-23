"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { readStoredAssessment } from "@/lib/assessment";

export function CompletedAssessmentNotice() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStoredAssessment();
    if (stored?.step === "complete" && stored.answers.firstName) {
      setName(stored.answers.firstName);
    }
  }, []);

  if (!name) {
    return null;
  }

  return (
    <EmptyState
      title={`Thanks, ${name}`}
      description="Your assessment is saved on this device. Continue to results for your personalised Money Map. Matches are not a guarantee of income."
    />
  );
}
