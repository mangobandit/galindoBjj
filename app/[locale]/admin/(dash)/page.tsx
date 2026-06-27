import { getTranslations } from "next-intl/server";
import {
  Users,
  Baby,
  AlertCircle,
  Inbox,
  Wallet,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { currentPeriod, formatPeriod, formatEuros } from "@/lib/format";
import { AdminMetric, AdminProgress, PageHeader } from "../_components/AdminMetric";

export const dynamic = "force-dynamic";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.overview" });
  const tm = await getTranslations({ locale, namespace: "admin.members" });
  const supabase = await createClient();
  if (!supabase) return null;

  const period = currentPeriod();

  const [{ data: members }, { data: payments }, { count: signupCount }] =
    await Promise.all([
      supabase.from("members").select("id, full_name, section, status"),
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
  const prospects = (members ?? []).filter((m) => m.status === "prospect");
  const inactive = (members ?? []).filter((m) => m.status === "inactive");
  const kids = active.filter((m) => m.section === "kids").length;
  const adults = active.filter((m) => m.section === "adults").length;

  const activeIds = new Set(active.map((m) => m.id));
  const paidActive = new Set(
    (payments ?? [])
      .map((p) => p.member_id)
      .filter((id) => activeIds.has(id)),
  );
  const due = Math.max(active.length - paidActive.size, 0);
  const paymentRate = active.length ? Math.round((paidActive.size / active.length) * 100) : 0;
  const dueMembers = active.filter((m) => !paidActive.has(m.id)).slice(0, 5);
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
      label: tm("prospect"),
      value: prospects.length,
      Icon: UserCheck,
      tone: "text-muted-foreground",
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
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <span className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
            {t("period")}: {formatPeriod(period, locale)}
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, hint, Icon, tone }) => (
          <AdminMetric
            key={label}
            label={label}
            value={<span className={tone}>{value}</span>}
            hint={hint}
            Icon={Icon}
            tone={label === t("dueThisMonth") && due > 0 ? "urgent" : "default"}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="size-4" />
                {t("collected")}
              </div>
              <div className="mt-2 text-3xl font-bold tabular-nums">
                {formatEuros(collected, locale)}
              </div>
            </div>
            <div className="rounded-md border border-border bg-background px-3 py-2 text-right">
              <div className="text-2xl font-bold tabular-nums">{paymentRate}%</div>
              <div className="text-xs text-muted-foreground">
                {t("paidOf", { paid: paidActive.size, total: active.length })}
              </div>
            </div>
          </div>
          <AdminProgress
            value={paymentRate}
            label={t("paidOf", { paid: paidActive.size, total: active.length })}
            className="mt-5"
          />
          {dueMembers.length > 0 ? (
            <div className="mt-5 border-t border-border pt-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="size-4" />
                {t("dueThisMonth")}
              </div>
              <div className="flex flex-wrap gap-2">
                {dueMembers.map((m) => (
                  <span
                    key={m.id}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                  >
                    {m.full_name}
                  </span>
                ))}
                {due > dueMembers.length ? (
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                    +{due - dueMembers.length}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
          <Link
            href="/admin/payments"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {t("goPayments")}
            <ArrowRight className="size-4" />
          </Link>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
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
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
            <div>
              <div className="text-muted-foreground">{tm("inactive")}</div>
              <div className="mt-1 text-xl font-bold tabular-nums">{inactive.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{tm("prospect")}</div>
              <div className="mt-1 text-xl font-bold tabular-nums">{prospects.length}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
