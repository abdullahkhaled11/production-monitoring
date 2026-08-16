import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/production/store";
import { jobCurrent, jobRemaining, type ProductionJob } from "@/lib/production/types";
import { formatTime, num } from "@/lib/production/format";

export function AddProductionSheet({
  job,
  open,
  onOpenChange,
}: {
  job: ProductionJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { state, addEntry, removeEntry } = useStore();
  const [amount, setAmount] = useState(0);
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(0);
      setCustom(false);
    }
  }, [open, job?.id]);

  if (!job) return null;

  const current = jobCurrent(job);
  const remaining = jobRemaining(job);

  const pick = (value: number) => {
    if (value > remaining) {
      setAmount(remaining);
      toast.error(`المتبقي ${num(remaining)} قطعة فقط`);
      return;
    }
    setAmount(value);
  };

  const confirm = () => {
    if (amount <= 0) {
      toast.error("اختر كمية الإنتاج");
      return;
    }
    const safe = Math.min(amount, remaining);
    const entryId = addEntry(job.id, safe);
    onOpenChange(false);
    toast.success(`تمت إضافة ${num(safe)} قطعة بنجاح ✓`, {
      action: entryId
        ? {
            label: "تراجع",
            onClick: () => {
              removeEntry(job.id, entryId);
              toast("تم التراجع عن آخر إضافة");
            },
          }
        : undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader className="text-right">
          <SheetTitle className="text-xl">إضافة إنتاج</SheetTitle>
          <p className="text-sm text-muted-foreground">
            خط إنتاج {job.lineId} — {job.bagTypeNameSnapshot}
          </p>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-8">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">الإنتاج الحالي</p>
              <p className="text-xl font-black">
                {num(current)} / {num(job.requiredQuantity)}
              </p>
            </div>
            <div className="rounded-2xl bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">المتبقي</p>
              <p className="text-xl font-black text-active">{num(remaining)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-bold">كمية الإنتاج</Label>
            {custom ? (
              <Input
                autoFocus
                type="number"
                inputMode="numeric"
                value={amount || ""}
                onChange={(e) => pick(Number(e.target.value))}
                className="h-20 text-center text-4xl font-black"
              />
            ) : (
              <div className="flex h-20 items-center justify-center rounded-xl border border-input bg-card text-5xl font-black">
                {num(amount)}
              </div>
            )}
            <div className="grid grid-cols-4 gap-2">
              {state.quickAdds.map((value) => (
                <Button
                  key={value}
                  variant={amount === value ? "default" : "secondary"}
                  className="h-16 text-lg font-black"
                  onClick={() => pick(value)}
                >
                  +{num(value)}
                </Button>
              ))}
            </div>
            <Button variant="outline" className="h-12 w-full" onClick={() => setCustom((c) => !c)}>
              {custom ? "الأزرار السريعة" : "إدخال رقم مخصص"}
            </Button>
          </div>

          {amount > 0 ? (
            <div className="space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الإنتاج الحالي</span>
                <span className="font-bold">{num(current)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الإضافة</span>
                <span className="font-bold text-active">+{num(amount)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">الإجمالي الجديد</span>
                <span className="text-xl font-black">{num(current + amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المتبقي</span>
                <span className="font-bold">{num(remaining - amount)}</span>
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                وقت التسجيل: {formatTime(Date.now())}
              </p>
            </div>
          ) : null}

          <Button className="h-16 w-full text-lg font-black" onClick={confirm}>
            تأكيد الإضافة
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
