"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Code2,
  MonitorPlay,
  Bot,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ScenarioData {
  id: string;
  name: string;
  companyName: string;
  companyDescription: string;
  taskDescription: string;
  techStack: string[];
}

interface UserData {
  id: string;
  email?: string;
}

interface ExistingAssessment {
  id: string;
  status: string;
}

interface JoinPageClientProps {
  scenario: ScenarioData;
  user: UserData | null;
  existingAssessment: ExistingAssessment | null;
}

function JoinPageContent({
  scenario,
  user,
  existingAssessment,
}: JoinPageClientProps) {
  const router = useRouter();

  // Auth form state
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Task description expansion
  const [isTaskExpanded, setIsTaskExpanded] = useState(false);

  // If user is logged in, handle assessment creation/resume
  const handleContinue = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (existingAssessment) {
        // Resume existing assessment
        router.push(`/assessment/${existingAssessment.id}/welcome`);
      } else {
        // Create new assessment
        const response = await fetch("/api/assessment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenarioId: scenario.id }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to create assessment");
          setIsLoading(false);
          return;
        }

        router.push(`/assessment/${data.assessment.id}/welcome`);
      }
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setError("");

    // Store scenario ID for post-auth redirect
    localStorage.setItem("skillvee_join_scenario", scenario.id);

    void signIn("google", { redirectTo: `/join/${scenario.id}` });
  };

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (mode === "signup") {
      // Validate passwords match
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      // Validate password strength
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setIsLoading(false);
        return;
      }

      try {
        // Register the user (default USER role for candidates)
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            name: `${firstName} ${lastName}`.trim() || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Registration failed");
          setIsLoading(false);
          return;
        }

        // Sign in after successful registration
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError(
            "Account created but sign-in failed. Please sign in manually."
          );
          setIsLoading(false);
          return;
        }

        // Refresh to get the updated session
        router.refresh();
      } catch {
        setError("An error occurred. Please try again.");
        setIsLoading(false);
      }
    } else {
      // Sign in mode
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
      } else {
        router.refresh();
      }
    }
  };

  // Truncate task description
  const truncatedTask =
    scenario.taskDescription.length > 200
      ? scenario.taskDescription.substring(0, 200) + "..."
      : scenario.taskDescription;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Section - Scenario Info */}
          <div className="space-y-6">
            {/* Company Header */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {scenario.companyName}
                </h1>
                <p className="text-lg text-gray-600 mt-1">{scenario.name}</p>
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {scenario.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Task Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Task Overview</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {isTaskExpanded ? scenario.taskDescription : truncatedTask}
              </p>
              {scenario.taskDescription.length > 200 && (
                <button
                  onClick={() => setIsTaskExpanded(!isTaskExpanded)}
                  className="mt-2 text-blue-600 text-sm font-medium flex items-center gap-1 hover:text-blue-700"
                >
                  {isTaskExpanded ? (
                    <>
                      Show less <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Read more <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* What to Expect */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">
                What to Expect
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      AI-Powered Simulation
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Work through a realistic day at work with AI teammates
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MonitorPlay className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      Screen Recording
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Your screen will be recorded to assess how you work
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      AI Usage Encouraged
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Feel free to use Copilot, ChatGPT, or any AI tools you
                      prefer
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      Work at Your Pace
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Context is intentionally vague - ask questions via chat
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Auth */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              {user ? (
                // Logged in state
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Welcome back
                    </h2>
                    <p className="text-gray-600 mt-1">{user.email}</p>
                  </div>

                  {existingAssessment ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        You have an{" "}
                        {existingAssessment.status === "COMPLETED"
                          ? "completed"
                          : "in-progress"}{" "}
                        assessment for this scenario.
                      </p>
                    </div>
                  ) : null}

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleContinue}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Loading..."
                      : existingAssessment
                        ? existingAssessment.status === "COMPLETED"
                          ? "View Results"
                          : "Resume Assessment"
                        : "Continue to Assessment"}
                  </Button>

                  <p className="text-center text-xs text-gray-500">
                    Not you?{" "}
                    <Link
                      href="/api/auth/signout"
                      className="text-blue-600 hover:underline"
                    >
                      Sign out
                    </Link>
                  </p>
                </div>
              ) : (
                // Not logged in - show auth form
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center">
                    <Link href="/" className="inline-block mb-4">
                      <Image
                        src="/skillvee-logo.png"
                        alt="SkillVee"
                        width={140}
                        height={36}
                        className="mx-auto"
                        priority
                      />
                    </Link>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {mode === "signup"
                        ? "Create your account"
                        : "Sign in to continue"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {mode === "signup"
                        ? "Join to start your assessment"
                        : "Welcome back"}
                    </p>
                  </div>

                  {/* Error Messages */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Google OAuth */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 text-sm font-medium"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-gray-500">
                        or {mode === "signup" ? "sign up" : "sign in"} with
                        email
                      </span>
                    </div>
                  </div>

                  {/* Email/Password Form */}
                  <form onSubmit={handleCredentialsAuth} className="space-y-4">
                    {mode === "signup" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="firstName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            First name
                          </label>
                          <Input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="John"
                            disabled={isLoading}
                            className="h-11 border-gray-200 focus:border-gray-300"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Last name
                          </label>
                          <Input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Doe"
                            disabled={isLoading}
                            className="h-11 border-gray-200 focus:border-gray-300"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                        className="h-11 border-gray-200 focus:border-gray-300"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={
                          mode === "signup"
                            ? "At least 8 characters"
                            : "Enter your password"
                        }
                        required
                        disabled={isLoading}
                        className="h-11 border-gray-200 focus:border-gray-300"
                      />
                    </div>

                    {mode === "signup" && (
                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Confirm password
                        </label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          required
                          disabled={isLoading}
                          className="h-11 border-gray-200 focus:border-gray-300"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? mode === "signup"
                          ? "Creating account..."
                          : "Signing in..."
                        : mode === "signup"
                          ? "Create account"
                          : "Sign in"}
                    </Button>
                  </form>

                  {/* Terms (signup only) */}
                  {mode === "signup" && (
                    <p className="text-xs text-center text-gray-500">
                      By signing up, you agree to our{" "}
                      <Link
                        href="/terms"
                        className="text-blue-600 hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </p>
                  )}

                  {/* Toggle mode */}
                  <p className="text-center text-sm text-gray-600">
                    {mode === "signup"
                      ? "Already have an account? "
                      : "Don't have an account? "}
                    <button
                      onClick={() => {
                        setMode(mode === "signup" ? "signin" : "signup");
                        setError("");
                      }}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      {mode === "signup" ? "Sign in" : "Sign up"}
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JoinPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export function JoinPageClient(props: JoinPageClientProps) {
  return (
    <Suspense fallback={<JoinPageLoading />}>
      <JoinPageContent {...props} />
    </Suspense>
  );
}
