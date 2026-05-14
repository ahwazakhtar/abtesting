import Link from "next/link";
import { getExperiment, listExperiments } from "@/lib/storage";
import { listConsultations } from "@/lib/consultation-storage";
import { listDocReviews } from "@/lib/doc-review-storage";
import { STAGE_ORDER } from "@/lib/types";
import StatTile from "@/components/ui/StatTile";
import ExperimentGrid, { DashboardExperiment } from "@/components/dashboard/ExperimentGrid";
import RecentActivity, { ActivityItem } from "@/components/dashboard/RecentActivity";
import ToolsRail from "@/components/dashboard/ToolsRail";
import ScopeTabs from "@/components/ScopeTabs";
import { getCurrentUser, matchesScope, resolveScope } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function buildDashboardExperiments(): Promise<DashboardExperiment[]> {
  const metas = await listExperiments();
  const enriched = await Promise.all(
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

      return {
        ...m,
        progress,
        status,
        filledStages: filled,
        totalStages: total,
      };
    }),
  );
  return enriched;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { scope?: string };
}) {
  const user = getCurrentUser()!;
  const scope = resolveScope(searchParams?.scope);

  const [allExperiments, allConsultations, allDocReviews] = await Promise.all([
    buildDashboardExperiments(),
    listConsultations(),
    listDocReviews(),
  ]);

  const counts = {
    mine: allExperiments.filter((e) => matchesScope(e.ownerEmail, user, "mine")).length,
    org: allExperiments.filter((e) => matchesScope(e.ownerEmail, user, "org")).length,
  };
  const experiments = allExperiments.filter((e) => matchesScope(e.ownerEmail, user, scope));

  const consultations = allConsultations.filter((c) => matchesScope(c.ownerEmail, user, scope));
  const docReviews = allDocReviews.filter((r) => matchesScope(r.ownerEmail, user, scope));

  const avgProgress = experiments.length === 0
    ? 0
    : Math.round(experiments.reduce((acc, e) => acc + e.progress, 0) / experiments.length);

  const activity: ActivityItem[] = [
    ...experiments.map((e): ActivityItem => ({
      id: e.id,
      kind: "Experiment",
      title: e.title,
      updatedAt: e.updatedAt,
      href: `/experiments/${e.id}`,
    })),
    ...consultations.map((c): ActivityItem => ({
      id: c.id,
      kind: "Advisor",
      title: c.title,
      updatedAt: c.updatedAt,
      href: `/consultations/${c.id}`,
    })),
    ...docReviews.map((r): ActivityItem => ({
      id: r.id,
      kind: "Doc review",
      title: r.docTitle,
      updatedAt: r.updatedAt,
      href: `/doc-reviews/${r.id}`,
    })),
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  const firstName = user.email.split("@")[0].split(/[._]/)[0];
  const heroName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="hero-card p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--hero-muted)" }}>
              Active workspace · @{user.domain}
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
              Welcome back, {heroName}
            </h1>
            <p className="mt-2 text-sm md:text-base" style={{ color: "var(--hero-muted)" }}>
              Plan smarter. Test rigorously. Learn continuously — every version of every plan grounded in a reason.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/experiments/new"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              + New experiment
            </Link>
            <Link
              href="/consultations/new"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Ask the M&amp;E advisor
            </Link>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Active experiments"
          value={experiments.length}
          hint={`${experiments.filter((e) => e.status !== "Drafting").length} past v1`}
          accent="indigo"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v6L4 19a2 2 0 0 0 1.8 2.9h12.4A2 2 0 0 0 20 19L15 9V3M9 3h6" />
            </svg>
          }
        />
        <StatTile
          label="Advisor sessions"
          value={consultations.length}
          hint="Methodology Q&A"
          accent="violet"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          }
        />
        <StatTile
          label="Docs reviewed"
          value={docReviews.length}
          hint="Concept notes, protocols"
          accent="emerald"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6" />
            </svg>
          }
        />
        <StatTile
          label="Avg plan progress"
          value={`${avgProgress}%`}
          hint="Stages with content"
          accent="amber"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18 M7 15l4-4 4 4 5-7" />
            </svg>
          }
        />
      </section>

      {/* Experiments + tools split */}
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
                Your experiments
              </h2>
              <ScopeTabs scope={scope} basePath="/" user={user} counts={counts} />
            </div>
            <Link href="/experiments" className="text-xs font-medium" style={{ color: "var(--accent)" }}>
              View all →
            </Link>
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

        <ToolsRail
          tools={[
            {
              href: "/consultations",
              title: "M&E Advisor",
              description: "One-off methodology questions — IRR, power, identification.",
              count: consultations.length,
              cta: "Ask a question",
              accent: "linear-gradient(135deg, #7c3aed, #a855f7)",
            },
            {
              href: "/doc-reviews",
              title: "Doc Review",
              description: "Upload a doc for an M&E-level critique of plans and reports.",
              count: docReviews.length,
              cta: "Review a doc",
              accent: "linear-gradient(135deg, #10b981, #06b6d4)",
            },
          ]}
        />
      </section>

      <RecentActivity items={activity} />
    </div>
  );
}
