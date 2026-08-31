"use client";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { OptionSelector } from "@/components/ui/OptionSelector";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { QuestionContainer } from "@/components/ui/QuestionContainer";
import {
  currentSlot,
  questionsAreLoaded,
  selectedOptionId,
  useAssessment,
} from "@/lib/assessment";

export function AssessmentWorkspace() {
  const { state, back, next } = useAssessment();
  const slot = currentSlot(state);
  const loaded = questionsAreLoaded(state);
  const canGoBack = state.currentIndex > 0;
  const canGoNext = state.currentIndex < state.totalQuestions - 1;

  return (
    <div className="space-y-6">
      <ProgressIndicator
        value={state.currentIndex + 1}
        max={state.totalQuestions}
        label="Assessment progress"
      />

      {state.status === "loading" ? (
        <LoadingState label="Loading the assessment" />
      ) : null}

      {state.status === "error" ? (
        <ErrorState
          message={
            state.errorMessage ?? "The assessment could not be loaded."
          }
        />
      ) : null}

      {state.status === "unloaded" ? (
        <EmptyState
          title="Questions are not loaded yet"
          description="This assessment can hold 12 questions and answers. The final questions will come from the Money Finder specification and are not defined in this foundation."
        />
      ) : null}

      <QuestionContainer
        step={slot.index + 1}
        total={state.totalQuestions}
        title={slot.prompt ?? "Question prompt pending"}
        description={slot.helpText}
      >
        <OptionSelector
          name={slot.id}
          legend={slot.prompt ?? `Options for question ${slot.index + 1}`}
          options={slot.options}
          value={selectedOptionId(state.answers[slot.id] ?? null)}
          disabled={!loaded}
        />
      </QuestionContainer>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="secondary" onClick={back} disabled={!canGoBack}>
          Back
        </Button>
        <Button onClick={next} disabled={!canGoNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
