"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { siteConfig } from "@/config/site";
import { hasUnsavedWork } from "@/lib/journal/autosave-machine";
import type { EntryPayload } from "@/lib/journal/schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { AutoGrowTextarea } from "./auto-grow-textarea";
import { ConflictBanner } from "./conflict-banner";
import { DeleteEntryButton } from "./delete-entry-button";
import { LocalDateTime, useLocalDateTime } from "./local-date-time";
import { RecoveredDraftBanner } from "./recovered-draft-banner";
import { SaveStatus } from "./save-status";
import { useAutosave } from "./use-autosave";
import { useLocalDraft } from "./use-local-draft";
import { useUnsavedGuard } from "./use-unsaved-guard";

interface EntryEditorProps {
  mode: "new" | "edit";
  entry?: EntryPayload;
  /** Placeholder only; nothing is prefilled or saved. */
  suggestedTitlePlaceholder?: string;
}

/**
 * The writing surface. Title and body save themselves; the status line
 * says "Saved" only after the server confirms. Nothing here counts words,
 * times the person or asks them to finish.
 */
export function EntryEditor({ mode, entry, suggestedTitlePlaceholder }: EntryEditorProps) {
  const { toast } = useToast();
  const autosave = useAutosave({ mode, entry });
  const { state } = autosave;
  const { recovered, restoreRecovered, discardRecovered } = useLocalDraft(state, autosave.restoreDraft);

  const unsaved = hasUnsavedWork(state);
  useUnsavedGuard({ active: unsaved || state.status === "saving", saveNow: autosave.saveNow });

  const titleId = React.useId();
  const bodyId = React.useId();
  const createdLabel = useLocalDateTime(state.createdAt ?? "");

  const copyText = React.useCallback(async () => {
    const ok = await autosave.copyDraft();
    toast(
      ok
        ? { title: "Copied", tone: "success" }
        : { title: "Couldn't copy. You can still select the text and copy it yourself.", tone: "error" },
    );
  }, [autosave, toast]);

  const onBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    void autosave.saveNow();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      void autosave.saveNow();
    }
  };

  const showSaveNow = unsaved && state.status !== "saving" && state.status !== "conflict";
  const deleteLabel = state.draft.title.trim() || createdLabel || "this entry";

  return (
    <div className="space-y-4" onBlur={onBlur} onKeyDown={onKeyDown}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <Link
          href="/journal"
          className="text-muted hover:text-text inline-flex items-center gap-1.5 rounded-md py-1 pr-1 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          My Journal
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {showSaveNow ? (
            <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={() => void autosave.saveNow()}>
              Save now
            </Button>
          ) : null}
          <SaveStatus
            state={state}
            onRetry={autosave.retry}
            onCopy={() => void copyText()}
            className="text-right"
          />
        </div>
      </div>

      {recovered ? <RecoveredDraftBanner onRestore={restoreRecovered} onDiscard={discardRecovered} /> : null}

      {state.status === "conflict" && state.conflict ? (
        <ConflictBanner
          current={state.conflict}
          onUseTheirs={autosave.resolveUseTheirs}
          onKeepMine={autosave.resolveKeepMine}
          onCopyMine={() => void copyText()}
        />
      ) : null}

      <Card glass className="px-4 py-5 sm:px-8 sm:py-8">
        <label htmlFor={titleId} className="sr-only">
          Title
        </label>
        <input
          id={titleId}
          type="text"
          value={state.draft.title}
          onChange={(event) => autosave.edit({ title: event.target.value })}
          placeholder={suggestedTitlePlaceholder ?? "Title (optional)"}
          maxLength={siteConfig.journal.maxTitleChars}
          autoComplete="off"
          enterKeyHint="next"
          className="text-text placeholder:text-faint focus:ring-ring/30 w-full rounded-sm bg-transparent font-serif text-2xl leading-tight transition-[box-shadow] duration-200 focus:ring-3 focus:outline-none sm:text-3xl"
        />

        {state.createdAt ? (
          <p className="text-faint mt-2 text-sm">
            Started <LocalDateTime value={state.createdAt} />
          </p>
        ) : null}

        <label htmlFor={bodyId} className="sr-only">
          What&apos;s on your mind?
        </label>
        <AutoGrowTextarea
          id={bodyId}
          value={state.draft.body}
          onChange={(event) => autosave.edit({ body: event.target.value })}
          placeholder="What's on your mind?"
          autoFocus={mode === "new"}
          className="prose-lesson text-text placeholder:text-faint focus:ring-ring/30 mt-5 min-h-[50vh] rounded-sm bg-transparent transition-[box-shadow] duration-200 focus:ring-3 focus:outline-none"
        />
      </Card>

      {state.entryId ? (
        <div className="flex items-center justify-between pt-1">
          <DeleteEntryButton
            entryId={state.entryId}
            label={deleteLabel}
            appearance="text"
            afterDelete="journal"
            onDeleted={autosave.disarm}
          />
        </div>
      ) : null}
    </div>
  );
}
