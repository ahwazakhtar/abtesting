import { ReactNode } from "react";

interface SectionCardProps {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export default function SectionCard({
  title,
  action,
  children,
  className = "",
  bodyClassName = "p-5",
}: SectionCardProps) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header
          className="flex items-center justify-between border-b px-5 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          {typeof title === "string" ? (
            <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{title}</h3>
          ) : (
            title
          )}
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
