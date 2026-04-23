import Link from "next/link";
import { notFound } from "next/navigation";
import { getExperiment } from "@/lib/storage";
import StageList from "@/components/StageList";
import VersionTimeline from "@/components/VersionTimeline";

export const dynamic = "force-dynamic";

export default async function ExperimentPage({ params }: { params: { id: string } }) {
  const exp = await getExperiment(params.id);
  if (!exp) notFound();
  const current = exp.versions[exp.versions.length - 1];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <Link href="/" className="text-xs text-slate-500 hover:underline">
              ← All experiments
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{exp.title}</h1>
            {exp.description && (
              <p className="mt-1 max-w-2xl text-sm text-slate-600">{exp.description}</p>
            )}
          </div>
          <Link
            href={`/experiments/${exp.id}/iterate`}
            className="shrink-0 rounded bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Iterate on plan
          </Link>
        </div>

        <div className="mb-3 text-xs uppercase tracking-wide text-slate-500">
          Current plan — v{current.number}
        </div>
        <StageList stages={current.stages} />
      </div>

      <aside>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Version history
        </h2>
        <VersionTimeline
          experimentId={exp.id}
          versions={exp.versions}
          currentVersion={exp.currentVersion}
        />
      </aside>
    </div>
  );
}
