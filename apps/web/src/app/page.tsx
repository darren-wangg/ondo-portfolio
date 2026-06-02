const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Health = { status: string; db?: string };

async function getHealth(): Promise<Health> {
  try {
    const res = await fetch(`${API_URL}/api/health`, { cache: "no-store" });
    return (await res.json()) as Health;
  } catch {
    return { status: "unreachable" };
  }
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main style={{ maxWidth: 640, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>Ondo</h1>
      <p>Full-stack starter: Next.js + Express + Prisma/Postgres.</p>
      <p>
        API health (<code>{API_URL}/api/health</code>):{" "}
        <strong>{health.status}</strong>
        {health.db ? ` — db: ${health.db}` : null}
      </p>
    </main>
  );
}
