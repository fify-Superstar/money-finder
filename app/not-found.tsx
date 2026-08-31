import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Container } from "@/components/layout/Container";

export default function NotFound() {
  return (
    <Container className="py-16">
      <EmptyState
        title="Page not found"
        description="That page is not part of Money Finder."
        action={
          <Button href="/" variant="secondary">
            Back to home
          </Button>
        }
      />
    </Container>
  );
}
