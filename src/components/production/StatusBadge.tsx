import { STATUS_LABEL, type JobStatus } from "@/lib/production/types";
import { cn } from "@/lib/utils";

const STYLES: Record<JobStatus, string> = {
  completed: "bg-success-soft text-success border-success/30",
  in_progress: "bg-active-soft text-active border-active/30",
  not_started: "bg-idle text-idle-foreground border-idle-foreground/20",
};

export function StatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold",
        STYLES[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
      {status === "completed" ? " ✓" : null}
    </span>
  );
}
