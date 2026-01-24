import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 mt-12 flex items-center gap-3 text-2xl font-semibold">
      <div className="h-6 w-1 rounded-full bg-primary" />
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-6 text-lg font-semibold">{children}</h3>;
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 2025";

  return (
    <main className="min-h-screen animate-page-enter bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-semibold transition-colors hover:text-primary"
          >
            Skillvee
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <article className="mx-auto max-w-4xl px-6 py-12">
        {/* Title section */}
        <div className="mb-12">
          <div className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-2">
            <span className="text-sm font-medium text-primary">Legal</span>
          </div>
          <h1 className="mb-4 text-5xl font-semibold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        {/* Introduction */}
        <Card className="mb-8 border-l-4 border-l-primary">
          <CardContent className="py-6">
            <p className="text-lg">
              At Skillvee, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our developer assessment platform.
            </p>
          </CardContent>
        </Card>

        <SectionHeading>1. Information We Collect</SectionHeading>

        <SubHeading>Account Information</SubHeading>
        <p className="mb-4 text-muted-foreground">
          When you create an account, we collect:
        </p>
        <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
          <li>Email address</li>
          <li>Name (optional)</li>
          <li>Password (stored securely using industry-standard hashing)</li>
          <li>
            Profile information from OAuth providers (if you sign in with
            Google)
          </li>
        </ul>

        <SubHeading>Assessment Data</SubHeading>
        <p className="mb-4 text-muted-foreground">
          During assessments, with your explicit consent, we collect:
        </p>
        <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Screen recordings:</strong>{" "}
            Video capture of your screen during the coding task portion of the
            assessment
          </li>
          <li>
            <strong className="text-foreground">Voice recordings:</strong> Audio
            from HR interviews, manager kickoff calls, and PR defense sessions
          </li>
          <li>
            <strong className="text-foreground">
              Conversation transcripts:
            </strong>{" "}
            Text transcriptions of all voice and chat interactions
          </li>
          <li>
            <strong className="text-foreground">CV/Resume:</strong> Documents
            you upload for use during the assessment
          </li>
          <li>
            <strong className="text-foreground">Code submissions:</strong> Links
            to pull requests and code you submit
          </li>
        </ul>

        <SubHeading>Technical Data</SubHeading>
        <p className="mb-4 text-muted-foreground">
          We automatically collect certain technical information:
        </p>
        <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
          <li>Browser type and version</li>
          <li>Device information</li>
          <li>Session timestamps and duration</li>
          <li>Error logs for troubleshooting</li>
        </ul>

        <SectionHeading>2. How We Use Your Information</SectionHeading>

        <p className="mb-4 text-muted-foreground">
          We use the collected information to:
        </p>
        <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
          <li>Provide and improve our assessment services</li>
          <li>Generate personalized feedback and assessment reports</li>
          <li>
            Analyze your problem-solving approach and communication skills
          </li>
          <li>Identify areas for improvement in your developer workflow</li>
          <li>Communicate with you about your assessments</li>
          <li>Ensure the security and integrity of our platform</li>
        </ul>

        <SectionHeading>3. AI Processing</SectionHeading>

        <p className="mb-4 text-muted-foreground">
          Your assessment data is processed using artificial intelligence to:
        </p>
        <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
          <li>Power voice conversations during interviews and calls</li>
          <li>
            Analyze screen recordings to understand your development workflow
          </li>
          <li>Review code quality, patterns, and security practices</li>
          <li>Generate comprehensive assessment reports</li>
        </ul>
        <p className="mb-4 text-muted-foreground">
          We use Google&apos;s Gemini AI models for processing. Your data is
          transmitted securely and is not used to train AI models.
        </p>

        <SectionHeading>4. Data Storage and Security</SectionHeading>

        <p className="mb-4 text-muted-foreground">
          We implement appropriate technical and organizational measures to
          protect your data:
        </p>
        <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
          <li>All data is encrypted in transit using TLS/HTTPS</li>
          <li>
            Recordings and documents are stored securely on Supabase Storage
          </li>
          <li>Database hosted on Supabase with encryption at rest</li>
          <li>Access controls limit who can view your assessment data</li>
        </ul>

        <SectionHeading>5. Data Retention</SectionHeading>

        <p className="mb-4 text-muted-foreground">
          We retain your data as follows:
        </p>
        <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Account data:</strong> Retained
            until you delete your account
          </li>
          <li>
            <strong className="text-foreground">Assessment recordings:</strong>{" "}
            Retained for 1 year after completion
          </li>
          <li>
            <strong className="text-foreground">Assessment reports:</strong>{" "}
            Retained indefinitely unless you request deletion
          </li>
        </ul>

        <SectionHeading>6. Your Rights</SectionHeading>

        <p className="mb-4 text-muted-foreground">You have the right to:</p>
        <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Access:</strong> Request a copy
            of your personal data
          </li>
          <li>
            <strong className="text-foreground">Correction:</strong> Update or
            correct inaccurate information
          </li>
          <li>
            <strong className="text-foreground">Deletion:</strong> Request
            deletion of your data (see below)
          </li>
          <li>
            <strong className="text-foreground">Portability:</strong> Receive
            your data in a portable format
          </li>
          <li>
            <strong className="text-foreground">Withdraw consent:</strong> Opt
            out of future data collection
          </li>
        </ul>

        <Card className="my-8 bg-primary/5">
          <CardContent className="py-6">
            <h3 className="mb-2 font-semibold">Requesting Data Deletion</h3>
            <p className="mb-4 text-muted-foreground">
              You can request deletion of your data at any time from your
              profile settings. We will process your request within 30 days and
              confirm deletion via email.
            </p>
            <Button asChild>
              <Link href="/profile">Go to Profile Settings</Link>
            </Button>
          </CardContent>
        </Card>

        <SectionHeading>7. Third-Party Services</SectionHeading>

        <p className="mb-4 text-muted-foreground">
          We use the following third-party services:
        </p>
        <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Supabase:</strong> Database and
            file storage
          </li>
          <li>
            <strong className="text-foreground">Vercel:</strong> Application
            hosting
          </li>
          <li>
            <strong className="text-foreground">Google (Gemini AI):</strong> AI
            processing for assessments
          </li>
          <li>
            <strong className="text-foreground">Resend:</strong> Transactional
            emails
          </li>
        </ul>
        <p className="mb-4 text-muted-foreground">
          Each of these services has their own privacy policies governing data
          handling.
        </p>

        <SectionHeading>8. Cookies</SectionHeading>

        <p className="mb-4 text-muted-foreground">
          We use essential cookies for authentication and session management. We
          do not use tracking or advertising cookies.
        </p>

        <SectionHeading>9. Children&apos;s Privacy</SectionHeading>

        <p className="mb-4 text-muted-foreground">
          Our service is not intended for users under 18 years of age. We do not
          knowingly collect data from children.
        </p>

        <SectionHeading>10. Changes to This Policy</SectionHeading>

        <p className="mb-4 text-muted-foreground">
          We may update this Privacy Policy from time to time. We will notify
          you of any material changes by posting the new policy on this page and
          updating the &quot;Last updated&quot; date.
        </p>

        <SectionHeading>11. Contact Us</SectionHeading>

        <p className="mb-4 text-muted-foreground">
          If you have questions about this Privacy Policy or your data, please
          contact us at:
        </p>
        <Card className="bg-muted/50">
          <CardContent className="py-6">
            <p className="font-mono text-sm">Email: privacy@skillvee.com</p>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="mt-12 border-t border-border pt-8">
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-sm text-muted-foreground">
          © 2025 Skillvee. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
