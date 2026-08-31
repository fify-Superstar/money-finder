"use client";

import { useRouter } from "next/navigation";
import { AssessmentReview } from "@/components/assessment/AssessmentReview";
import { QuestionField } from "@/components/assessment/QuestionField";
import { Button } from "@/components/ui/Button";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { QuestionContainer } from "@/components/ui/QuestionContainer";
import {
  ASSESSMENT_QUESTION_COUNT,
  currentQuestion,
  useAssessment,
} from "@/lib/assessment";

export function AssessmentWorkspace() {
  const router = useRouter();
  const { state, setAnswer, next, back, goToQuestion, submit } =
    useAssessment();
  const question = currentQuestion(state);
  const errorId = "assessment-validation-message";

  if (state.step === "complete") {
    return (
      <div className="space-y-6">
        <QuestionContainer
          step={ASSESSMENT_QUESTION_COUNT}
          total={ASSESSMENT_QUESTION_COUNT}
          title="Assessment received"
          description="Your assessment is complete. Continue to see your personalised Money Map based on these answers. Matches are not a guarantee of income."
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/results">Continue to results</Button>
            <Button href="/" variant="secondary">
              Back to home
            </Button>
          </div>
        </QuestionContainer>
      </div>
    );
  }

  if (state.step === "review") {
    return (
      <div className="space-y-6">
        <ProgressIndicator
          value={ASSESSMENT_QUESTION_COUNT}
          max={ASSESSMENT_QUESTION_COUNT}
          label="Assessment progress"
        />
        <AssessmentReview
          answers={state.answers}
          onEdit={goToQuestion}
          onBack={back}
          onSubmit={() => {
            submit();
            router.push("/results");
          }}
        />
      </div>
    );
  }

  return (
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          next();
        }}
      >
      <ProgressIndicator
        value={question.number}
        max={ASSESSMENT_QUESTION_COUNT}
        label={`Question ${question.number} of ${ASSESSMENT_QUESTION_COUNT}`}
      />
      <QuestionContainer
        step={question.number}
        total={ASSESSMENT_QUESTION_COUNT}
        title={question.prompt}
        description={question.helpText}
      >
        <QuestionField
          question={question}
          answers={state.answers}
          error={
            question.type === "email" ? state.validationMessage : null
          }
          onChange={setAnswer}
        />
        {state.validationMessage && question.type !== "email" ? (
          <p id={errorId} role="alert" className="mt-4 text-sm text-danger">
            {state.validationMessage}
          </p>
        ) : null}
      </QuestionContainer>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          variant="secondary"
          type="button"
          onClick={back}
          disabled={state.currentIndex === 0}
        >
          Back
        </Button>
        <Button
          type="submit"
          aria-describedby={state.validationMessage ? errorId : undefined}
        >
          {state.currentIndex === ASSESSMENT_QUESTION_COUNT - 1
            ? "Review answers"
            : "Next"}
        </Button>
      </div>
      </form>
  );
}
