import { getTranslations } from "next-intl/server";
import { Contact, Globe, Inbox, MessageSquare, UserPlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { convertSignup, dismissSignup } from "../../actions";
import { SubmitButton } from "../../_components/SubmitButton";
import { AdminMetric, PageHeader } from "../../_components/AdminMetric";
import type { Signup } from "@/lib/supabase/types";

export default async function SignupsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.signups" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("signups")
    .select("*")
    .eq("converted", false)
    .order("created_at", { ascending: false });

  const signups = (data ?? []) as Signup[];
  const kids = signups.filter((s) => s.section_interest === "kids").length;
  const adults = signups.filter((s) => s.section_interest === "adults").length;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-3 sm:grid-cols-3">
        <AdminMetric label={t("title")} value={signups.length} Icon={Inbox} />
        <AdminMetric label={t("kids")} value={kids} tone="quiet" />
        <AdminMetric label={t("adults")} value={adults} tone="quiet" />
      </div>

      {signups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
          <Inbox className="size-8" />
          {t("empty")}
        </div>
      ) : (
        <ul className="space-y-3">
          {signups.map((s) => {
            const contactHref = s.contact.includes("@")
              ? `mailto:${s.contact}`
              : `tel:${s.contact.replace(/\s+/g, "")}`;

            return (
              <li
                key={s.id}
                className="grid gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/40 lg:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold">{s.name}</span>
                    {s.section_interest ? (
                      <Badge
                        variant={
                          s.section_interest === "kids" ? "primary" : "outline"
                        }
                      >
                        {s.section_interest === "kids" ? t("kids") : t("adults")}
                      </Badge>
                    ) : null}
                    <Badge variant="muted">
                      <Globe className="size-3" />
                      {tc(`languages.${s.language}`)}
                    </Badge>
                  </div>
                  <a
                    href={contactHref}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Contact className="size-4" />
                    {s.contact}
                  </a>

                  {s.parent_name || s.emergency_contact ? (
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                      {s.parent_name ? (
                        <span>
                          {t("parentName")}: {s.parent_name}
                        </span>
                      ) : null}
                      {s.emergency_contact ? (
                        <span>
                          {t("emergency")}: {s.emergency_contact}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {s.message ? (
                    <p className="mt-3 flex gap-2 rounded-md bg-secondary/50 p-3 text-sm text-foreground">
                      <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      {s.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {t("received")} {formatDate(s.created_at, locale)}
                  </span>
                  <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                    <form action={convertSignup}>
                      <input type="hidden" name="id" value={s.id} />
                      <SubmitButton size="sm" pendingLabel={t("converting")}>
                        <UserPlus />
                        {t("convert")}
                      </SubmitButton>
                    </form>
                    <form action={dismissSignup}>
                      <input type="hidden" name="id" value={s.id} />
                      <SubmitButton variant="ghost" size="sm">
                        <X />
                        {t("dismiss")}
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
