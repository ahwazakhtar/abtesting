interface ProgressBarProps {
  value: number; // 0-100
  tone?: "accent" | "success" | "warning";
  className?: string;
}

const TONE: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  accent: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
};

export default function ProgressBar({ value, tone = "accent", className = "" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full ${className}`}
      style={{ background: "var(--surface-3)" }}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${clamped}%`, background: TONE[tone] }}
      />
    </div>
  );
}
