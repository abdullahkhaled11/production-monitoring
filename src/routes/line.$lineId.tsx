import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/production/JobCard";
import { AddJobSheet } from "@/components/production/AddJobSheet";
import { useDayJobs, lineTotal } from "@/lib/production/store";
import { formatDayId, num, todayId } from "@/lib/production/format";

export const Route = createFileRoute("/line/$lineId")({
  head: () => ({
    meta: [
      { title: "تفاصيل خط الإنتاج — متابعة الإنتاج" },
      {
        name: "description",
        content: "تفاصيل خط الإنتاج: جميع الشنط الجاري إنتاجها وإجمالي إنتاج الخط.",
      },
      { property: "og:title", content: "تفاصيل خط الإنتاج" },
      {
        property: "og:description",
        content: "استعرض شنط الخط وإجمالي إنتاجه وسجّل الإنتاج مباشرة.",
      },
    ],
  }),
  component: LinePage,
});

function LinePage() {
  const { lineId } = Route.useParams();
  const line = Number(lineId);
  const dayId = todayId();
  const jobs = useDayJobs(dayId);
  const lineJobs = jobs.filter((j) => j.lineId === line);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <header className="rounded-b-3xl bg-primary px-4 pb-5 pt-6 text-primary-foreground">
        <Link to="/" className="mb-2 inline-flex items-center gap-1 text-sm font-bold opacity-90">
          <ChevronRight className="size-4" /> الرئيسية
        </Link>
        <h1 className="text-2xl font-black">خط إنتاج {line}</h1>
        <p className="mt-1 text-xs opacity-90">{formatDayId(dayId)}</p>
        <div className="mt-3 rounded-2xl bg-primary-foreground/15 p-3">
          <p className="text-xs opacity-90">إجمالي إنتاج الخط</p>
          <p className="text-4xl font-black">
            {num(lineTotal(jobs, line))} <span className="text-base font-bold">قطعة</span>
          </p>
        </div>
      </header>

      <div className="space-y-3 px-4">
        {lineJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد شنط على هذا الخط اليوم</p>
        ) : (
          lineJobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
        <Button
          variant="outline"
          className="h-14 w-full border-dashed text-base font-black"
          onClick={() => setOpen(true)}
        >
          <Plus className="size-5" /> إضافة شنطة
        </Button>
      </div>

      <AddJobSheet lineId={line} open={open} onOpenChange={setOpen} />
    </div>
  );
}
