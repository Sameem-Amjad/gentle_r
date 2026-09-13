"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteEntry } from "@/lib/journal/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Spinner,
  useToast,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface DeleteEntryButtonProps {
  entryId: string;
  /** Title or date used in the accessible name: "Delete entry: <label>". */
  label: string;
  /** "icon" for lists, "text" for the editor. */
  appearance?: "icon" | "text";
  /** Where to go afterwards: refresh the list or return to it. */
  afterDelete?: "refresh" | "journal";
  /** Called after a confirmed deletion, before navigating. */
  onDeleted?: () => void;
  className?: string;
}

export function DeleteEntryButton({
  entryId,
  label,
  appearance = "icon",
  afterDelete = "refresh",
  onDeleted,
  className,
}: DeleteEntryButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const confirm = async (event: React.MouseEvent) => {
    // Keep the dialog open while the request runs.
    event.preventDefault();
    if (pending) return;
    setPending(true);
    let result: Awaited<ReturnType<typeof deleteEntry>>;
    try {
      result = await deleteEntry({ id: entryId });
    } catch {
      result = { ok: false, error: "network" };
    }
    setPending(false);

    if (!result.ok) {
      toast({ title: "Couldn't delete. Nothing has changed.", tone: "error" });
      return;
    }

    setOpen(false);
    onDeleted?.();
    toast({ title: "Entry deleted", tone: "success" });
    if (afterDelete === "journal") router.push("/journal");
    else router.refresh();
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) setOpen(next);
      }}
    >
      <AlertDialogTrigger asChild>
        {appearance === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete entry: ${label}`}
            className={cn("text-muted hover:text-danger size-10", className)}
          >
            <Trash2 className="size-4.5" aria-hidden="true" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className={cn("text-muted hover:text-danger", className)}>
            <Trash2 className="size-4" aria-hidden="true" />
            Delete entry
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle className="text-text text-xl">Delete this entry?</AlertDialogTitle>
        <AlertDialogDescription className="text-muted mt-2 text-sm">
          It will be removed from your journal. This can&apos;t be undone.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="danger"
            onClick={confirm}
            disabled={pending}
            aria-busy={pending || undefined}
          >
            {pending ? (
              <>
                <Spinner className="size-4" label="Deleting" />
                Deleting
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
