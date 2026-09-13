import Link from "next/link";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReflectionPromptsProps {
  questions: string[];
  bookId: string;
  lessonId: string;
}

/**
 * Read-only prompts. Nothing is collected here; the button simply opens the
 * private journal, which may use the lesson reference as a title suggestion.
 */
export function ReflectionPrompts({ questions, bookId, lessonId }: ReflectionPromptsProps) {
  if (questions.length === 0) return null;
  const journalHref = `/journal/new?lesson=${bookId}/${lessonId}`;

  return (
    <section aria-labelledby="reflection-heading">
      <h2 id="reflection-heading" className="text-text text-2xl">
        Reflection
      </h2>
      <p className="text-muted mt-2">These are prompts to sit with. There is nothing to submit.</p>
      <ul className="mt-5 space-y-3">
        {questions.map((question) => (
          <li key={question} className="text-text flex gap-3 font-serif text-lg leading-relaxed">
            <span aria-hidden="true" className="bg-sage-300 mt-3 size-1.5 shrink-0 rounded-full" />
            <span>{question}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button asChild variant="secondary">
          <Link href={journalHref}>
            <PenLine aria-hidden="true" className="size-4" />
            Write in my journal
          </Link>
        </Button>
        <p className="text-faint text-sm">Your journal is private. It needs an account.</p>
      </div>
    </section>
  );
}
