import Link from "next/link";
import Image from "next/image";
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function FeatureCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="group transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <span className="font-mono text-sm text-primary">{number}</span>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{question}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{answer}</p>
      </CardContent>
    </Card>
  );
}

const companyLogos = [
  { name: "Airbnb", file: "airbnb.png" },
  { name: "Microsoft", file: "microsoft-small.png" },
  { name: "Google", file: "google-small.png" },
  { name: "Spotify", file: "Spotify.png" },
  { name: "Netflix", file: "netflix.png" },
  { name: "Apple", file: "apple-small.png" },
  { name: "Meta", file: "meta-small.png" },
  { name: "Amazon", file: "amazon-small.png" },
];

const leetcodeProblems = [
  "Memorize algorithms you'll never use at work",
  "No feedback on communication or collaboration",
  "Solving puzzles alone in silence",
  "Doesn't reflect how you'll actually be evaluated",
];

const skillveeAdvantages = [
  "Practice realistic tasks from real companies",
  "AI feedback on how you work, not just output",
  "Collaborate with AI coworkers, defend your PRs",
  "Experience the full interview loop in one session",
];

const faqItems = [
  {
    question: "Is this free?",
    answer: "Yes, completely free. Practice as many times as you want.",
  },
  {
    question: "What does the simulation include?",
    answer:
      "A full interview loop: HR screening call, manager kickoff meeting, a coding task in a real codebase, and a PR defense where you present your work.",
  },
  {
    question: "How long does it take?",
    answer:
      "About 45-60 minutes for the full simulation. You can pause and resume if needed.",
  },
  {
    question: "Is my screen actually recorded?",
    answer:
      "Yes, screen and voice are recorded during the coding task—just like a real technical interview. This lets us provide detailed feedback on your process.",
  },
  {
    question: "How is this different from LeetCode?",
    answer:
      "LeetCode tests algorithm memorization. We test how you actually work: communication, problem-solving approach, AI tool usage, collaboration, and code quality in a realistic setting.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col justify-center px-6 md:px-12 lg:px-24">
        {/* Modern gradient decoration instead of geometric shapes */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl">
          {/* Badge */}
          <div className="mb-8 inline-block rounded-full bg-primary/10 px-4 py-2">
            <span className="font-mono text-sm tracking-wide text-primary">
              DEVELOPER ASSESSMENT
            </span>
          </div>

          {/* Main headline */}
          <h1 className="mb-6 text-5xl font-bold leading-none md:text-7xl lg:text-8xl">
            Stop grinding
            <br />
            <span className="text-primary">LeetCode.</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-8 max-w-2xl text-xl text-muted-foreground md:text-2xl">
            Practice a real day at work instead. HR interview, manager kickoff,
            coding task, PR defense—all AI-powered.
          </p>

          {/* Bullet points */}
          <ul className="mb-12 max-w-2xl space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
              <span className="text-lg">
                Experience how top companies actually evaluate candidates
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
              <span className="text-lg">
                Get feedback on HOW you work, not just what you produce
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
              <span className="text-lg">
                Use AI tools, collaborate, ship code—like a real job
              </span>
            </li>
          </ul>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-14 px-8 text-lg shadow-sm transition-shadow hover:shadow-md"
            >
              <Link href="/start">Start Practicing</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg transition-colors"
            >
              <Link href="#how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="h-16 w-px bg-gradient-to-b from-border to-transparent" />
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="border-y border-border bg-muted/30 px-6 py-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-lg">
            Join <strong>500+ professionals</strong> on early access • Backed by{" "}
            <a
              href="https://web.startx.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline decoration-primary decoration-2 underline-offset-2 transition-colors hover:text-primary/80"
            >
              Stanford StartX
            </a>
          </p>
        </div>
      </section>

      {/* Company Logos Section */}
      <section className="border-b border-border px-6 py-16 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-12 text-center text-xl font-semibold text-muted-foreground">
            Land roles at companies like these
          </h3>
          <div className="grid grid-cols-4 items-center justify-items-center gap-8 md:grid-cols-8">
            {companyLogos.map((logo) => (
              <div
                key={logo.name}
                className="opacity-60 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0"
              >
                <Image
                  src={`/${logo.file}`}
                  alt={logo.name}
                  width={80}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="border-b border-border px-6 py-24 md:px-12 lg:px-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <span className="font-mono text-sm tracking-wide text-primary">
              HOW IT WORKS
            </span>
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              A complete simulation
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              number="01"
              title="HR Interview"
              description="Start with a voice conversation. Discuss your experience and approach to problem-solving."
            />
            <FeatureCard
              number="02"
              title="Manager Kickoff"
              description="Get briefed on your task. Ask questions, clarify requirements, understand the codebase."
            />
            <FeatureCard
              number="03"
              title="Coding Task"
              description="Work on a real-world problem. Use AI tools, collaborate with virtual coworkers, ship code."
            />
            <FeatureCard
              number="04"
              title="PR Defense"
              description="Present your work. Explain your decisions, handle feedback, and defend your implementation."
            />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="border-b border-border px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Let&apos;s Be Real: LeetCode Prep Sucks
            </h2>
            <p className="text-xl text-muted-foreground">
              You know it. We know it. Here&apos;s something better.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* LeetCode Column */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-2xl text-muted-foreground">
                  The LeetCode Grind
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {leetcodeProblems.map((problem, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <X className="mt-0.5 h-6 w-6 flex-shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">{problem}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Skillvee Column */}
            <Card className="border-primary/50 bg-primary/5 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl">Skillvee Simulator</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {skillveeAdvantages.map((advantage, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-b border-border px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-primary px-6 py-24 text-primary-foreground md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Ready to practice like it&apos;s real?
          </h2>
          <p className="mb-12 text-xl text-primary-foreground/80">
            Stop memorizing. Start doing.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="h-14 px-10 text-xl shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <Link href="/start">Start Your Simulation</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12 md:px-12 lg:px-24">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <span className="text-2xl font-bold">Skillvee</span>
            <span className="hidden text-muted-foreground md:inline">•</span>
            <a
              href="https://skillvee.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground underline decoration-primary decoration-2 underline-offset-2 transition-colors hover:text-foreground"
            >
              Part of Skillvee
            </a>
            <span className="hidden text-muted-foreground md:inline">•</span>
            <a
              href="mailto:hi@skillvee.com"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              hi@skillvee.com
            </a>
          </div>
          <div className="font-mono text-sm text-muted-foreground">
            Built for developers who want to improve
          </div>
        </div>
      </footer>
    </main>
  );
}
