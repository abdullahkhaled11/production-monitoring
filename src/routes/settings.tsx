import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { num } from "@/lib/production/format";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات والبيانات الأساسية — متابعة الإنتاج" },
      {
        name: "description",
        content: "إدارة المشرفين وأنواع الشنط وأزرار الإضافة السريعة وبيانات التطبيق المحلية.",
      },
      { property: "og:title", content: "الإعدادات والبيانات الأساسية" },
      {
        property: "og:description",
        content: "أضف وعدّل واحذف المشرفين وأنواع الشنط بحرية كاملة.",
      },
    ],
  }),
  component: SettingsPage,
});

interface ListItem {
  id: string;
  name: string;
}

function EntityList({
  title,
  items,
  addLabel,
  placeholder,
  onAdd,
  onUpdate,
  onRemove,
}: {
  title: string;
  items: ListItem[];
  addLabel: string;
  placeholder: string;
  onAdd: (name: string) => string | null;
  onUpdate: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState<ListItem | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleting, setDeleting] = useState<ListItem | null>(null);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <h2 className="text-lg font-black">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد عناصر بعد</p>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-muted p-3"
            >
              <span className="truncate text-base font-bold">{item.name}</span>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="تعديل"
                  onClick={() => {
                    setEditing(item);
                    setEditValue(item.name);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="حذف"
                  className="text-destructive"
                  onClick={() => setDeleting(item)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>

      {adding ? (
        <div className="mt-3 space-y-2">
          <Label className="text-sm font-bold">{placeholder}</Label>
          <div className="flex gap-2">
            <Input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-12 text-base"
            />
            <Button
              className="h-12"
              onClick={() => {
                if (!onAdd(value)) {
                  toast.error("أدخل الاسم أولًا");
                  return;
                }
                setValue("");
                setAdding(false);
                toast.success("تمت الإضافة ✓");
              }}
            >
              حفظ
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="mt-3 h-13 w-full border-dashed py-3 text-base font-black"
          onClick={() => setAdding(true)}
        >
          <Plus className="size-5" /> {addLabel}
        </Button>
      )}

      <AlertDialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <AlertDialogContent className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>تعديل الاسم</AlertDialogTitle>
            <AlertDialogDescription>سيتم تحديث الاسم في القوائم الجديدة فقط.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-14 text-base"
          />
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-12">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="h-12"
              onClick={() => {
                if (!editValue.trim()) {
                  toast.error("أدخل الاسم أولًا");
                  return;
                }
                if (editing) onUpdate(editing.id, editValue);
                setEditing(null);
                toast.success("تم التعديل ✓");
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
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف «{deleting?.name}» من القائمة فقط، وستظل سجلات الإنتاج السابقة محتفظة بالاسم.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-12">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleting) onRemove(deleting.id);
                setDeleting(null);
                toast.success("تم الحذف ✓");
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function SettingsPage() {
  const {
    state,
    addSupervisor,
    updateSupervisor,
    removeSupervisor,
    addBagType,
    updateBagType,
    removeBagType,
    setQuickAdds,
    clearAll,
  } = useStore();
  const [quick, setQuick] = useState<string[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  const quickValues = quick.length ? quick : state.quickAdds.map(String);

  return (
    <div className="space-y-4">
      <header className="rounded-b-3xl bg-primary px-4 pb-5 pt-6 text-primary-foreground">
        <h1 className="text-2xl font-black">الإعدادات</h1>
        <p className="mt-1 text-sm opacity-90">البيانات الأساسية للتطبيق</p>
      </header>

      <div className="space-y-4 px-4">
        <EntityList
          title="المشرفون"
          items={state.supervisors}
          addLabel="إضافة مشرف"
          placeholder="اسم المشرف"
          onAdd={addSupervisor}
          onUpdate={updateSupervisor}
          onRemove={removeSupervisor}
        />

        <EntityList
          title="أنواع الشنط"
          items={state.bagTypes}
          addLabel="إضافة نوع شنطة"
          placeholder="اسم الشنطة"
          onAdd={addBagType}
          onUpdate={updateBagType}
          onRemove={removeBagType}
        />

        <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <h2 className="text-lg font-black">أزرار الإضافة السريعة</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            الأزرار الحالية: {state.quickAdds.map((v) => `+${num(v)}`).join(" · ")}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {quickValues.map((value, index) => (
              <Input
                key={index}
                type="number"
                inputMode="numeric"
                value={value}
                onChange={(e) => {
                  const next = [...quickValues];
                  next[index] = e.target.value;
                  setQuick(next);
                }}
                className="h-14 text-center text-lg font-black"
              />
            ))}
          </div>
          <Button
            className="mt-3 h-14 w-full text-base font-black"
            onClick={() => {
              const values = quickValues.map((v) => Math.floor(Number(v)));
              if (values.some((v) => !v || v <= 0)) {
                toast.error("أدخل أرقامًا صحيحة أكبر من صفر");
                return;
              }
              setQuickAdds(values);
              toast.success("تم حفظ الأزرار السريعة ✓");
            }}
          >
            حفظ الأزرار السريعة
          </Button>
        </section>

        <section className="rounded-2xl border border-destructive/30 bg-card p-4 shadow-card">
          <h2 className="text-lg font-black">البيانات المحلية</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            سيتم حذف كل الخطوط والشنط وسجلات الإنتاج والمشرفين نهائيًا من هذا الجهاز.
          </p>
          <Button
            variant="destructive"
            className="mt-3 h-14 w-full text-base font-black"
            onClick={() => setConfirmClear(true)}
          >
            <Trash2 className="size-5" /> مسح جميع البيانات
          </Button>
        </section>
      </div>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent className="text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من مسح جميع البيانات؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذه العملية. سيتم حذف جميع بيانات الإنتاج والمشرفين وأنواع الشنط.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-12">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                clearAll();
                setConfirmClear(false);
                toast.success("تم مسح جميع البيانات");
              }}
            >
              مسح نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
