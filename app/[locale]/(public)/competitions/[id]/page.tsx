import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type {
  Competition,
  PublicCompetitionFighter,
  PublicCompetitionMatStream,
  PublicCompetitionMatch,
} from "@/lib/supabase/types";
import { CompetitionTracker } from "./CompetitionTracker";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) return {};
  const { data } = await supabase
    .from("competitions")
    .select("title")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();
  return { title: data?.title };
}

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "competitions" });

  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: competitionData } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();

  if (!competitionData) notFound();
  const competition = competitionData as Competition;

  const [{ data: fightersData }, { data: matchesData }, { data: streamsData }] =
    await Promise.all([
      supabase
        .from("public_competition_fighters")
        .select("*")
        .eq("competition_id", id)
        .order("first_match_at", { ascending: true, nullsFirst: false })
        .order("display_name", { ascending: true }),
      supabase
        .from("public_competition_matches")
        .select("*")
        .eq("competition_id", id)
        .order("match_order", { ascending: true }),
      supabase
        .from("public_competition_mat_streams")
        .select("*")
        .eq("competition_id", id)
        .order("sort_order", { ascending: true })
        .order("mat_name", { ascending: true }),
    ]);

  return (
    <section className="container max-w-5xl py-16 md:py-20">
      <Link
        href="/competitions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="kicker">{t("kicker")}</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            {competition.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
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
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {competition.registration_url ? (
            <Button asChild variant="outline">
              <a
                href={competition.registration_url}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink />
                {t("registration")}
              </a>
            </Button>
          ) : null}
          {competition.bracket_url ? (
            <Button asChild>
              <a href={competition.bracket_url} target="_blank" rel="noreferrer">
                <ExternalLink />
                {t("smoothcomp")}
              </a>
            </Button>
          ) : null}
          {competition.team_url ? (
            <Button asChild variant="outline">
              <a href={competition.team_url} target="_blank" rel="noreferrer">
                <ExternalLink />
                {t("teamProfile")}
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      <CompetitionTracker
        competitionId={id}
        competitionTitle={competition.title}
        initialFighters={(fightersData ?? []) as PublicCompetitionFighter[]}
        initialMatches={(matchesData ?? []) as PublicCompetitionMatch[]}
        initialStreams={(streamsData ?? []) as PublicCompetitionMatStream[]}
      />
    </section>
  );
}
