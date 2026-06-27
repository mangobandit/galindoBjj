"use client";

import { LayoutGrid, Users, Wallet, Inbox, CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", key: "overview", Icon: LayoutGrid, exact: true },
  { href: "/admin/members", key: "members", Icon: Users, exact: false },
  { href: "/admin/payments", key: "payments", Icon: Wallet, exact: false },
  { href: "/admin/signups", key: "signups", Icon: Inbox, exact: false },
  { href: "/admin/seminars", key: "seminars", Icon: CalendarDays, exact: false },
] as const;

export function AdminNav({ newSignups = 0 }: { newSignups?: number }) {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {ITEMS.map(({ href, key, Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {t(key)}
            {key === "signups" && newSignups > 0 ? (
              <span
                className={cn(
                  "ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/20 text-primary",
                )}
              >
                {newSignups}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
