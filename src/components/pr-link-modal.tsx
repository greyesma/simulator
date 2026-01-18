"use client";

import { useState } from "react";

interface PrLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prUrl: string) => Promise<void>;
  managerName: string;
}

export function PrLinkModal({
  isOpen,
  onClose,
  onSubmit,
  managerName,
}: PrLinkModalProps) {
  const [prUrl, setPrUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);

    if (!prUrl.trim()) {
      setError("Please enter a PR link");
      return;
    }

    // Basic URL validation
    try {
      new URL(prUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    if (!prUrl.startsWith("https://")) {
      setError("URL must start with https://");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(prUrl.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit PR link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="bg-foreground/80 absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-md border-4 border-foreground bg-background p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold">Ready to Submit?</h2>
          <p className="text-muted-foreground">
            Great work! Please share your PR link so {managerName} can review
            your code and schedule the final defense.
          </p>
        </div>

        {/* PR Link Input */}
        <div className="mb-6">
          <label
            htmlFor="prUrl"
            className="mb-2 block font-mono text-sm font-bold"
          >
            PR/MR Link
          </label>
          <input
            id="prUrl"
            type="url"
            value={prUrl}
            onChange={(e) => {
              setPrUrl(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="https://github.com/org/repo/pull/123"
            disabled={isSubmitting}
            className="w-full border-2 border-foreground bg-background px-4 py-3 font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
            autoFocus
          />
          {error && (
            <p className="mt-2 font-mono text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Helpful hint */}
        <div className="bg-secondary/20 mb-6 border-2 border-foreground p-4">
          <p className="text-sm">
            <span className="font-bold">Accepted formats:</span> GitHub PRs,
            GitLab MRs, or Bitbucket Pull Requests
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 border-2 border-foreground bg-background px-6 py-3 font-bold text-foreground hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !prUrl.trim()}
            className="hover:bg-secondary/80 flex-1 border-2 border-foreground bg-secondary px-6 py-3 font-bold text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit PR"}
          </button>
        </div>
      </div>
    </div>
  );
}
