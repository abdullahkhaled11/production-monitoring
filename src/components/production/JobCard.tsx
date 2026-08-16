import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, History, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStore } from "@/lib/production/store";
import {
  entryRunningTotal,
  jobCurrent,
  jobProgress,
  jobRemaining,
  jobStatus,
  sortedEntries,
  type ProductionEntry,
  type ProductionJob,
} from "@/lib/production/types";
import { formatTime, num } from "@/lib/production/format";
import { StatusBadge } from "./StatusBadge";
import { AddProductionSheet } from "./AddProductionSheet";

export function JobCard({ job }: { job: ProductionJob }) {
  const { updateEntry, removeEntry } = useStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editing, setEditing] = useState<ProductionEntry | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleting, setDeleting] = useState<ProductionEntry | null>(null);

  const current = jobCurrent(job);
  const status = jobStatus(job);
  const entries = sortedEntries(job);
  const last = entries[0];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black">{job.bagTypeNameSnapshot}</h3>
          <p className="truncate text-xs text-muted-foreground">
            المشرف: {job.supervisorNameSnapshot}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-3xl font-black leading-none">
          {num(current)}
          <span className="text-base font-bold text-muted-foreground"> / {num(job.requiredQuantity)}</span>
        </p>
        <p className="text-sm font-bold text-muted-foreground">
          {status === "completed" ? "مكتملة ✓" : `المتبقي ${num(jobRemaining(job))}`}
        </p>
      </div>

      <div className="mt-2 space-y-1">
        <Progress value={jobProgress(job)} className="h-3" />
        <p className="text-xs font-bold text-muted-foreground">
          نسبة الإنجاز: {num(jobProgress(job))}%
        </p>
      </div>

      <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
        {last ? (
          <p>
            آخر إضافة: +{num(last.quantity)} — الساعة {formatTime(last.timestamp)}
          </p>
        ) : (
          <p>لا توجد عمليات إنتاج بعد</p>
        )}
        {job.completedAt ? <p>انتهت الساعة: {formatTime(job.completedAt)}</p> : null}
      </div>

      <div className="mt-3 flex gap-2">
        {status === "completed" ? (
          <div className="flex h-14 flex-1 items-center justify-center rounded-xl bg-success-soft text-base font-black text-success">
            مكتملة ✓
          </div>
        ) : (
          <Button className="h-14 flex-1 text-base font-black" onClick={() => setSheetOpen(true)}>
            <Plus className="size-5" /> إضافة إنتاج
          </Button>
        )}
        <Button
          variant="outline"
          className="h-14 w-14"
          aria-label="سجل الإنتاج"
          onClick={() => setHistoryOpen((v) => !v)}
        >
          <History className="size-5" />
          <ChevronDown className={historyOpen ? "size-4 rotate-180" : "size-4"} />
        </Button>
      </div>

      {historyOpen ? (
        <div className="mt-3 border-t border-border pt-3">
          <h4 className="mb-2 text-sm font-black">سجل الإنتاج</h4>
          {entries.length === 0 ? (
            <p className="text-xs text-muted-foreground">لا توجد عمليات مسجلة</p>
          ) : (
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-muted p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-black">
                      +{num(entry.quantity)}{" "}
                      <span className="text-xs font-bold text-muted-foreground">
                        — {formatTime(entry.timestamp)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      الإجمالي: {num(entryRunningTotal(job, entry.id))}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="تعديل"
                      onClick={() => {
                        setEditing(entry);
                        setEditValue(String(entry.quantity));
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="حذف"
                      className="text-destructive"
                      onClick={() => setDeleting(entry)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <AddProductionSheet job={job} open={sheetOpen} onOpenChange={setSheetOpen} />

      <AlertDialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <AlertDialogContent className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>تعديل عملية الإنتاج</AlertDialogTitle>
            <AlertDialogDescription>عدّل الكمية المسجلة لهذه العملية.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="number"
            inputMode="numeric"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-16 text-center text-3xl font-black"
          />
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-12">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="h-12"
              onClick={() => {
                if (!editing) return;
                const value = Math.floor(Number(editValue));
                if (!value || value <= 0) {
                  toast.error("أدخل كمية صحيحة");
                  return;
                }
                const maxAllowed = job.requiredQuantity - (current - editing.quantity);
                if (value > maxAllowed) {
                  toast.error(`أقصى كمية مسموحة ${num(maxAllowed)} قطعة`);
                  return;
                }
                updateEntry(job.id, editing.id, value);
                setEditing(null);
                toast.success("تم تعديل العملية ✓");
              }}
            >
              حفظ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف عملية الإنتاج هذه؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إعادة حساب إجمالي الإنتاج تلقائيًا بعد الحذف.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-12">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleting) removeEntry(job.id, deleting.id);
                setDeleting(null);
                toast.success("تم حذف العملية ✓");
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
