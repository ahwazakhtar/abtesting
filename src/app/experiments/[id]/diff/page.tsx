import Link from "next/link";
import { notFound } from "next/navigation";
import { getExperiment } from "@/lib/storage";
import DiffView from "@/components/DiffView";

export const dynamic = "force-dynamic";

export default async function DiffPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { from?: string; to?: string };
}) {
  const exp = await getExperiment(params.id);
  if (!exp) notFound();
  const from = Number(searchParams.from || "1");
  const to = Number(searchParams.to || String(exp.currentVersion));
  const fromV = exp.versions.find((v) => v.number === from);
  const toV = exp.versions.find((v) => v.number === to);
  if (!fromV || !toV) notFound();

  return (
    <div>
      <Link href={`/experiments/${exp.id}`} className="text-xs text-slate-500 hover:underline">
        ← Back to experiment
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">
        v{from} → v{to}
      </h1>
      <p className="mt-1 text-sm text-slate-600">{toV.summary}</p>
      <details className="mt-3 rounded border border-slate-200 bg-white p-3 text-sm">
        <summary className="cursor-pointer font-medium text-slate-700">
          What triggered v{to} ({toV.triggerKind.replace("_", " ")})
        </summary>
        <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-slate-700">
          {toV.triggerText}
        </pre>
      </details>

      <div className="mt-6">
        <DiffView before={fromV.stages} after={toV.stages} highlightUnchanged />
      </div>
    </div>
  );
}
