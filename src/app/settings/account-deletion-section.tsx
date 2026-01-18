"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AccountDeletionSectionProps {
  deletionRequestedAt: Date | null;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

type DeletionMode = "schedule" | "immediate";

export function AccountDeletionSection({
  deletionRequestedAt,
}: AccountDeletionSectionProps) {
  const router = useRouter();
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] =
    useState(!!deletionRequestedAt);
  const [requestDate, setRequestDate] = useState<Date | null>(
    deletionRequestedAt
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deletionMode, setDeletionMode] = useState<DeletionMode>("schedule");
  const [confirmText, setConfirmText] = useState("");

  const handleScheduleDeletion = async () => {
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

  const handleImmediateDeletion = async () => {
    if (confirmText !== "DELETE MY ACCOUNT") {
      setError('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    setIsDeleting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE MY ACCOUNT" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Account deleted - redirect to sign-out
      setSuccess("Account deleted successfully. Redirecting to homepage...");
      setTimeout(() => {
        router.push("/api/auth/signout");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDeleting(false);
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
      <h2 className="mb-6 text-2xl font-bold text-destructive">Danger Zone</h2>

      <div className="border-2 border-destructive p-6">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-destructive">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="mb-1 font-bold">Delete Account</h3>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This
              includes your profile, all assessments, recordings, uploaded CVs,
              and reports.
            </p>
          </div>
        </div>

        {/* Privacy Policy Link */}
        <div className="mb-6 border-b border-border pb-6">
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 border-b-2 border-secondary font-semibold text-foreground hover:text-secondary"
          >
            <span>Read our Privacy Policy</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="square" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 mb-4 border-2 border-destructive p-4 font-mono text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="mb-4 border-2 border-green-600 bg-green-50 p-4 font-mono text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Pending deletion request */}
        {hasPendingRequest && requestDate && (
          <div className="mb-6 border-2 border-yellow-500 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-yellow-500 text-white">
                <svg
                  className="h-5 w-5"
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
                  Deletion Scheduled
                </h4>
                <p className="mt-1 text-sm text-yellow-700">
                  Requested on {formatDate(requestDate)}. Your account and all
                  data will be permanently deleted within 30 days.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCancelRequest}
                disabled={isCancelling}
                className="border-2 border-yellow-700 px-4 py-2 text-sm font-semibold text-yellow-800 hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel Deletion"}
              </button>
            </div>
          </div>
        )}

        {/* Delete options */}
        {!hasPendingRequest && !showConfirmation && (
          <button
            onClick={() => setShowConfirmation(true)}
            className="border-2 border-destructive px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive hover:text-white"
          >
            Delete Account
          </button>
        )}

        {/* Confirmation dialog */}
        {!hasPendingRequest && showConfirmation && (
          <div className="bg-destructive/5 border-2 border-destructive p-6">
            <h4 className="mb-4 font-bold text-destructive">
              Choose Deletion Method
            </h4>

            {/* Deletion mode selector */}
            <div className="mb-6 space-y-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="deletionMode"
                  checked={deletionMode === "schedule"}
                  onChange={() => setDeletionMode("schedule")}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold">Schedule Deletion (30 days)</p>
                  <p className="text-sm text-muted-foreground">
                    Your account will be marked for deletion. You have 30 days
                    to change your mind before data is permanently removed.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="deletionMode"
                  checked={deletionMode === "immediate"}
                  onChange={() => setDeletionMode("immediate")}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold">Delete Immediately</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data right now. This
                    action cannot be undone.
                  </p>
                </div>
              </label>
            </div>

            {/* What will be deleted */}
            <div className="mb-6 border-2 border-border bg-background p-4">
              <p className="mb-2 font-semibold">What will be deleted:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-destructive"></span>
                  Your profile information
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-destructive"></span>
                  All assessments and reports
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-destructive"></span>
                  Screen recordings and screenshots
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-destructive"></span>
                  Uploaded CVs and resumes
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-destructive"></span>
                  Conversation transcripts
                </li>
              </ul>
            </div>

            {/* Immediate deletion confirmation */}
            {deletionMode === "immediate" && (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold">
                  Type{" "}
                  <span className="bg-muted px-1 font-mono">
                    DELETE MY ACCOUNT
                  </span>{" "}
                  to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full border-2 border-border px-4 py-2 font-mono text-sm focus:border-destructive focus:outline-none"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {deletionMode === "schedule" ? (
                <button
                  onClick={handleScheduleDeletion}
                  disabled={isRequesting}
                  className="hover:bg-destructive/90 border-2 border-destructive bg-destructive px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRequesting ? "Scheduling..." : "Schedule Deletion"}
                </button>
              ) : (
                <button
                  onClick={handleImmediateDeletion}
                  disabled={isDeleting || confirmText !== "DELETE MY ACCOUNT"}
                  className="hover:bg-destructive/90 border-2 border-destructive bg-destructive px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Now"}
                </button>
              )}
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setConfirmText("");
                  setDeletionMode("schedule");
                }}
                className="border-2 border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
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
