import { getTranslations } from "next-intl/server";
import {
  Users,
  Baby,
  AlertCircle,
  Inbox,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { currentPeriod, formatPeriod, formatEuros } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.overview" });
  const supabase = await createClient();
  if (!supabase) return null;

  const period = currentPeriod();

  const [{ data: members }, { data: payments }, { count: signupCount }] =
    await Promise.all([
      supabase.from("members").select("id, section, status"),
      supabase
        .from("payments")
        .select("member_id, amount")
        .eq("period", period)
        .eq("status", "paid"),
      supabase
        .from("signups")
        .select("id", { count: "exact", head: true })
        .eq("converted", false),
    ]);

  const active = (members ?? []).filter((m) => m.status === "active");
  const kids = active.filter((m) => m.section === "kids").length;
  const adults = active.filter((m) => m.section === "adults").length;

  const activeIds = new Set(active.map((m) => m.id));
  const paidActive = new Set(
    (payments ?? [])
      .map((p) => p.member_id)
      .filter((id) => activeIds.has(id)),
  );
  const due = Math.max(active.length - paidActive.size, 0);
  const collected = (payments ?? []).reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0,
  );
  const newSignups = signupCount ?? 0;

  const stats = [
    {
      label: t("activeMembers"),
      value: active.length,
      Icon: Users,
      tone: "text-foreground",
    },
    {
      label: t("kidsAdults"),
      value: `${kids} / ${adults}`,
      Icon: Baby,
      tone: "text-foreground",
    },
    {
      label: t("dueThisMonth"),
      value: due,
      hint: t("dueHint"),
      Icon: AlertCircle,
      tone: due > 0 ? "text-foreground" : "text-muted-foreground",
    },
    {
      label: t("newSignups"),
      value: newSignups,
      Icon: Inbox,
      tone: newSignups > 0 ? "text-foreground" : "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <span className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
          {t("period")}: {formatPeriod(period, locale)}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, hint, Icon, tone }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className={`size-4 ${tone}`} />
            </div>
            <div className={`mt-3 text-3xl font-bold tabular-nums ${tone}`}>
              {value}
            </div>
            {hint ? (
              <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="size-4" />
            {t("collected")}
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums">
            {formatEuros(collected, locale)}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("paidOf", { paid: paidActive.size, total: active.length })}
          </p>
          <Link
            href="/admin/payments"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {t("goPayments")}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Inbox className="size-4" />
            {t("newSignups")}
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums">
            {newSignups}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("quickActions")}</p>
          <Link
            href="/admin/signups"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {t("reviewSignups")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
