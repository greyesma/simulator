import Link from "next/link";
import Image from "next/image";
import { CheckCircle, X } from "lucide-react";

function GeometricDecoration() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Large triangle - top right */}
      <div
        className="absolute -right-20 -top-20 h-80 w-80 bg-secondary"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      />
      {/* Small triangle - bottom left */}
      <div
        className="absolute -bottom-10 -left-10 h-40 w-40 bg-foreground"
        style={{ clipPath: "polygon(0 100%, 0 0, 100% 100%)" }}
      />
      {/* Parallelogram - mid left */}
      <div
        className="absolute -left-16 top-1/3 h-20 w-32 bg-secondary opacity-60"
        style={{ clipPath: "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)" }}
      />
    </div>
  );
}

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
    <div className="border border-border bg-background p-6">
      <span className="font-mono text-sm text-secondary">{number}</span>
      <h3 className="mb-3 mt-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-2 border-border bg-background p-6">
      <h4 className="mb-3 text-lg font-bold">{question}</h4>
      <p className="text-muted-foreground">{answer}</p>
    </div>
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
        <GeometricDecoration />

        <div className="relative z-10 max-w-4xl">
          {/* Badge */}
          <div className="mb-8 inline-block border border-border px-4 py-2">
            <span className="font-mono text-sm tracking-wide">
              DEVELOPER ASSESSMENT
            </span>
          </div>

          {/* Main headline */}
          <h1 className="mb-6 text-5xl font-bold leading-none md:text-7xl lg:text-8xl">
            Stop grinding
            <br />
            <span className="text-secondary">LeetCode.</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-8 max-w-2xl text-xl text-muted-foreground md:text-2xl">
            Practice a real day at work instead. HR interview, manager kickoff,
            coding task, PR defense—all AI-powered.
          </p>

          {/* Bullet points */}
          <ul className="mb-12 max-w-2xl space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-secondary" />
              <span className="text-lg">
                Experience how top companies actually evaluate candidates
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-secondary" />
              <span className="text-lg">
                Get feedback on HOW you work, not just what you produce
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-secondary" />
              <span className="text-lg">
                Use AI tools, collaborate, ship code—like a real job
              </span>
            </li>
          </ul>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/start"
              className="inline-block border-2 border-foreground bg-foreground px-8 py-4 text-center text-lg font-semibold text-background hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              Start Practicing
            </Link>
            <Link
              href="#how-it-works"
              className="inline-block border-2 border-foreground bg-background px-8 py-4 text-center text-lg font-semibold text-foreground hover:border-foreground hover:bg-accent"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="h-16 w-px bg-border" />
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="bg-secondary/10 border-y border-border px-6 py-6 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-lg">
            Join <strong>500+ professionals</strong> on early access • Backed by{" "}
            <a
              href="https://web.startx.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline decoration-secondary decoration-2 underline-offset-2 hover:text-secondary"
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
                className="opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
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
            <span className="font-mono text-sm tracking-wide text-secondary">
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
            <div className="bg-muted/30 border-2 border-border p-8">
              <h3 className="mb-6 text-2xl font-bold text-muted-foreground">
                The LeetCode Grind
              </h3>
              <ul className="space-y-4">
                {leetcodeProblems.map((problem, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="mt-0.5 h-6 w-6 flex-shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skillvee Column */}
            <div className="bg-secondary/10 border-2 border-secondary p-8">
              <h3 className="mb-6 text-2xl font-bold">Skillvee Simulator</h3>
              <ul className="space-y-4">
                {skillveeAdvantages.map((advantage, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-secondary" />
                    <span>{advantage}</span>
                  </li>
                ))}
              </ul>
            </div>
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
      <section className="bg-foreground px-6 py-24 text-background md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Ready to practice like it&apos;s real?
          </h2>
          <p className="text-background/70 mb-12 text-xl">
            Stop memorizing. Start doing.
          </p>
          <Link
            href="/start"
            className="inline-block border-2 border-secondary bg-secondary px-10 py-5 text-xl font-semibold text-secondary-foreground hover:border-background hover:bg-background hover:text-foreground"
          >
            Start Your Simulation
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12 md:px-12 lg:px-24">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <span className="text-2xl font-bold">Skillvee</span>
            <span className="text-muted-foreground">•</span>
            <a
              href="https://skillvee.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground underline decoration-secondary decoration-2 underline-offset-2 hover:text-foreground"
            >
              Part of Skillvee
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href="mailto:hi@skillvee.com"
              className="text-muted-foreground hover:text-foreground"
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
