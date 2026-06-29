import { getTranslations } from "next-intl/server";
import { ArrowRight, CalendarDays, ExternalLink, MapPin, Trophy, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type {
  Competition,
  PublicCompetitionFighter,
} from "@/lib/supabase/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "competitions" });
  return { title: t("title") };
}

export default async function CompetitionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "competitions" });

  const supabase = await createClient();
  const [{ data: competitionsData }, { data: fightersData }] = supabase
    ? await Promise.all([
        supabase
          .from("competitions")
          .select("*")
          .eq("published", true)
          .order("starts_on", { ascending: true }),
        supabase.from("public_competition_fighters").select("*"),
      ])
    : [{ data: [] }, { data: [] }];

  const competitions = (competitionsData ?? []) as Competition[];
  const fighters = (fightersData ?? []) as PublicCompetitionFighter[];
  const fightersByCompetition = new Map<string, PublicCompetitionFighter[]>();
  for (const fighter of fighters) {
    const next = fightersByCompetition.get(fighter.competition_id) ?? [];
    next.push(fighter);
    fightersByCompetition.set(fighter.competition_id, next);
  }

  return (
    <section className="container max-w-3xl py-16 md:py-20">
      <p className="kicker">{t("kicker")}</p>
      <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        {t("intro")}
      </p>

      {competitions.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
          <Trophy className="size-8" />
          {t("empty")}
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {competitions.map((competition) => {
            const competitionFighters =
              fightersByCompetition.get(competition.id) ?? [];
            const medals = competitionFighters.filter((fighter) =>
              ["gold", "silver", "bronze"].includes(fighter.result),
            ).length;

            return (
              <li
                key={competition.id}
                className="rounded-xl border border-border bg-card p-6 md:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold">{competition.title}</h2>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
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
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="size-4" />
                        {competitionFighters.length} {t("fighters")}
                      </span>
                    </div>
                  </div>
                  {medals > 0 ? (
                    <Badge variant="success">
                      {t("medalsCount", { count: medals })}
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href={`/competitions/${competition.id}`}>
                      {t("viewDetails")}
                      <ArrowRight />
                    </Link>
                  </Button>
                  {competition.bracket_url ? (
                    <Button asChild variant="outline">
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
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
