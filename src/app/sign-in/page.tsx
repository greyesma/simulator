"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function GeometricDecoration() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Triangle - top left */}
      <div
        className="absolute -left-16 -top-16 h-64 w-64 bg-secondary"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
      {/* Small triangle - bottom right */}
      <div
        className="absolute -bottom-8 -right-8 h-32 w-32 bg-foreground"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      />
    </div>
  );
}

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setFormError("Invalid email or password");
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      }
    } catch {
      setFormError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <>
      {/* Error messages */}
      {(error || formError) && (
        <div className="bg-destructive/10 mb-6 border-2 border-destructive p-4 font-mono text-sm text-destructive">
          {error === "CredentialsSignin"
            ? "Invalid email or password"
            : error === "OAuthAccountNotLinked"
              ? "Email already registered with different provider"
              : formError || "Authentication failed"}
        </div>
      )}

      {/* Google OAuth */}
      <button
        onClick={handleGoogleSignIn}
        className="mb-6 flex w-full items-center justify-center gap-3 border-2 border-foreground bg-background px-4 py-4 font-semibold text-foreground hover:border-secondary hover:bg-secondary"
        type="button"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 font-mono text-sm text-muted-foreground">
            OR
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleCredentialsSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="mb-2 block font-mono text-sm text-muted-foreground"
          >
            EMAIL
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full border-2 border-border bg-background px-4 py-3 font-mono focus:border-secondary focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="mb-2 block font-mono text-sm text-muted-foreground"
          >
            PASSWORD
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full border-2 border-border bg-background px-4 py-3 font-mono focus:border-secondary focus:outline-none"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full border-2 border-foreground bg-foreground px-4 py-4 font-semibold text-background hover:border-secondary hover:bg-secondary hover:text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign in with Email"}
        </button>
      </form>

      {/* Sign up link */}
      <p className="mt-6 text-center text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="border-b-2 border-secondary font-semibold text-foreground hover:text-secondary"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}

function SignInFormFallback() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-14 bg-muted" />
      <div className="mb-6 h-px bg-border" />
      <div className="space-y-4">
        <div className="h-4 w-16 bg-muted" />
        <div className="h-12 bg-muted" />
        <div className="h-4 w-20 bg-muted" />
        <div className="h-12 bg-muted" />
        <div className="mt-2 h-14 bg-muted" />
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <div className="relative w-full max-w-md">
        <GeometricDecoration />

        <div className="relative z-10 border-2 border-border bg-background p-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="mb-6 block text-2xl font-bold">
              Skillvee
            </Link>
            <h1 className="text-3xl font-bold">Sign in</h1>
            <p className="mt-2 text-muted-foreground">
              Continue your assessment journey
            </p>
          </div>

          <Suspense fallback={<SignInFormFallback />}>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
