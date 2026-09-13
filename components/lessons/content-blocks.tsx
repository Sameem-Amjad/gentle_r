import { cn } from "@/lib/utils";
import type { ContentBlock } from "@/lib/content/schema";

type HeadingLevel = 2 | 3;

interface ContentBlocksProps {
  blocks: ContentBlock[];
  /** Level used for "heading" blocks. Use 3 inside a card that already has an h2. */
  headingLevel?: HeadingLevel;
  className?: string;
}

/**
 * Renders lesson content blocks as plain semantic HTML. Typography comes from
 * the `prose-lesson` utility on a parent; this component only adds the
 * spacing the utility does not cover (for example a paragraph after a list).
 */
export function ContentBlocks({ blocks, headingLevel = 2, className }: ContentBlocksProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className={cn("[&>*+*]:mt-[1.1em]", className)}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return <p key={index}>{block.text}</p>;
          case "heading":
            return (
              <Heading key={index} className={headingLevel === 2 ? "text-2xl" : "text-xl"}>
                {block.text}
              </Heading>
            );
          case "quote":
            return (
              <blockquote key={index}>
                <p>{block.text}</p>
                {block.attribution ? (
                  <footer className="text-muted mt-2 font-sans text-sm">
                    <span aria-hidden="true">· </span>
                    {block.attribution}
                  </footer>
                ) : null}
              </blockquote>
            );
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return (
              <List key={index} className={block.ordered ? "list-decimal" : "list-disc"}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </List>
            );
          }
        }
      })}
    </div>
  );
}
