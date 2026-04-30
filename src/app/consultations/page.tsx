import Link from "next/link";
import { listConsultations } from "@/lib/consultation-storage";

export const dynamic = "force-dynamic";

export default async function ConsultationsPage() {
  const consultations = await listConsultations();

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">PhD Advisor</h1>
          <p className="mt-1 text-sm text-slate-600">
            One-off methodology questions answered at PhD economics level. The advisor asks
            follow-up questions when it needs more context before giving advice.
          </p>
        </div>
        <Link
          href="/consultations/new"
          className="shrink-0 rounded bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Ask a question
        </Link>
      </div>

      {consultations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">No consultations yet.</p>
          <Link
            href="/consultations/new"
            className="mt-4 inline-block rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Ask your first question
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {consultations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/consultations/${c.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-sm"
              >
                <p className="font-medium leading-snug">{c.title}</p>
                <p className="mt-3 text-xs text-slate-500">
                  {new Date(c.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
