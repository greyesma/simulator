export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-6xl font-bold mb-6">
          Skillvee
        </h1>
        <p className="text-xl mb-8 text-muted-foreground">
          Assess and improve your developer skills through realistic work simulations
        </p>
        <button className="bg-foreground text-background px-8 py-4 text-lg font-semibold border-2 border-foreground hover:bg-accent hover:text-accent-foreground">
          Practice a Real Scenario
        </button>
      </div>
    </main>
  );
}
