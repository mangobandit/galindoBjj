import { getTranslations } from "next-intl/server";
import { Check, CheckCircle2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  currentPeriod,
  recentPeriods,
  formatPeriod,
  formatEuros,
  formatDate,
} from "@/lib/format";
import { PaymentToggleForm } from "./PaymentToggleForm";
import { AdminMetric, AdminProgress, PageHeader } from "../../_components/AdminMetric";
import type { Member, Payment } from "@/lib/supabase/types";

const DEFAULT_AMOUNT = { adults: 45, kids: 35 } as const;

export default async function PaymentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "admin.payments" });
  const tm = await getTranslations({ locale, namespace: "admin.members" });

  const supabase = await createClient();
  if (!supabase) return null;

  const periods = recentPeriods(12);
  const period =
    sp.period && periods.includes(sp.period) ? sp.period : currentPeriod();

  const [{ data: memberData }, { data: paymentData }] = await Promise.all([
    supabase
      .from("members")
      .select("*")
      .eq("status", "active")
      .order("section")
      .order("full_name"),
    supabase
      .from("payments")
      .select("*")
      .eq("period", period)
      .eq("status", "paid"),
  ]);

  const members = (memberData ?? []) as Member[];
  const payments = (paymentData ?? []) as Payment[];
  const paidById = new Map(payments.map((p) => [p.member_id, p]));

  const paidCount = members.filter((m) => paidById.has(m.id)).length;
  const dueCount = Math.max(members.length - paidCount, 0);
  const paymentRate = members.length ? Math.round((paidCount / members.length) * 100) : 0;
  const collected = members.reduce(
    (sum, m) => sum + (Number(paidById.get(m.id)?.amount) || 0),
    0,
  );
  const orderedMembers = [...members].sort((a, b) => {
    const aPaid = paidById.has(a.id) ? 1 : 0;
    const bPaid = paidById.has(b.id) ? 1 : 0;
    if (aPaid !== bPaid) return aPaid - bPaid;
    return a.full_name.localeCompare(b.full_name);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <form className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">{t("period")}</label>
            <Select
              name="period"
              defaultValue={period}
              aria-label={t("period")}
              className="w-44"
            >
              {periods.map((p) => (
                <option key={p} value={p}>
                  {formatPeriod(p, locale)}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="secondary" size="icon" aria-label={t("period")}>
              <Check />
            </Button>
          </form>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <AdminMetric
          label={t("summary", { paid: paidCount, total: members.length })}
          value={`${paymentRate}%`}
          Icon={CheckCircle2}
        />
        <AdminMetric
          label={t("due")}
          value={dueCount}
          Icon={Clock}
          tone={dueCount ? "urgent" : "quiet"}
        />
        <AdminMetric
          label={t("collected")}
          value={formatEuros(collected, locale)}
          tone="quiet"
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-medium">
            {t("summary", { paid: paidCount, total: members.length })}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatPeriod(period, locale)}
          </span>
        </div>
        <AdminProgress
          value={paymentRate}
          label={t("summary", { paid: paidCount, total: members.length })}
          className="mt-4"
        />
      </div>

      {members.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <ul className="space-y-2">
          {orderedMembers.map((m) => {
            const payment = paidById.get(m.id);
            const isPaid = Boolean(payment);
            const amount = DEFAULT_AMOUNT[m.section] ?? 0;
            return (
              <li
                key={m.id}
                className="grid gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/40 sm:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{m.full_name}</span>
                    <Badge
                      variant={m.section === "kids" ? "primary" : "outline"}
                    >
                      {m.section === "kids" ? tm("kids") : tm("adults")}
                    </Badge>
                    {isPaid ? (
                      <Badge variant="success">
                        <Check className="size-3" /> {t("paid")}
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <Clock className="size-3" /> {t("due")}
                      </Badge>
                    )}
                  </div>
                  {isPaid && payment ? (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {t("paidOn")} {formatDate(payment.paid_on, locale)} ·{" "}
                      {formatEuros(Number(payment.amount), locale)}
                    </div>
                  ) : null}
                </div>

                <PaymentToggleForm
                  memberId={m.id}
                  period={period}
                  isPaid={isPaid}
                  amount={Number(payment?.amount) || amount}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
