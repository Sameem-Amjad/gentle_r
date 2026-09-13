import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authCopy } from "@/lib/auth/errors";

const deleteAccount = vi.fn();

vi.mock("@/lib/auth/actions", () => ({
  deleteAccount: (...args: unknown[]) => deleteAccount(...args),
}));

import { DeleteAccountDialog } from "./delete-account-dialog";

describe("DeleteAccountDialog", () => {
  beforeEach(() => {
    deleteAccount.mockReset();
  });

  it("keeps the delete button disabled until the word is typed, then shows a server error inside the dialog", async () => {
    deleteAccount.mockResolvedValue({ ok: false, error: authCopy.deleteFailed });

    render(<DeleteAccountDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Delete my account" }));

    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent("Delete your account?");

    const confirm = screen.getByRole("button", { name: "Delete my account" });
    expect(confirm).toBeDisabled();

    const input = screen.getByLabelText("Type delete to confirm");
    fireEvent.change(input, { target: { value: "nope" } });
    expect(confirm).toBeDisabled();

    fireEvent.change(input, { target: { value: "DELETE" } });
    expect(confirm).toBeEnabled();

    fireEvent.submit(input.closest("form") as HTMLFormElement);

    await waitFor(() => expect(deleteAccount).toHaveBeenCalledTimes(1));
    const formData = deleteAccount.mock.calls[0][1] as FormData;
    expect(formData.get("confirmation")).toBe("DELETE");

    // Failure: the message appears in the dialog, the dialog stays open, and
    // nothing claims success.
    expect(await screen.findByText(authCopy.deleteFailed)).toBeInTheDocument();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.queryByText(/deleted\./i)).not.toBeInTheDocument();
  });
});
