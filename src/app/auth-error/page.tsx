import Link from "next/link";

function GeometricDecoration() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Triangle - top left */}
      <div
        className="absolute -top-16 -left-16 w-64 h-64 bg-destructive/20"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-12">
      <div className="relative w-full max-w-md">
        <GeometricDecoration />

        <div className="relative z-10 border-2 border-border bg-background p-8 text-center">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="font-bold text-2xl block mb-6">
              Skillvee
            </Link>
            <h1 className="text-3xl font-bold text-destructive">
              Authentication Error
            </h1>
            <p className="text-muted-foreground mt-4">
              Something went wrong during authentication. Please try again.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <Link
              href="/sign-in"
              className="w-full bg-foreground text-background px-4 py-4 font-semibold border-2 border-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary text-center"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="w-full bg-background text-foreground px-4 py-4 font-semibold border-2 border-foreground hover:bg-muted text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
