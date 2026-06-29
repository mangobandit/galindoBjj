import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Medal,
  Shield,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime } from "@/lib/format";
import type {
  Competition,
  CompetitionRegistrationStatus,
  CompetitionResult,
  MatchResult,
  PublicCompetitionFighter,
  PublicCompetitionMatStream,
  PublicCompetitionMatch,
} from "@/lib/supabase/types";

type StreamActivity = {
  id: string;
  title: string;
  time: string | null;
  detail: string | null;
};

function normalizeMat(mat: string | null | undefined): string {
  return (mat ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function registrationVariant(status: CompetitionRegistrationStatus) {
  if (status === "confirmed") return "success" as const;
  if (status === "registered") return "outline" as const;
  if (status === "withdrawn") return "warning" as const;
  return "muted" as const;
}

function resultVariant(result: CompetitionResult | MatchResult) {
  if (result === "gold" || result === "win") return "success" as const;
  if (result === "silver" || result === "bronze" || result === "draw") {
    return "outline" as const;
  }
  if (result === "loss" || result === "dq" || result === "withdrawn") {
    return "warning" as const;
  }
  return "muted" as const;
}

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

  const fighters = (fightersData ?? []) as PublicCompetitionFighter[];
  const matches = (matchesData ?? []) as PublicCompetitionMatch[];
  const matStreams = (streamsData ?? []) as PublicCompetitionMatStream[];
  const matchesByFighter = new Map<string, PublicCompetitionMatch[]>();
  for (const match of matches) {
    const next = matchesByFighter.get(match.fighter_id) ?? [];
    next.push(match);
    matchesByFighter.set(match.fighter_id, next);
  }
  const streamByMat = new Map(
    matStreams.map((stream) => [normalizeMat(stream.mat_name), stream]),
  );
  const fighterById = new Map(fighters.map((fighter) => [fighter.id, fighter]));
  const activityByMat = new Map<string, StreamActivity[]>();
  for (const fighter of fighters) {
    const key = normalizeMat(fighter.mat);
    if (!key) continue;
    const next = activityByMat.get(key) ?? [];
    next.push({
      id: `fighter-${fighter.id}`,
      title: fighter.display_name,
      time: fighter.first_match_at,
      detail: fighter.division,
    });
    activityByMat.set(key, next);
  }
  for (const match of matches) {
    const key = normalizeMat(match.mat);
    if (!key) continue;
    const fighter = fighterById.get(match.fighter_id);
    const next = activityByMat.get(key) ?? [];
    next.push({
      id: `match-${match.id}`,
      title: fighter?.display_name ?? `#${match.match_order}`,
      time: match.scheduled_at,
      detail: match.round ?? (match.opponent ? match.opponent : null),
    });
    activityByMat.set(key, next);
  }
  for (const activity of activityByMat.values()) {
    activity.sort((a, b) => {
      if (!a.time && !b.time) return a.title.localeCompare(b.title);
      if (!a.time) return 1;
      if (!b.time) return -1;
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    });
  }

  const scheduled = fighters.filter((fighter) => fighter.first_match_at).length;
  const medals = fighters.filter((fighter) =>
    ["gold", "silver", "bronze"].includes(fighter.result),
  ).length;

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

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <Users className="size-5 text-muted-foreground" />
          <div className="mt-3 text-3xl font-bold tabular-nums">
            {fighters.length}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("fighters")}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <Clock className="size-5 text-muted-foreground" />
          <div className="mt-3 text-3xl font-bold tabular-nums">
            {scheduled}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("firstMatch")}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <Medal className="size-5 text-muted-foreground" />
          <div className="mt-3 text-3xl font-bold tabular-nums">{medals}</div>
          <p className="mt-1 text-sm text-muted-foreground">{t("medals")}</p>
        </div>
      </div>

      {matStreams.length > 0 ? (
        <section className="mt-10 space-y-4">
          <div className="flex items-center gap-2">
            <Video className="size-5" />
            <h2 className="text-2xl font-bold">{t("liveStreams")}</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {matStreams.map((stream) => {
              const activity = activityByMat.get(normalizeMat(stream.mat_name)) ?? [];
              return (
                <div
                  key={stream.id}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{stream.mat_name}</h3>
                      {stream.stream_label ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {stream.stream_label}
                        </p>
                      ) : null}
                    </div>
                    <Button asChild size="sm">
                      <a href={stream.stream_url} target="_blank" rel="noreferrer">
                        <ExternalLink />
                        {t("watchLive")}
                      </a>
                    </Button>
                  </div>
                  {stream.notes ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {stream.notes}
                    </p>
                  ) : null}
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      {t("matSchedule")}
                    </p>
                    {activity.length === 0 ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t("noMatAssignments")}
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2 text-sm">
                        {activity.slice(0, 4).map((item) => (
                          <li
                            key={item.id}
                            className="flex items-start justify-between gap-3 rounded-md bg-secondary/50 p-2"
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-medium">
                                {item.title}
                              </span>
                              {item.detail ? (
                                <span className="block truncate text-muted-foreground">
                                  {item.detail}
                                </span>
                              ) : null}
                            </span>
                            <span className="shrink-0 text-muted-foreground">
                              {item.time ? formatDateTime(item.time, locale) : t("timeTbd")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="mt-10 flex items-center gap-2">
        <Trophy className="size-5" />
        <h2 className="text-2xl font-bold">{t("fighters")}</h2>
      </div>

      {fighters.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
          {t("noFighters")}
        </div>
      ) : (
        <ul className="mt-5 grid gap-4 lg:grid-cols-2">
          {fighters.map((fighter) => {
            const fighterMatches = matchesByFighter.get(fighter.id) ?? [];
            const fighterStream = fighter.mat
              ? streamByMat.get(normalizeMat(fighter.mat))
              : null;
            return (
              <li
                key={fighter.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold">{fighter.display_name}</h3>
                      {fighter.is_minor ? (
                        <Badge variant="primary">
                          <Shield className="size-3" />
                          {t("privateMinor")}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {fighter.team}
                    </p>
                  </div>
                  <Badge variant={resultVariant(fighter.result)}>
                    {t(`results.${fighter.result}`)}
                  </Badge>
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-md bg-secondary/50 p-3">
                    <dt className="text-muted-foreground">{t("division")}</dt>
                    <dd className="mt-1 font-medium">
                      {fighter.division ?? t("divisionTbd")}
                    </dd>
                  </div>
                  <div className="rounded-md bg-secondary/50 p-3">
                    <dt className="text-muted-foreground">{t("firstMatch")}</dt>
                    <dd className="mt-1 font-medium">
                      {fighter.first_match_at
                        ? formatDateTime(fighter.first_match_at, locale)
                        : t("timeTbd")}
                    </dd>
                  </div>
                  <div className="rounded-md bg-secondary/50 p-3">
                    <dt className="text-muted-foreground">{t("weight")}</dt>
                    <dd className="mt-1 font-medium">
                      {fighter.weight_class ?? "—"}
                    </dd>
                  </div>
                  <div className="rounded-md bg-secondary/50 p-3">
                    <dt className="text-muted-foreground">{t("status")}</dt>
                    <dd className="mt-1 font-medium">
                      <Badge variant={registrationVariant(fighter.registration_status)}>
                        {t(`registrationStatus.${fighter.registration_status}`)}
                      </Badge>
                    </dd>
                  </div>
                </dl>

                {fighter.mat || fighter.public_notes ? (
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {fighter.mat ? (
                      <p>
                        {t("mat")}:{" "}
                        <span className="text-foreground">{fighter.mat}</span>
                      </p>
                    ) : null}
                    {fighter.public_notes ? (
                      <p className="whitespace-pre-line">{fighter.public_notes}</p>
                    ) : null}
                  </div>
                ) : null}

                {fighterStream ? (
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <a
                      href={fighterStream.stream_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Video />
                      {t("watchMat", { mat: fighterStream.mat_name })}
                    </a>
                  </Button>
                ) : null}

                <div className="mt-5 border-t border-border pt-4">
                  <h4 className="font-semibold">{t("matchLogs")}</h4>
                  {fighterMatches.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t("noMatches")}
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {fighterMatches.map((match) => {
                        const matchStream = match.mat
                          ? streamByMat.get(normalizeMat(match.mat))
                          : null;
                        return (
                          <li
                            key={match.id}
                            className="rounded-md border border-border bg-background p-3 text-sm"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={resultVariant(match.result)}>
                                {t(`results.${match.result}`)}
                              </Badge>
                              <span className="font-medium">
                                #{match.match_order}
                              </span>
                              {match.round ? <span>{match.round}</span> : null}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                              {match.scheduled_at ? (
                                <span>{formatDateTime(match.scheduled_at, locale)}</span>
                              ) : null}
                              {match.mat ? <span>{t("mat")}: {match.mat}</span> : null}
                              {match.opponent ? <span>{match.opponent}</span> : null}
                              {match.method ? <span>{match.method}</span> : null}
                              {match.score ? <span>{match.score}</span> : null}
                            </div>
                            {matchStream ? (
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="mt-2 px-0"
                              >
                                <a
                                  href={matchStream.stream_url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Video />
                                  {t("watchLive")}
                                </a>
                              </Button>
                            ) : null}
                            {match.notes ? (
                              <p className="mt-2 whitespace-pre-line text-muted-foreground">
                                {match.notes}
                              </p>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
