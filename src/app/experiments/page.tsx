import Link from "next/link";
import { getExperiment, listExperiments } from "@/lib/storage";
import { STAGE_ORDER } from "@/lib/types";
import ExperimentGrid, { DashboardExperiment } from "@/components/dashboard/ExperimentGrid";
import ScopeTabs from "@/components/ScopeTabs";
import { getCurrentUser, matchesScope, resolveScope } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function enrich(): Promise<DashboardExperiment[]> {
  const metas = await listExperiments();
  return Promise.all(
    metas.map(async (m): Promise<DashboardExperiment> => {
      const full = await getExperiment(m.id);
      const current = full?.versions[full.versions.length - 1];
      const filled = current
        ? current.stages.filter((s) => (s.content ?? "").trim().length > 0).length
        : 0;
      const total = STAGE_ORDER.length;
      const progress = Math.round((filled / total) * 100);
      let status: DashboardExperiment["status"] = "Drafting";
      if (current?.meReview || current?.phdReview) status = "Reviewing";
      else if (m.currentVersion >= 3) status = "In progress";
      else if (m.currentVersion >= 2) status = "Iterating";
      return { ...m, progress, status, filledStages: filled, totalStages: total };
    }),
  );
}

export default async function ExperimentsListingPage({
  searchParams,
}: {
  searchParams?: { scope?: string };
}) {
  const user = getCurrentUser()!;
  const scope = resolveScope(searchParams?.scope);
  const all = await enrich();
  const counts = {
    mine: all.filter((e) => matchesScope(e.ownerEmail, user, "mine")).length,
    org: all.filter((e) => matchesScope(e.ownerEmail, user, "org")).length,
  };
  const experiments = all.filter((e) => matchesScope(e.ownerEmail, user, scope));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Experiments</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--fg-3)" }}>
            {scope === "mine"
              ? "Experiments you've created."
              : `All experiments visible to @${user.domain}.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ScopeTabs scope={scope} basePath="/experiments" user={user} counts={counts} />
          <Link
            href="/experiments/new"
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
            New experiment
          </Link>
        </div>
      </div>

      {experiments.length === 0 ? (
        <div
          className="card flex flex-col items-center justify-center p-12 text-center"
          style={{ borderStyle: "dashed" }}
        >
          <p style={{ color: "var(--fg-3)" }}>
            {scope === "mine"
              ? "You haven't created any experiments yet."
              : `No experiments in @${user.domain} yet.`}
          </p>
          <Link
            href="/experiments/new"
            className="mt-4 inline-block rounded-xl px-4 py-2 text-sm font-medium text-white"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
          >
            Create your first experiment
          </Link>
        </div>
      ) : (
        <ExperimentGrid experiments={experiments} currentUserEmail={user.email} />
      )}
    </div>
  );
}
