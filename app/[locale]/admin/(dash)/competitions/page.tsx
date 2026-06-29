import { getTranslations } from "next-intl/server";
import {
  CalendarDays,
  ExternalLink,
  EyeOff,
  MapPin,
  Pencil,
  Plus,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { AdminMetric, PageHeader } from "../../_components/AdminMetric";
import type { Competition, CompetitionFighter } from "@/lib/supabase/types";

export default async function AdminCompetitionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.competitions" });

  const supabase = await createClient();
  if (!supabase) return null;

  const [{ data: competitionsData }, { data: fightersData }] = await Promise.all([
    supabase.from("competitions").select("*").order("starts_on", { ascending: false }),
    supabase.from("competition_fighters").select("*"),
  ]);

  const competitions = (competitionsData ?? []) as Competition[];
  const fighters = (fightersData ?? []) as CompetitionFighter[];
  const fightersByCompetition = new Map<string, CompetitionFighter[]>();
  for (const fighter of fighters) {
    const next = fightersByCompetition.get(fighter.competition_id) ?? [];
    next.push(fighter);
    fightersByCompetition.set(fighter.competition_id, next);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingCount = competitions.filter(
    (competition) => new Date(competition.starts_on).getTime() >= today.getTime(),
  ).length;
  const needsSignup = fighters.filter(
    (fighter) => fighter.registration_status === "needs_signup",
  ).length;
  const medalCount = fighters.filter((fighter) =>
    ["gold", "silver", "bronze"].includes(fighter.result),
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button asChild>
            <Link href="/admin/competitions/new">
              <Plus />
              {t("new")}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetric label={t("total")} value={competitions.length} Icon={Trophy} />
        <AdminMetric label={t("upcoming")} value={upcomingCount} tone="quiet" />
        <AdminMetric
          label={t("fighters")}
          value={fighters.length}
          Icon={Users}
          tone="quiet"
        />
        <AdminMetric
          label={t("needsSignup")}
          value={needsSignup}
          Icon={UserCheck}
          tone={needsSignup > 0 ? "urgent" : "quiet"}
          hint={t("medals", { count: medalCount })}
        />
      </div>

      {competitions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
          <Trophy className="size-8" />
          {t("empty")}
        </div>
      ) : (
        <ul className="space-y-3">
          {competitions.map((competition) => {
            const competitionFighters =
              fightersByCompetition.get(competition.id) ?? [];
            const registered = competitionFighters.filter((fighter) =>
              ["registered", "confirmed"].includes(fighter.registration_status),
            ).length;
            const scheduled = competitionFighters.filter(
              (fighter) => fighter.first_match_at,
            ).length;
            const past =
              new Date(competition.starts_on).getTime() < today.getTime();

            return (
              <li
                key={competition.id}
                className="grid gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/40 lg:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold">
                      {competition.title}
                    </span>
                    {past ? <Badge variant="muted">{t("past")}</Badge> : null}
                    {!competition.published ? (
                      <Badge variant="warning">
                        <EyeOff className="size-3" />
                        {t("draft")}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4" />
                      {formatDate(competition.starts_on, locale)}
                    </span>
                    {competition.location ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        {competition.location}
                      </span>
                    ) : null}
                    <span>
                      {t("registeredOf", {
                        registered,
                        total: competitionFighters.length,
                      })}
                    </span>
                    <span>{t("scheduled", { count: scheduled })}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  {competition.bracket_url ? (
                    <Button asChild variant="ghost" size="sm">
                      <a
                        href={competition.bracket_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink />
                        {t("smoothcomp")}
                      </a>
                    </Button>
                  ) : null}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/competitions/${competition.id}`}>
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
