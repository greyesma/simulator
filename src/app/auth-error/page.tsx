import Link from "next/link";

function GeometricDecoration() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Triangle - top left */}
      <div
        className="bg-destructive/20 absolute -left-16 -top-16 h-64 w-64"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <div className="relative w-full max-w-md">
        <GeometricDecoration />

        <div className="relative z-10 border-2 border-border bg-background p-8 text-center">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="mb-6 block text-2xl font-bold">
              Skillvee
            </Link>
            <h1 className="text-3xl font-bold text-destructive">
              Authentication Error
            </h1>
            <p className="mt-4 text-muted-foreground">
              Something went wrong during authentication. Please try again.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <Link
              href="/sign-in"
              className="w-full border-2 border-foreground bg-foreground px-4 py-4 text-center font-semibold text-background hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="w-full border-2 border-foreground bg-background px-4 py-4 text-center font-semibold text-foreground hover:bg-muted"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
