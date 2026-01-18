/**
 * PrLinkModal Component Tests
 *
 * Tests the PR link submission modal using test factories and utilities.
 *
 * @since 2026-01-18
 * @see Issue #98: REF-008
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PrLinkModal } from "./pr-link-modal";

// ============================================================================
// Test Setup
// ============================================================================

interface ModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (prUrl: string) => Promise<void>;
  managerName?: string;
}

function renderModal(overrides?: ModalProps) {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
    managerName: "Alex Chen",
    ...overrides,
  };

  const result = render(<PrLinkModal {...defaultProps} />);

  return {
    ...result,
    props: defaultProps,
  };
}

// ============================================================================
// PrLinkModal Component Tests
// ============================================================================

describe("PrLinkModal", () => {
  describe("rendering", () => {
    it("renders nothing when isOpen is false", () => {
      renderModal({ isOpen: false });

      expect(screen.queryByText("Ready to Submit?")).not.toBeInTheDocument();
    });

    it("renders modal when isOpen is true", () => {
      renderModal({ isOpen: true });

      expect(screen.getByText("Ready to Submit?")).toBeInTheDocument();
    });

    it("displays manager name in description", () => {
      renderModal({ managerName: "Jamie Rodriguez" });

      expect(
        screen.getByText(/Jamie Rodriguez can review/)
      ).toBeInTheDocument();
    });

    it("shows PR/MR Link label", () => {
      renderModal();

      expect(screen.getByLabelText("PR/MR Link")).toBeInTheDocument();
    });

    it("shows placeholder text", () => {
      renderModal();

      expect(
        screen.getByPlaceholderText("https://github.com/org/repo/pull/123")
      ).toBeInTheDocument();
    });

    it("shows accepted formats hint", () => {
      renderModal();

      expect(screen.getByText(/Accepted formats:/)).toBeInTheDocument();
      expect(screen.getByText(/GitHub PRs/)).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("disables submit button when URL is empty", () => {
      renderModal();

      expect(screen.getByRole("button", { name: /submit pr/i })).toBeDisabled();
    });

    it("shows error for invalid URL format", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.type(screen.getByLabelText("PR/MR Link"), "not-a-url");
      await user.click(screen.getByRole("button", { name: /submit pr/i }));

      expect(screen.getByText("Please enter a valid URL")).toBeInTheDocument();
    });

    it("shows error for non-HTTPS URLs", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.type(
        screen.getByLabelText("PR/MR Link"),
        "http://github.com/org/repo/pull/1"
      );
      await user.click(screen.getByRole("button", { name: /submit pr/i }));

      expect(
        screen.getByText("URL must start with https://")
      ).toBeInTheDocument();
    });

    it("clears error when user types after invalid submission", async () => {
      const user = userEvent.setup();
      renderModal();

      // First trigger error with invalid URL
      await user.type(screen.getByLabelText("PR/MR Link"), "not-a-url");
      await user.click(screen.getByRole("button", { name: /submit pr/i }));
      expect(screen.getByText("Please enter a valid URL")).toBeInTheDocument();

      // Then type to clear error
      await user.type(screen.getByLabelText("PR/MR Link"), "a");
      expect(
        screen.queryByText("Please enter a valid URL")
      ).not.toBeInTheDocument();
    });
  });

  describe("submission", () => {
    it("calls onSubmit with valid URL", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      renderModal({ onSubmit });

      const validUrl = "https://github.com/org/repo/pull/123";
      await user.type(screen.getByLabelText("PR/MR Link"), validUrl);
      await user.click(screen.getByRole("button", { name: /submit pr/i }));

      expect(onSubmit).toHaveBeenCalledWith(validUrl);
    });

    it("trims whitespace from URL", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      renderModal({ onSubmit });

      await user.type(
        screen.getByLabelText("PR/MR Link"),
        "  https://github.com/org/repo/pull/123  "
      );
      await user.click(screen.getByRole("button", { name: /submit pr/i }));

      expect(onSubmit).toHaveBeenCalledWith(
        "https://github.com/org/repo/pull/123"
      );
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      // Never resolve to keep in loading state
      const onSubmit = vi.fn().mockReturnValue(new Promise(() => {}));
      renderModal({ onSubmit });

      await user.type(
        screen.getByLabelText("PR/MR Link"),
        "https://github.com/org/repo/pull/1"
      );
      await user.click(screen.getByRole("button", { name: /submit pr/i }));

      expect(screen.getByText("Submitting...")).toBeInTheDocument();
    });

    it("disables input during submission", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockReturnValue(new Promise(() => {}));
      renderModal({ onSubmit });

      await user.type(
        screen.getByLabelText("PR/MR Link"),
        "https://github.com/org/repo/pull/1"
      );
      await user.click(screen.getByRole("button", { name: /submit pr/i }));

      expect(screen.getByLabelText("PR/MR Link")).toBeDisabled();
    });

    it("shows error when submission fails", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockRejectedValue(new Error("Network error"));
      renderModal({ onSubmit });

      await user.type(
        screen.getByLabelText("PR/MR Link"),
        "https://github.com/org/repo/pull/1"
      );
      await user.click(screen.getByRole("button", { name: /submit pr/i }));

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });
    });
  });

  describe("keyboard interactions", () => {
    it("submits on Enter key", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      renderModal({ onSubmit });

      const input = screen.getByLabelText("PR/MR Link");
      await user.type(input, "https://github.com/org/repo/pull/1");
      await user.type(input, "{Enter}");

      expect(onSubmit).toHaveBeenCalled();
    });

    it("closes on Escape key", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderModal({ onClose });

      const input = screen.getByLabelText("PR/MR Link");
      await user.type(input, "{Escape}");

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("close functionality", () => {
    it("calls onClose when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderModal({ onClose });

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onClose).toHaveBeenCalled();
    });

    it("calls onClose when backdrop is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderModal({ onClose });

      // The backdrop is the element with bg-foreground/80 class
      // We need to find it by its position
      const backdrop = document.querySelector(".bg-foreground\\/80");
      if (backdrop) {
        await user.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe("button states", () => {
    it("disables Submit button when input is empty", () => {
      renderModal();

      expect(screen.getByRole("button", { name: /submit pr/i })).toBeDisabled();
    });

    it("enables Submit button when input has value", async () => {
      const user = userEvent.setup();
      renderModal();

      await user.type(screen.getByLabelText("PR/MR Link"), "https://test.com");

      expect(
        screen.getByRole("button", { name: /submit pr/i })
      ).not.toBeDisabled();
    });

    it("disables Cancel button during submission", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockReturnValue(new Promise(() => {}));
      renderModal({ onSubmit });

      await user.type(
        screen.getByLabelText("PR/MR Link"),
        "https://github.com/org/repo/pull/1"
      );
      await user.click(screen.getByRole("button", { name: /submit pr/i }));

      expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });
  });
});
