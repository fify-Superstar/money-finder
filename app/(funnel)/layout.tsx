import { AssessmentProvider } from "@/lib/assessment";
import type { ReactNode } from "react";

export default function FunnelLayout({ children }: { children: ReactNode }) {
  return <AssessmentProvider>{children}</AssessmentProvider>;
}
