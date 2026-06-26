import { getTranslations } from "next-intl/server";
import { UserPlus, X, Inbox, Globe, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { convertSignup, dismissSignup } from "../../actions";
import { SubmitButton } from "../../_components/SubmitButton";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>

      {signups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
          <Inbox className="size-8" />
          {t("empty")}
        </div>
      ) : (
        <ul className="space-y-3">
          {signups.map((s) => (
            <li
              key={s.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
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
                    href={
                      s.contact.includes("@")
                        ? `mailto:${s.contact}`
                        : `tel:${s.contact.replace(/\s+/g, "")}`
                    }
                    className="mt-1 inline-block text-sm text-primary hover:underline"
                  >
                    {s.contact}
                  </a>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {t("received")} {formatDate(s.created_at, locale)}
                </span>
              </div>

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

              <div className="mt-4 flex flex-wrap gap-2">
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
