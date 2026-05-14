import { CSSProperties, ReactNode } from "react";

export type PillTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

const TONE_STYLES: Record<PillTone, CSSProperties> = {
  neutral: { background: "var(--surface-2)", color: "var(--fg-3)" },
  accent: { background: "var(--accent-soft)", color: "var(--accent)" },
  success: { background: "var(--success-soft)", color: "var(--success)" },
  warning: { background: "var(--warning-soft)", color: "var(--warning)" },
  danger: { background: "var(--danger-soft)", color: "var(--danger)" },
  info: { background: "rgba(56, 189, 248, 0.12)", color: "#0284c7" },
};

interface PillProps {
  tone?: PillTone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

export default function Pill({ tone = "neutral", children, className = "", dot = false }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={TONE_STYLES[tone]}
    >
      {dot && (
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "currentColor" }}
        />
      )}
      {children}
    </span>
  );
}
