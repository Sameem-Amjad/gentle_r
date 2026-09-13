import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContentBlocks } from "./content-blocks";
import { SourceList } from "./source-list";
import { PlaceholderBadge } from "./placeholder-badge";

describe("ContentBlocks", () => {
  it("renders every block type as semantic HTML", () => {
    render(
      <ContentBlocks
        blocks={[
          { type: "paragraph", text: "First." },
          { type: "heading", text: "Why it matters" },
          { type: "quote", text: "A line.", attribution: "Someone" },
          { type: "list", items: ["one", "two"] },
          { type: "list", items: ["a", "b"], ordered: true },
        ]}
      />,
    );
    expect(screen.getByText("First.").tagName).toBe("P");
    expect(screen.getByRole("heading", { level: 2, name: "Why it matters" })).toBeInTheDocument();
    const quote = screen.getByText("A line.").closest("blockquote");
    expect(quote).not.toBeNull();
    expect(quote?.querySelector("footer")).toHaveTextContent("Someone");
    const lists = screen.getAllByRole("list");
    expect(lists.map((l) => l.tagName)).toEqual(["UL", "OL"]);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("uses the requested heading level inside cards", () => {
    render(<ContentBlocks headingLevel={3} blocks={[{ type: "heading", text: "Inside a card" }]} />);
    expect(screen.getByRole("heading", { level: 3, name: "Inside a card" })).toBeInTheDocument();
  });
});

describe("SourceList", () => {
  it("opens sources in a new tab safely and shows notes", () => {
    render(
      <SourceList
        sources={[{ label: "NHS breathing", url: "https://www.nhs.uk/", note: "A short guide." }]}
      />,
    );
    const link = screen.getByRole("link", { name: /NHS breathing/ });
    expect(link).toHaveAttribute("href", "https://www.nhs.uk/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAccessibleName(/opens in a new tab/);
    expect(screen.getByText("A short guide.")).toBeInTheDocument();
  });

  it("renders nothing when there are no sources", () => {
    const { container } = render(<SourceList sources={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("PlaceholderBadge", () => {
  it("marks placeholder lessons and stays quiet otherwise", () => {
    const { rerender } = render(<PlaceholderBadge status="placeholder" />);
    expect(screen.getByText("Preview copy")).toBeInTheDocument();
    rerender(<PlaceholderBadge status="published" />);
    expect(screen.queryByText("Preview copy")).not.toBeInTheDocument();
  });
});
