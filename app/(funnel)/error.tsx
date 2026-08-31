"use client";

import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Container } from "@/components/layout/Container";

export default function FunnelError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="py-16">
      <ErrorState
        title="This page could not be loaded"
        message="An unexpected error occurred. You can try again, or go back to the home page."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={reset}>
              Try again
            </Button>
            <Button href="/" variant="secondary">
              Back to home
            </Button>
          </div>
        }
      />
    </Container>
  );
}
