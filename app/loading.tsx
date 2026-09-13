import { Container } from "@/components/shell/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="space-y-6 py-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-2/5" />
      <Skeleton className="h-5 w-3/5" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </Container>
  );
}
