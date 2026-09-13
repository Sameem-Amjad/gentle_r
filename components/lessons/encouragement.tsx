/** Closing words for a lesson, set larger in serif on a soft green surface. */
export function Encouragement({ text }: { text: string }) {
  return (
    <div className="border-sage-200/70 bg-primary-soft/60 rounded-lg border px-6 py-6 sm:px-8 sm:py-7">
      <p className="text-text font-serif text-xl leading-relaxed sm:text-2xl">{text}</p>
    </div>
  );
}
