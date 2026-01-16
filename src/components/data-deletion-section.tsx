"use client";

import { useState } from "react";
import Link from "next/link";

interface DataDeletionSectionProps {
  deletionRequestedAt: Date | null;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function DataDeletionSection({
  deletionRequestedAt,
}: DataDeletionSectionProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(
    !!deletionRequestedAt
  );
  const [requestDate, setRequestDate] = useState<Date | null>(
    deletionRequestedAt
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRequestDeletion = async () => {
    setIsRequesting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/delete-request", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to request deletion");
      }

      setHasPendingRequest(true);
      setRequestDate(new Date(data.requestedAt));
      setSuccess(data.message);
      setShowConfirmation(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelRequest = async () => {
    setIsCancelling(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/delete-request", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel request");
      }

      setHasPendingRequest(false);
      setRequestDate(null);
      setSuccess(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Data & Privacy</h2>

      <div className="border-2 border-border p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-secondary flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold mb-1">Your Data Rights</h3>
            <p className="text-muted-foreground text-sm">
              You can request deletion of all your data at any time. This
              includes your account, assessments, recordings, and all
              associated information.
            </p>
          </div>
        </div>

        {/* Privacy Policy Link */}
        <div className="mb-6 pb-6 border-b border-border">
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 text-foreground font-semibold border-b-2 border-secondary hover:text-secondary"
          >
            <span>Read our Privacy Policy</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 border-2 border-destructive bg-destructive/10 text-destructive font-mono text-sm">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="mb-4 p-4 border-2 border-green-600 bg-green-50 text-green-700 font-mono text-sm">
            {success}
          </div>
        )}

        {/* Pending deletion request */}
        {hasPendingRequest && requestDate && (
          <div className="mb-6 p-4 border-2 border-yellow-500 bg-yellow-50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-500 text-white flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-yellow-800">
                  Deletion Request Pending
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Requested on {formatDate(requestDate)}. Your data will be
                  deleted within 30 days. You can cancel this request if you
                  change your mind.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCancelRequest}
                disabled={isCancelling}
                className="px-4 py-2 text-sm font-semibold border-2 border-yellow-700 text-yellow-800 hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? "Cancelling..." : "Cancel Deletion Request"}
              </button>
            </div>
          </div>
        )}

        {/* Request deletion button */}
        {!hasPendingRequest && !showConfirmation && (
          <button
            onClick={() => setShowConfirmation(true)}
            className="px-4 py-2 text-sm font-semibold border-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
          >
            Request Data Deletion
          </button>
        )}

        {/* Confirmation dialog */}
        {!hasPendingRequest && showConfirmation && (
          <div className="p-4 border-2 border-destructive bg-destructive/5">
            <h4 className="font-bold text-destructive mb-2">
              Are you sure you want to delete your data?
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              This action will delete your account, all assessments, recordings,
              and reports. This cannot be undone after the 30-day grace period.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleRequestDeletion}
                disabled={isRequesting}
                className="px-4 py-2 text-sm font-semibold bg-destructive text-white border-2 border-destructive hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequesting ? "Requesting..." : "Yes, Delete My Data"}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-sm font-semibold border-2 border-border hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
