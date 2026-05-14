import { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: "indigo" | "violet" | "emerald" | "amber" | "rose";
}

const ACCENT_BG: Record<NonNullable<StatTileProps["accent"]>, string> = {
  indigo: "rgba(99, 102, 241, 0.12)",
  violet: "rgba(139, 92, 246, 0.12)",
  emerald: "rgba(16, 185, 129, 0.12)",
  amber: "rgba(245, 158, 11, 0.12)",
  rose: "rgba(244, 63, 94, 0.12)",
};

const ACCENT_FG: Record<NonNullable<StatTileProps["accent"]>, string> = {
  indigo: "#6366f1",
  violet: "#8b5cf6",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
};

export default function StatTile({ label, value, hint, icon, accent = "indigo" }: StatTileProps) {
  return (
    <div className="card p-4 flex items-start gap-3">
      {icon && (
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: ACCENT_BG[accent], color: ACCENT_FG[accent] }}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--fg-4)" }}>
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
          {value}
        </p>
        {hint && (
          <p className="mt-0.5 text-xs" style={{ color: "var(--fg-4)" }}>{hint}</p>
        )}
      </div>
    </div>
  );
}
