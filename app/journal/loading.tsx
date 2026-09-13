import { Container } from "@/components/shell/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function JournalLoading() {
  return (
    <Container width="reading" className="space-y-6" aria-busy="true" aria-label="Loading your journal">
      <div className="space-y-3">
        <Skeleton className="h-9 w-2/5" />
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="mt-6 h-11 w-32" />
      </div>
      <div className="grid gap-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
    </Container>
  );
}
