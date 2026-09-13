import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PasswordInput } from "./password-input";

describe("PasswordInput", () => {
  it("hides the password by default and toggles with a pressed button", () => {
    render(<PasswordInput aria-label="Password" name="password" />);
    const input = screen.getByLabelText("Password");
    const toggle = screen.getByRole("button", { name: "Show password" });

    expect(input).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    // The label stays stable; only the pressed state changes.
    expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "password");
  });
});
