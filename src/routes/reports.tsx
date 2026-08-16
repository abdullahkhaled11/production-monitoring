import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/production/StatusBadge";
import { useStore, lineTotal } from "@/lib/production/store";
import { LINES, jobCurrent, jobProgress, jobRemaining, jobStatus } from "@/lib/production/types";
import { formatDayId, formatTime, num, todayId } from "@/lib/production/format";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "تقارير الإنتاج اليومية — متابعة الإنتاج" },
      {
        name: "description",
        content: "تقرير اليوم والأيام السابقة مرتبًا حسب خطوط الإنتاج مع إجمالي كل خط.",
      },
      { property: "og:title", content: "تقارير الإنتاج اليومية" },
      {
        property: "og:description",
        content: "استعرض إنتاج كل شنطة وإجمالي كل خط في أي يوم عمل.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { state } = useStore();
  const [dayId, setDayId] = useState(todayId());

  const days = useMemo(
    () => Array.from(new Set([todayId(), ...state.jobs.map((j) => j.dayId)])).sort().reverse(),
    [state.jobs],
  );
  const jobs = useMemo(() => state.jobs.filter((j) => j.dayId === dayId), [state.jobs, dayId]);

  return (
    <div className="space-y-4">
      <header className="rounded-b-3xl bg-primary px-4 pb-5 pt-6 text-primary-foreground">
        <h1 className="text-2xl font-black">تقرير اليوم</h1>
        <p className="mt-1 text-sm opacity-90">{formatDayId(dayId)}</p>
      </header>

      <div className="flex gap-2 overflow-x-auto px-4 pb-1">
        {days.map((d) => (
          <Button
            key={d}
            variant={d === dayId ? "default" : "secondary"}
            className="h-11 shrink-0 text-sm font-bold"
            onClick={() => setDayId(d)}
          >
            {d === todayId() ? "اليوم" : formatDayId(d)}
          </Button>
        ))}
      </div>

      <div className="space-y-4 px-4">
        {LINES.map((lineId) => {
          const lineJobs = jobs.filter((j) => j.lineId === lineId);
          return (
            <section key={lineId} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <h2 className="text-lg font-black">خط إنتاج {lineId}</h2>
              <ul className="mt-3 space-y-3">
                {lineJobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا يوجد إنتاج على هذا الخط</p>
                ) : (
                  lineJobs.map((job) => (
                    <li key={job.id} className="rounded-xl bg-muted p-3">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                        <p className="truncate text-sm font-black">{job.bagTypeNameSnapshot}</p>
                        <StatusBadge status={jobStatus(job)} />
                      </div>
                      <p className="mt-1 text-xl font-black">
                        {num(jobCurrent(job))} / {num(job.requiredQuantity)}
                        <span className="ms-2 text-xs font-bold text-muted-foreground">
                          {jobStatus(job) === "completed"
                            ? "مكتملة ✓"
                            : `المتبقي ${num(jobRemaining(job))}`}
                        </span>
                      </p>
                      <Progress value={jobProgress(job)} className="mt-2 h-2" />
                      <p className="mt-1 text-xs text-muted-foreground">
                        عدد العمليات: {num(job.entries.length)}
                        {job.completedAt ? ` — انتهت الساعة ${formatTime(job.completedAt)}` : ""}
                      </p>
                    </li>
                  ))
                )}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-bold text-muted-foreground">
                  إجمالي إنتاج خط {lineId}
                </span>
                <span className="text-2xl font-black text-primary">
                  {num(lineTotal(jobs, lineId))} <span className="text-xs">قطعة</span>
                </span>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
