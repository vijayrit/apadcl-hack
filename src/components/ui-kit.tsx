import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 border-b border-border/60 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <div className="mono mb-2 text-[11px] uppercase tracking-[0.22em] text-primary">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  trend,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  tone?: "primary" | "accent" | "air" | "port" | "rail" | "road" | "cargo" | "pax";
}) {
  return (
    <div className="panel relative overflow-hidden p-5">
      <div
        className="absolute inset-x-0 top-0 h-px opacity-70"
        style={{ background: `var(--${tone})` }}
      />
      <div className="mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-semibold tabular-nums">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {trend && <div className="mt-1 text-xs text-muted-foreground">{trend}</div>}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel p-5 ${className}`}>
      {(title || actions) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="font-display text-sm font-semibold">{title}</h3>}
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function ModeDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}
