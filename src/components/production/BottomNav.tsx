import { Link } from "@tanstack/react-router";
import { Home, ListOrdered, FileBarChart, Settings } from "lucide-react";

const ITEMS = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/log", label: "السجل", icon: ListOrdered },
  { to: "/reports", label: "التقارير", icon: FileBarChart },
  { to: "/settings", label: "الإعدادات", icon: Settings },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-bold"
            >
              <Icon className="size-6" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
