import { Container } from "@/components/shell/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function LessonsLoading() {
  return (
    <Container width="wide" aria-busy="true" aria-label="Loading lessons">
      <div className="mb-8 space-y-3 sm:mb-10">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-3/5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </Container>
  );
}
