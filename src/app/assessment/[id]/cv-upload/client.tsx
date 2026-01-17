"use client";

import { useRouter } from "next/navigation";
import { CVUpload } from "@/components/cv-upload";

interface CVUploadClientProps {
  assessmentId: string;
  scenarioName: string;
  companyName: string;
}

export function CVUploadClient({
  assessmentId,
  scenarioName,
  companyName,
}: CVUploadClientProps) {
  const router = useRouter();

  const handleUploadComplete = () => {
    // Redirect to HR interview after successful upload
    router.push(`/assessment/${assessmentId}/hr-interview`);
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Decorative triangles */}
      <div className="relative">
        <div
          className="absolute -top-16 -right-16 w-32 h-32 bg-secondary opacity-20"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        />
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-block border-2 border-border px-4 py-2 mb-6">
          <span className="font-mono text-sm">BEFORE THE INTERVIEW</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Upload Your CV</h1>
        <p className="text-muted-foreground text-lg">
          Before starting your{" "}
          <span className="text-secondary font-semibold">{scenarioName}</span>{" "}
          interview at{" "}
          <span className="font-semibold">{companyName}</span>, please upload
          your CV or resume.
        </p>
      </div>

      {/* Why we need it */}
      <div className="border-2 border-border p-6 mb-8 bg-accent/10">
        <h3 className="font-bold mb-3">Why do we need your CV?</h3>
        <ul className="space-y-2 text-muted-foreground text-sm">
          <li className="flex items-start gap-2">
            <span className="text-secondary">→</span>
            <span>
              The HR interviewer will reference your experience to ask relevant
              questions
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-secondary">→</span>
            <span>
              Your background helps us tailor the assessment to your skill level
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-secondary">→</span>
            <span>
              It enables more accurate and personalized feedback after the
              assessment
            </span>
          </li>
        </ul>
      </div>

      {/* Upload component */}
      <div className="mb-8">
        <CVUpload
          assessmentId={assessmentId}
          onUploadComplete={handleUploadComplete}
        />
      </div>

      {/* Help text */}
      <p className="text-center text-muted-foreground text-sm">
        Your CV is stored securely and only used for this assessment. You can
        update it anytime from your profile.
      </p>
    </div>
  );
}
