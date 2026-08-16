import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/production/store";

export function AddJobSheet({
  lineId,
  open,
  onOpenChange,
}: {
  lineId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { state, addJob, addSupervisor, addBagType } = useStore();
  const [supervisorId, setSupervisorId] = useState("");
  const [bagTypeId, setBagTypeId] = useState("");
  const [required, setRequired] = useState("");
  const [newSupervisor, setNewSupervisor] = useState<string | null>(null);
  const [newBag, setNewBag] = useState<string | null>(null);

  const reset = () => {
    setSupervisorId("");
    setBagTypeId("");
    setRequired("");
    setNewSupervisor(null);
    setNewBag(null);
  };

  const submit = () => {
    const quantity = Number(required);
    if (!supervisorId) {
      toast.error("اختر المشرف");
      return;
    }
    if (!bagTypeId) {
      toast.error("اختر نوع الشنطة");
      return;
    }
    if (!quantity || quantity <= 0) {
      toast.error("أدخل الكمية المطلوبة");
      return;
    }
    addJob({ lineId, supervisorId, bagTypeId, requiredQuantity: Math.floor(quantity) });
    toast.success("تم بدء الإنتاج بنجاح ✓");
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader className="text-right">
          <SheetTitle className="text-xl">إضافة شنطة جديدة</SheetTitle>
          <p className="text-sm text-muted-foreground">خط إنتاج {lineId}</p>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-8">
          <div className="space-y-2">
            <Label className="text-base font-bold">المشرف</Label>
            <Select value={supervisorId} onValueChange={setSupervisorId}>
              <SelectTrigger className="h-14 w-full text-base">
                <SelectValue placeholder="اختر المشرف" />
              </SelectTrigger>
              <SelectContent>
                {state.supervisors.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-base">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {newSupervisor === null ? (
              <Button variant="ghost" className="h-10 text-primary" onClick={() => setNewSupervisor("")}>
                <Plus className="size-4" /> إضافة مشرف جديد
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input
                  autoFocus
                  value={newSupervisor}
                  onChange={(e) => setNewSupervisor(e.target.value)}
                  placeholder="اسم المشرف"
                  className="h-12 text-base"
                />
                <Button
                  className="h-12"
                  onClick={() => {
                    const id = addSupervisor(newSupervisor);
                    if (!id) {
                      toast.error("أدخل اسم المشرف");
                      return;
                    }
                    setSupervisorId(id);
                    setNewSupervisor(null);
                    toast.success("تمت إضافة المشرف ✓");
                  }}
                >
                  حفظ
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">نوع الشنطة</Label>
            <Select value={bagTypeId} onValueChange={setBagTypeId}>
              <SelectTrigger className="h-14 w-full text-base">
                <SelectValue placeholder="اختر نوع الشنطة" />
              </SelectTrigger>
              <SelectContent>
                {state.bagTypes.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-base">
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {newBag === null ? (
              <Button variant="ghost" className="h-10 text-primary" onClick={() => setNewBag("")}>
                <Plus className="size-4" /> إضافة نوع شنطة جديد
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input
                  autoFocus
                  value={newBag}
                  onChange={(e) => setNewBag(e.target.value)}
                  placeholder="اسم الشنطة"
                  className="h-12 text-base"
                />
                <Button
                  className="h-12"
                  onClick={() => {
                    const id = addBagType(newBag);
                    if (!id) {
                      toast.error("أدخل اسم الشنطة");
                      return;
                    }
                    setBagTypeId(id);
                    setNewBag(null);
                    toast.success("تمت إضافة نوع الشنطة ✓");
                  }}
                >
                  حفظ
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-base font-bold">الكمية المطلوبة</Label>
            <Input
              inputMode="numeric"
              type="number"
              value={required}
              onChange={(e) => setRequired(e.target.value)}
              placeholder="800"
              className="h-16 text-center text-3xl font-black"
            />
          </div>

          <Button className="h-16 w-full text-lg font-black" onClick={submit}>
            بدء الإنتاج
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
