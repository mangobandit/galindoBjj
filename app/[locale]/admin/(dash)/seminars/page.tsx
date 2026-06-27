import { getTranslations } from "next-intl/server";
import { Plus, CalendarDays, MapPin, Users, Pencil, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import type { Seminar } from "@/lib/supabase/types";

export default async function AdminSeminarsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.seminars" });

  const supabase = await createClient();
  if (!supabase) return null;

  const [{ data: seminarsData }, { data: counts }] = await Promise.all([
    supabase.from("seminars").select("*").order("starts_at", { ascending: false }),
    supabase.from("seminar_signups").select("seminar_id"),
  ]);

  const seminars = (seminarsData ?? []) as Seminar[];
  const attendeeCount = new Map<string, number>();
  for (const row of counts ?? []) {
    attendeeCount.set(
      row.seminar_id,
      (attendeeCount.get(row.seminar_id) ?? 0) + 1,
    );
  }

  const now = Date.now();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/admin/seminars/new">
            <Plus />
            {t("new")}
          </Link>
        </Button>
      </div>

      {seminars.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
          <CalendarDays className="size-8" />
          {t("empty")}
        </div>
      ) : (
        <ul className="space-y-3">
          {seminars.map((s) => {
            const going = attendeeCount.get(s.id) ?? 0;
            const past = new Date(s.starts_at).getTime() < now;
            return (
              <li
                key={s.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold">{s.title}</span>
                    {past ? <Badge variant="muted">{t("past")}</Badge> : null}
                    {!s.published ? (
                      <Badge variant="warning">
                        <EyeOff className="size-3" />
                        {t("draft")}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4" />
                      {formatDateTime(s.starts_at, locale)}
                    </span>
                    {s.location ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        {s.location}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-4" />
                      {s.capacity != null
                        ? t("attendingOf", { going, cap: s.capacity })
                        : t("attending", { going })}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/seminars/${s.id}`}>
                      <Pencil />
                      {t("manage")}
                    </Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
