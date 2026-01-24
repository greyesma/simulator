/**
 * Rejection Feedback Modal Component
 *
 * Modal for collecting feedback when rejecting a candidate from search results.
 * Allows hiring managers to explain why a candidate isn't a fit, which is used
 * to refine search criteria automatically.
 *
 * @since 2026-01-17
 * @see Issue #75: US-012b
 */

"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Textarea,
} from "@/components/ui";

// ============================================================================
// Types
// ============================================================================

export interface RejectionFeedbackModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Name of the candidate being rejected */
  candidateName: string;
  /** Called when modal should close */
  onClose: () => void;
  /** Called when feedback is submitted */
  onSubmit: (feedback: string) => Promise<void> | void;
}

// ============================================================================
// Component
// ============================================================================

export function RejectionFeedbackModal({
  isOpen,
  candidateName,
  onClose,
  onSubmit,
}: RejectionFeedbackModalProps) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!feedback.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(feedback);
      setFeedback("");
    } finally {
      setIsSubmitting(false);
    }
  }, [feedback, isSubmitting, onSubmit]);

  // Handle open change from Dialog (includes Escape key and overlay click)
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent data-testid="rejection-feedback-modal">
        <DialogHeader>
          <DialogTitle>Not a fit: {candidateName}</DialogTitle>
          <DialogDescription>
            Why isn&apos;t this candidate a fit?
          </DialogDescription>
        </DialogHeader>

        {/* Feedback Input */}
        <Textarea
          data-testid="feedback-input"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder='e.g., "Need 8+ years, not 5" or "Looking for more frontend focus"'
          rows={4}
          disabled={isSubmitting}
          className="resize-none"
        />

        {/* Actions */}
        <DialogFooter>
          <Button
            data-testid="cancel-button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            data-testid="submit-feedback-button"
            onClick={handleSubmit}
            disabled={!feedback.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  data-testid="submit-loading"
                />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
