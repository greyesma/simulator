"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Monitor, Bot, Sparkles } from "lucide-react";

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

  // Step state - returning users skip to step 4
  const [step, setStep] = useState(user ? 4 : 1);

  // Auth form state
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle assessment creation/resume
  const handleContinue = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (existingAssessment) {
        router.push(`/assessment/${existingAssessment.id}/chat`);
      } else {
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

        router.push(`/assessment/${data.assessment.id}/chat`);
      }
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setError("");
    localStorage.setItem("skillvee_join_scenario", scenario.id);
    void signIn("google", { redirectTo: `/join/${scenario.id}` });
  };

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setIsLoading(false);
        return;
      }

      try {
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

        router.refresh();
      } catch {
        setError("An error occurred. Please try again.");
        setIsLoading(false);
      }
    } else {
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

  // Total steps for progress bar
  const totalSteps = 4;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020617] text-white font-sans overflow-hidden">
      {/* Left Panel - Dynamic Narrative */}
      <div className="lg:w-3/5 p-8 lg:p-24 flex flex-col justify-between relative min-h-[50vh] lg:min-h-screen">
        {/* Animated Accent Background */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-20%] w-full h-full bg-primary/20 rounded-full blur-[150px] pointer-events-none"
        />

        {/* Header */}
        <header className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-primary font-black text-xl">
            S
          </div>
          <span className="text-xl font-bold tracking-tight">SkillVee</span>
        </header>

        {/* Main Content - Changes per step */}
        <main className="relative z-10 py-12 lg:py-20">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <h1 className="text-5xl lg:text-[90px] font-black tracking-tight leading-[0.85] text-white">
                  YOUR
                  <br />
                  NEXT ROLE.
                </h1>
                <p className="text-xl lg:text-2xl text-slate-400 font-medium max-w-xl">
                  {scenario.companyName} is looking for someone to join their
                  team. Experience a day in the role before you commit.
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <h2 className="text-5xl lg:text-[90px] font-black tracking-tight leading-[0.85] text-primary">
                  NOT A<br />
                  TEST.
                </h2>
                <p className="text-xl lg:text-2xl text-slate-400 font-medium max-w-xl leading-relaxed">
                  This is a simulation of real work. You&apos;ll collaborate
                  with AI teammates, use your favorite tools, and solve actual
                  problems.
                </p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <h2 className="text-5xl lg:text-[90px] font-black tracking-tight leading-[0.85] text-white">
                  THE
                  <br />
                  CASE.
                </h2>
                <div className="space-y-6">
                  <p className="text-xl lg:text-2xl text-slate-400 font-medium max-w-xl">
                    {scenario.name}
                  </p>
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {scenario.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs font-bold text-slate-400 uppercase tracking-widest border border-slate-700 px-3 py-1.5 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <h2 className="text-5xl lg:text-[90px] font-black tracking-tight leading-[0.85] text-primary">
                  READY.
                  <br />
                  GO.
                </h2>
                <p className="text-xl lg:text-2xl text-slate-400 font-medium max-w-xl">
                  {user
                    ? "Your environment is ready. Let's begin."
                    : "One last step to initialize your development environment."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="relative z-10 flex items-center gap-8">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Bot className="w-4 h-4 text-primary" />
            AI Teammates
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Sparkles className="w-4 h-4 text-primary" />
            Use Any AI Tools
          </div>
        </footer>
      </div>

      {/* Right Panel - Interaction */}
      <div className="lg:w-2/5 bg-white text-slate-900 p-8 lg:p-16 flex items-center justify-center min-h-[50vh] lg:min-h-screen">
        <div className="w-full max-w-sm space-y-10">
          {/* Progress Bar */}
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i <= step ? "bg-primary" : "bg-slate-100"
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Step 01
                  </h4>
                  <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">
                    Welcome
                  </h3>
                </div>
                <p className="text-slate-500 leading-relaxed font-medium">
                  You&apos;ve been invited to experience a day at{" "}
                  <span className="text-slate-900 font-semibold">
                    {scenario.companyName}
                  </span>
                  . This simulation assesses how you work, not just what you
                  produce.
                </p>
                <Button
                  onClick={() => setStep(2)}
                  className="w-full h-14 rounded-full bg-slate-900 text-white font-bold text-lg group hover:bg-slate-800"
                >
                  Continue
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Step 02
                  </h4>
                  <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">
                    The Experience
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-slate-500" />
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Work with <strong>AI-powered teammates</strong> via Slack.
                      They&apos;ll respond just like real colleagues.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Monitor className="w-4 h-4 text-slate-500" />
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Your <strong>screen will be recorded</strong>. We assess
                      how you work, not just the end result.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-slate-500" />
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      <strong>Use any AI tools</strong> you want. Copilot,
                      ChatGPT, Claude - whatever helps you work best.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setStep(3)}
                  className="w-full h-14 rounded-full bg-slate-900 text-white font-bold text-lg group hover:bg-slate-800"
                >
                  Continue
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Step 03
                  </h4>
                  <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">
                    Your Mission
                  </h3>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    You&apos;ll receive a task from your manager. The context is{" "}
                    <strong>intentionally incomplete</strong> - part of the
                    assessment is seeing how you ask questions and gather
                    requirements.
                  </p>
                </div>
                <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-600">
                    <strong className="text-slate-700">Tip:</strong> Don&apos;t hesitate to reach out to
                    your teammates for clarification. That&apos;s exactly what
                    we want to see!
                  </p>
                </div>
                <Button
                  onClick={() => setStep(4)}
                  className="w-full h-14 rounded-full bg-slate-900 text-white font-bold text-lg group hover:bg-slate-800"
                >
                  Launch Environment
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Step 04
                  </h4>
                  <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">
                    {user ? "Ready to Start" : "Final Step"}
                  </h3>
                </div>

                {user ? (
                  // Logged in - show continue/resume
                  <div className="space-y-6">
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-6 h-6 text-primary"
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
                      <p className="text-slate-600 text-sm">{user.email}</p>
                    </div>

                    {existingAssessment && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-800">
                          You have an{" "}
                          {existingAssessment.status === "COMPLETED"
                            ? "completed"
                            : "in-progress"}{" "}
                          assessment.
                        </p>
                      </div>
                    )}

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <p className="text-xs text-center text-slate-500">
                      By continuing, you agree to screen recording during this
                      assessment.
                    </p>

                    <Button
                      onClick={handleContinue}
                      disabled={isLoading}
                      className="w-full h-14 rounded-full bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/90"
                    >
                      {isLoading
                        ? "Loading..."
                        : existingAssessment
                          ? existingAssessment.status === "COMPLETED"
                            ? "View Results"
                            : "Resume Assessment"
                          : "Start Simulation"}
                    </Button>

                    <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Not you?{" "}
                      <Link
                        href="/api/auth/signout"
                        className="text-primary hover:underline"
                      >
                        Sign out
                      </Link>
                    </p>
                  </div>
                ) : (
                  // Not logged in - show auth form
                  <div className="space-y-6">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    {/* Google OAuth */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 rounded-full text-sm font-semibold border-slate-200 hover:bg-slate-50"
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
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-4 text-slate-400 font-medium">
                          or {mode === "signup" ? "sign up" : "sign in"} with
                          email
                        </span>
                      </div>
                    </div>

                    {/* Email/Password Form */}
                    <form
                      onSubmit={handleCredentialsAuth}
                      className="space-y-4"
                    >
                      {mode === "signup" && (
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First name"
                            disabled={isLoading}
                            className="h-12 rounded-full bg-slate-50 border-transparent px-5 focus:bg-white focus:border-primary"
                          />
                          <Input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last name"
                            disabled={isLoading}
                            className="h-12 rounded-full bg-slate-50 border-transparent px-5 focus:bg-white focus:border-primary"
                          />
                        </div>
                      )}

                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        required
                        disabled={isLoading}
                        className="h-12 rounded-full bg-slate-50 border-transparent px-5 focus:bg-white focus:border-primary"
                      />

                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={
                          mode === "signup"
                            ? "Password (8+ characters)"
                            : "Password"
                        }
                        required
                        disabled={isLoading}
                        className="h-12 rounded-full bg-slate-50 border-transparent px-5 focus:bg-white focus:border-primary"
                      />

                      {mode === "signup" && (
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          required
                          disabled={isLoading}
                          className="h-12 rounded-full bg-slate-50 border-transparent px-5 focus:bg-white focus:border-primary"
                        />
                      )}

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 rounded-full bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/90"
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

                    {/* Consent text (signup only) */}
                    {mode === "signup" && (
                      <p className="text-xs text-center text-slate-400">
                        By signing up, you agree to screen recording and our{" "}
                        <Link
                          href="/terms"
                          className="text-primary hover:underline"
                        >
                          Terms
                        </Link>{" "}
                        &{" "}
                        <Link
                          href="/privacy"
                          className="text-primary hover:underline"
                        >
                          Privacy Policy
                        </Link>
                      </p>
                    )}

                    {/* Toggle mode */}
                    <p className="text-center text-sm text-slate-500">
                      {mode === "signup"
                        ? "Already have an account? "
                        : "Don't have an account? "}
                      <button
                        onClick={() => {
                          setMode(mode === "signup" ? "signin" : "signup");
                          setError("");
                        }}
                        className="font-semibold text-primary hover:underline"
                      >
                        {mode === "signup" ? "Sign in" : "Sign up"}
                      </button>
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function JoinPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-slate-400">Loading...</p>
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
