import { LoadingState } from "@/components/ui/LoadingState";
import { Container } from "@/components/layout/Container";

export default function FunnelLoading() {
  return (
    <Container className="py-16">
      <LoadingState label="Loading" />
    </Container>
  );
}
