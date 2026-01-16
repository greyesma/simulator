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
  const [hasPendingRequest, setHasPendingRequest] = useState(
    !!deletionRequestedAt
  );
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
      setSuccess(
        "Account deleted successfully. Redirecting to homepage..."
      );
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
      <h2 className="text-2xl font-bold mb-6 text-destructive">Danger Zone</h2>

      <div className="border-2 border-destructive p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-destructive flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-white"
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
            <h3 className="font-bold mb-1">Delete Account</h3>
            <p className="text-muted-foreground text-sm">
              Permanently delete your account and all associated data. This
              includes your profile, all assessments, recordings, uploaded CVs,
              and reports.
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
            <svg
              className="w-4 h-4"
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
                  Deletion Scheduled
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Requested on {formatDate(requestDate)}. Your account and all
                  data will be permanently deleted within 30 days.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCancelRequest}
                disabled={isCancelling}
                className="px-4 py-2 text-sm font-semibold border-2 border-yellow-700 text-yellow-800 hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="px-4 py-2 text-sm font-semibold border-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
          >
            Delete Account
          </button>
        )}

        {/* Confirmation dialog */}
        {!hasPendingRequest && showConfirmation && (
          <div className="p-6 border-2 border-destructive bg-destructive/5">
            <h4 className="font-bold text-destructive mb-4">
              Choose Deletion Method
            </h4>

            {/* Deletion mode selector */}
            <div className="mb-6 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
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

              <label className="flex items-start gap-3 cursor-pointer">
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
            <div className="mb-6 p-4 border-2 border-border bg-background">
              <p className="font-semibold mb-2">What will be deleted:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-destructive"></span>
                  Your profile information
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-destructive"></span>
                  All assessments and reports
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-destructive"></span>
                  Screen recordings and screenshots
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-destructive"></span>
                  Uploaded CVs and resumes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-destructive"></span>
                  Conversation transcripts
                </li>
              </ul>
            </div>

            {/* Immediate deletion confirmation */}
            {deletionMode === "immediate" && (
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Type{" "}
                  <span className="font-mono bg-muted px-1">
                    DELETE MY ACCOUNT
                  </span>{" "}
                  to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full px-4 py-2 border-2 border-border font-mono text-sm focus:border-destructive focus:outline-none"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {deletionMode === "schedule" ? (
                <button
                  onClick={handleScheduleDeletion}
                  disabled={isRequesting}
                  className="px-4 py-2 text-sm font-semibold bg-destructive text-white border-2 border-destructive hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRequesting ? "Scheduling..." : "Schedule Deletion"}
                </button>
              ) : (
                <button
                  onClick={handleImmediateDeletion}
                  disabled={isDeleting || confirmText !== "DELETE MY ACCOUNT"}
                  className="px-4 py-2 text-sm font-semibold bg-destructive text-white border-2 border-destructive hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
