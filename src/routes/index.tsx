import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/production/JobCard";
import { AddJobSheet } from "@/components/production/AddJobSheet";
import { useDayJobs, useStore, lineTotal } from "@/lib/production/store";
import { LINES } from "@/lib/production/types";
import { formatDayId, num, todayId } from "@/lib/production/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "متابعة الإنتاج — مصنع الشنط" },
      {
        name: "description",
        content: "تطبيق موبايل لمتابعة إنتاج خطوط مصنع الشنط وتسجيل الكميات لحظيًا.",
      },
      { property: "og:title", content: "متابعة الإنتاج — مصنع الشنط" },
      {
        property: "og:description",
        content: "سجّل إنتاج كل شنطة على كل خط بضغطات قليلة، مع إجمالي فوري لكل خط.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { ready } = useStore();
  const dayId = todayId();
  const jobs = useDayJobs(dayId);
  const [addLine, setAddLine] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <header className="rounded-b-3xl bg-primary px-4 pb-5 pt-6 text-primary-foreground">
        <h1 className="text-2xl font-black">متابعة الإنتاج</h1>
        <p className="mt-1 text-sm opacity-90">اليوم — {formatDayId(dayId)}</p>
      </header>

      {!ready ? (
        <p className="px-4 text-sm text-muted-foreground">جارٍ تحميل البيانات…</p>
      ) : (
        <div className="space-y-4 px-4">
          {LINES.map((lineId) => {
            const lineJobs = jobs.filter((j) => j.lineId === lineId);
            return (
              <section key={lineId} className="rounded-3xl border border-border bg-secondary/40 p-3">
                <Link
                  to="/line/$lineId"
                  params={{ lineId: String(lineId) }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl bg-card p-4 shadow-card"
                >
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black">خط إنتاج {lineId}</h2>
                    <p className="text-xs text-muted-foreground">إجمالي إنتاج الخط</p>
                    <p className="text-3xl font-black text-primary">
                      {num(lineTotal(jobs, lineId))}{" "}
                      <span className="text-sm font-bold text-muted-foreground">قطعة</span>
                    </p>
                  </div>
                  <ChevronLeft className="size-6 shrink-0 text-muted-foreground" />
                </Link>

                <div className="mt-3 space-y-3">
                  {lineJobs.length === 0 ? (
                    <p className="px-1 py-2 text-sm text-muted-foreground">
                      لا توجد شنط على هذا الخط اليوم
                    </p>
                  ) : (
                    lineJobs.map((job) => <JobCard key={job.id} job={job} />)
                  )}
                </div>

                <Button
                  variant="outline"
                  className="mt-3 h-14 w-full border-dashed text-base font-black"
                  onClick={() => setAddLine(lineId)}
                >
                  <Plus className="size-5" /> إضافة شنطة للخط
                </Button>
              </section>
            );
          })}
        </div>
      )}

      <AddJobSheet
        lineId={addLine ?? 1}
        open={addLine !== null}
        onOpenChange={(open) => !open && setAddLine(null)}
      />
    </div>
  );
}
