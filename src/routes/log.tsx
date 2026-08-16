import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDayJobs } from "@/lib/production/store";
import { LINES } from "@/lib/production/types";
import { formatTime, num, todayId } from "@/lib/production/format";

export const Route = createFileRoute("/log")({
  head: () => ({
    meta: [
      { title: "سجل عمليات الإنتاج — متابعة الإنتاج" },
      {
        name: "description",
        content: "سجل كل عمليات الإنتاج المسجلة اليوم مع الفلترة حسب الخط والشنطة والمشرف.",
      },
      { property: "og:title", content: "سجل عمليات الإنتاج" },
      {
        property: "og:description",
        content: "تابع كل إضافة إنتاج خلال اليوم بالوقت والكمية والخط.",
      },
    ],
  }),
  component: LogPage,
});

const ALL = "all";

function LogPage() {
  const jobs = useDayJobs(todayId());
  const [line, setLine] = useState(ALL);
  const [bag, setBag] = useState(ALL);
  const [supervisor, setSupervisor] = useState(ALL);

  const bags = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.bagTypeNameSnapshot))),
    [jobs],
  );
  const supervisors = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.supervisorNameSnapshot))),
    [jobs],
  );

  const rows = useMemo(() => {
    return jobs
      .filter((j) => line === ALL || j.lineId === Number(line))
      .filter((j) => bag === ALL || j.bagTypeNameSnapshot === bag)
      .filter((j) => supervisor === ALL || j.supervisorNameSnapshot === supervisor)
      .flatMap((j) => j.entries.map((e) => ({ entry: e, job: j })))
      .sort((a, b) => b.entry.timestamp - a.entry.timestamp);
  }, [jobs, line, bag, supervisor]);

  return (
    <div className="space-y-4">
      <header className="rounded-b-3xl bg-primary px-4 pb-5 pt-6 text-primary-foreground">
        <h1 className="text-2xl font-black">سجل الإنتاج</h1>
        <p className="mt-1 text-sm opacity-90">جميع العمليات المسجلة اليوم</p>
      </header>

      <div className="grid grid-cols-3 gap-2 px-4">
        <Select value={line} onValueChange={setLine}>
          <SelectTrigger className="h-12 w-full">
            <SelectValue placeholder="الخط" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>كل الخطوط</SelectItem>
            {LINES.map((l) => (
              <SelectItem key={l} value={String(l)}>
                خط {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={bag} onValueChange={setBag}>
          <SelectTrigger className="h-12 w-full">
            <SelectValue placeholder="الشنطة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>كل الشنط</SelectItem>
            {bags.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={supervisor} onValueChange={setSupervisor}>
          <SelectTrigger className="h-12 w-full">
            <SelectValue placeholder="المشرف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>كل المشرفين</SelectItem>
            {supervisors.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ul className="space-y-2 px-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد عمليات مطابقة</p>
        ) : (
          rows.map(({ entry, job }) => (
            <li
              key={entry.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
            >
              <div className="min-w-0">
                <p className="text-sm font-black">{formatTime(entry.timestamp)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  خط {job.lineId} — {job.bagTypeNameSnapshot} — {job.supervisorNameSnapshot}
                </p>
              </div>
              <span className="shrink-0 text-xl font-black text-active">+{num(entry.quantity)}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
