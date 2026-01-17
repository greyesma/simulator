import Link from "next/link";
import Image from "next/image";
import { CheckCircle, X } from "lucide-react";

function GeometricDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Large triangle - top right */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 bg-secondary"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      />
      {/* Small triangle - bottom left */}
      <div
        className="absolute -bottom-10 -left-10 w-40 h-40 bg-foreground"
        style={{ clipPath: "polygon(0 100%, 0 0, 100% 100%)" }}
      />
      {/* Parallelogram - mid left */}
      <div
        className="absolute top-1/3 -left-16 w-32 h-20 bg-secondary opacity-60"
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
    <div className="border border-border p-6 bg-background">
      <span className="font-mono text-secondary text-sm">{number}</span>
      <h3 className="text-xl font-bold mt-2 mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-2 border-border p-6 bg-background">
      <h4 className="text-lg font-bold mb-3">{question}</h4>
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
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24">
        <GeometricDecoration />

        <div className="relative z-10 max-w-4xl">
          {/* Badge */}
          <div className="inline-block border border-border px-4 py-2 mb-8">
            <span className="font-mono text-sm tracking-wide">
              DEVELOPER ASSESSMENT
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none mb-6">
            Stop grinding
            <br />
            <span className="text-secondary">LeetCode.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8">
            Practice a real day at work instead. HR interview, manager kickoff,
            coding task, PR defense—all AI-powered.
          </p>

          {/* Bullet points */}
          <ul className="space-y-3 mb-12 max-w-2xl">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-lg">
                Experience how top companies actually evaluate candidates
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-lg">
                Get feedback on HOW you work, not just what you produce
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-lg">
                Use AI tools, collaborate, ship code—like a real job
              </span>
            </li>
          </ul>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/start"
              className="inline-block bg-foreground text-background px-8 py-4 text-lg font-semibold border-2 border-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary text-center"
            >
              Start Practicing
            </Link>
            <Link
              href="#how-it-works"
              className="inline-block bg-background text-foreground px-8 py-4 text-lg font-semibold border-2 border-foreground hover:bg-accent hover:border-foreground text-center"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-px h-16 bg-border" />
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="border-y border-border bg-secondary/10 py-6 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto text-center">
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
      <section className="px-6 md:px-12 lg:px-24 py-16 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-center text-xl font-semibold text-muted-foreground mb-12">
            Land roles at companies like these
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-8 items-center justify-items-center">
            {companyLogos.map((logo) => (
              <div
                key={logo.name}
                className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
              >
                <Image
                  src={`/${logo.file}`}
                  alt={logo.name}
                  width={80}
                  height={40}
                  className="object-contain h-10 w-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="px-6 md:px-12 lg:px-24 py-24 border-b border-border"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="font-mono text-secondary text-sm tracking-wide">
              HOW IT WORKS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">
              A complete simulation
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <section className="px-6 md:px-12 lg:px-24 py-24 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Let&apos;s Be Real: LeetCode Prep Sucks
            </h2>
            <p className="text-xl text-muted-foreground">
              You know it. We know it. Here&apos;s something better.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* LeetCode Column */}
            <div className="border-2 border-border p-8 bg-muted/30">
              <h3 className="text-2xl font-bold mb-6 text-muted-foreground">
                The LeetCode Grind
              </h3>
              <ul className="space-y-4">
                {leetcodeProblems.map((problem, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skillvee Column */}
            <div className="border-2 border-secondary p-8 bg-secondary/10">
              <h3 className="text-2xl font-bold mb-6">Skillvee Simulator</h3>
              <ul className="space-y-4">
                {skillveeAdvantages.map((advantage, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                    <span>{advantage}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 md:px-12 lg:px-24 py-24 border-b border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
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
      <section className="px-6 md:px-12 lg:px-24 py-24 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to practice like it&apos;s real?
          </h2>
          <p className="text-xl text-background/70 mb-12">
            Stop memorizing. Start doing.
          </p>
          <Link
            href="/start"
            className="inline-block bg-secondary text-secondary-foreground px-10 py-5 text-xl font-semibold border-2 border-secondary hover:bg-background hover:text-foreground hover:border-background"
          >
            Start Your Simulation
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 lg:px-24 py-12 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <span className="font-bold text-2xl">Skillvee</span>
            <span className="text-muted-foreground">•</span>
            <a
              href="https://skillvee.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground underline decoration-secondary decoration-2 underline-offset-2"
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
