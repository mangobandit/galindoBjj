import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminMetric({
  label,
  value,
  hint,
  Icon,
  className,
  tone = "default",
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  Icon?: LucideIcon;
  className?: string;
  tone?: "default" | "urgent" | "quiet";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card p-5",
        tone === "urgent" && "border-foreground/40 bg-foreground/[0.06]",
        tone === "quiet" && "bg-card/60",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon ? (
          <span className="rounded-md border border-border bg-background p-2 text-muted-foreground">
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight tabular-nums">
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export function AdminProgress({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const bounded = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(bounded)}
        className="h-2 overflow-hidden rounded-full bg-secondary"
      >
        <div
          className="h-full rounded-full bg-foreground transition-[width]"
          style={{ width: `${bounded}%` }}
        />
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
  meta,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {meta ? <div className="mb-2">{meta}</div> : null}
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
