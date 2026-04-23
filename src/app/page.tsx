import Link from "next/link";
import { listExperiments } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const exps = await listExperiments();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Experiments</h1>
        <p className="mt-1 text-sm text-slate-600">
          Plans evolve. Track every version, ground every change in a reason.
        </p>
      </div>

      {exps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">No experiments yet.</p>
          <Link
            href="/experiments/new"
            className="mt-4 inline-block rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create your first experiment
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {exps.map((e) => (
            <li key={e.id}>
              <Link
                href={`/experiments/${e.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold">{e.title}</h2>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    v{e.currentVersion}
                  </span>
                </div>
                {e.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">{e.description}</p>
                )}
                <p className="mt-3 text-xs text-slate-500">
                  Updated {new Date(e.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
