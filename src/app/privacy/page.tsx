import Link from "next/link";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 mt-12 flex items-center gap-3 text-2xl font-bold">
      <div className="h-6 w-2 bg-secondary" />
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-6 text-lg font-bold">{children}</h3>;
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 2025";

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-2 border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold">
            Skillvee
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="font-mono text-sm text-muted-foreground hover:text-foreground"
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
          <div className="mb-6 inline-block border-2 border-border px-4 py-2">
            <span className="font-mono text-sm">LEGAL</span>
          </div>
          <h1 className="mb-4 text-5xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        {/* Introduction */}
        <div className="mb-8 border-l-4 border-secondary pl-6">
          <p className="text-lg">
            At Skillvee, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our developer assessment platform.
          </p>
        </div>

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

        <div className="bg-accent/10 my-8 border-2 border-border p-6">
          <h3 className="mb-2 font-bold">Requesting Data Deletion</h3>
          <p className="mb-4 text-muted-foreground">
            You can request deletion of your data at any time from your profile
            settings. We will process your request within 30 days and confirm
            deletion via email.
          </p>
          <Link
            href="/profile"
            className="inline-block border-2 border-foreground bg-foreground px-4 py-2 font-semibold text-background hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
          >
            Go to Profile Settings
          </Link>
        </div>

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
        <div className="bg-accent/10 border-2 border-border p-6">
          <p className="font-mono">Email: privacy@skillvee.com</p>
        </div>

        {/* Back to home */}
        <div className="mt-12 border-t-2 border-border pt-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground"
          >
            <span>←</span> Back to Home
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t-2 border-border">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center font-mono text-sm text-muted-foreground">
          © 2025 Skillvee. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
