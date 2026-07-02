import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Crosshair, Radio } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/format";
import { SubmitButton } from "../../../../_components/SubmitButton";
import {
  setFighterResultQuick,
  setMatchResultQuick,
} from "../../../../actions";
import type {
  Competition,
  CompetitionFighter,
  CompetitionMatch,
  CompetitionResult,
  MatchResult,
} from "@/lib/supabase/types";

const matchOptions: MatchResult[] = ["win", "loss", "draw", "dq"];
const medalOptions: CompetitionResult[] = [
  "gold",
  "silver",
  "bronze",
  "no_medal",
];

function medalEmoji(result: CompetitionResult): string | null {
  if (result === "gold") return "🥇";
  if (result === "silver") return "🥈";
  if (result === "bronze") return "🥉";
  return null;
}

/** One tap = one saved result. Every button is its own tiny form. */
function MatchButtons({
  match,
  t,
  tf,
}: {
  match: CompetitionMatch;
  t: Awaited<ReturnType<typeof getTranslations>>;
  tf: Awaited<ReturnType<typeof getTranslations>>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {matchOptions.map((result) => (
        <form key={result} action={setMatchResultQuick} className="flex-1">
          <input type="hidden" name="id" value={match.id} />
          <input type="hidden" name="result" value={result} />
          <SubmitButton
            size="sm"
            variant={match.result === result ? "default" : "outline"}
            className="w-full min-h-11"
            pendingLabel="…"
          >
            {t(`results.${result}`)}
          </SubmitButton>
        </form>
      ))}
      {match.result !== "pending" ? (
        <form action={setMatchResultQuick}>
          <input type="hidden" name="id" value={match.id} />
          <input type="hidden" name="result" value="pending" />
          <SubmitButton size="sm" variant="ghost" pendingLabel="…">
            {tf("reset")}
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}

function MedalButtons({
  fighter,
  t,
  tf,
}: {
  fighter: CompetitionFighter;
  t: Awaited<ReturnType<typeof getTranslations>>;
  tf: Awaited<ReturnType<typeof getTranslations>>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {medalOptions.map((result) => {
        const emoji = medalEmoji(result);
        return (
          <form key={result} action={setFighterResultQuick} className="flex-1">
            <input type="hidden" name="id" value={fighter.id} />
            <input type="hidden" name="result" value={result} />
            <SubmitButton
              size="sm"
              variant={fighter.result === result ? "default" : "outline"}
              className="w-full min-h-11"
              pendingLabel="…"
            >
              {emoji ? <span>{emoji}</span> : null}
              {t(`results.${result}`)}
            </SubmitButton>
          </form>
        );
      })}
      {fighter.result !== "pending" ? (
        <form action={setFighterResultQuick}>
          <input type="hidden" name="id" value={fighter.id} />
          <input type="hidden" name="result" value="pending" />
          <SubmitButton size="sm" variant="ghost" pendingLabel="…">
            {tf("reset")}
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}

export default async function FocusModePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const tf = await getTranslations({ locale, namespace: "admin.focus" });
  const tFighter = await getTranslations({
    locale,
    namespace: "admin.competitionFighter",
  });
  const tMatch = await getTranslations({
    locale,
    namespace: "admin.competitionMatch",
  });

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: competitionData } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!competitionData) notFound();
  const competition = competitionData as Competition;

  const [{ data: fightersData }, { data: matchesData }] = await Promise.all([
    supabase
      .from("competition_fighters")
      .select("*")
      .eq("competition_id", id)
      .order("first_match_at", { ascending: true, nullsFirst: false })
      .order("full_name", { ascending: true }),
    supabase
      .from("competition_matches")
      .select("*")
      .order("match_order", { ascending: true }),
  ]);

  const fighters = (fightersData ?? []) as CompetitionFighter[];
  const allMatches = (matchesData ?? []) as CompetitionMatch[];
  const fighterIds = new Set(fighters.map((f) => f.id));
  const matchesByFighter = new Map<string, CompetitionMatch[]>();
  for (const match of allMatches) {
    if (!fighterIds.has(match.fighter_id)) continue;
    const next = matchesByFighter.get(match.fighter_id) ?? [];
    next.push(match);
    matchesByFighter.set(match.fighter_id, next);
  }

  // "Done" = final result set and no match still pending; everyone else is in
  // play, ordered by their next pending match so the top of the page is always
  // whoever steps on the mat next.
  const nextPendingTime = (fighter: CompetitionFighter): number => {
    const pending = (matchesByFighter.get(fighter.id) ?? [])
      .filter((m) => m.result === "pending" && m.scheduled_at)
      .map((m) => new Date(m.scheduled_at as string).getTime());
    if (pending.length) return Math.min(...pending);
    return fighter.first_match_at
      ? new Date(fighter.first_match_at).getTime()
      : Infinity;
  };
  const isDone = (fighter: CompetitionFighter) =>
    fighter.result !== "pending" &&
    (matchesByFighter.get(fighter.id) ?? []).every(
      (m) => m.result !== "pending",
    );

  const inPlay = fighters
    .filter((f) => !isDone(f))
    .sort((a, b) => nextPendingTime(a) - nextPendingTime(b));
  const done = fighters.filter(isDone);

  const FighterCard = ({ fighter }: { fighter: CompetitionFighter }) => {
    const log = matchesByFighter.get(fighter.id) ?? [];
    const medal = medalEmoji(fighter.result);
    return (
      <li className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold">
            {medal ? <span className="mr-1">{medal}</span> : null}
            {fighter.full_name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {fighter.mat ? (
              <Badge variant="outline">
                {tMatch("mat")} {fighter.mat}
              </Badge>
            ) : null}
            {fighter.first_match_at ? (
              <span className="tabular-nums">
                {formatTime(fighter.first_match_at, locale)}
              </span>
            ) : null}
          </div>
        </div>

        {log.length === 0 ? (
          <p className="text-sm text-muted-foreground">{tf("noMatches")}</p>
        ) : (
          <ol className="space-y-3">
            {log.map((match) => (
              <li
                key={match.id}
                className="space-y-2 rounded-lg bg-secondary/50 p-3"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {tMatch("matchNumber", { count: match.match_order })}
                  </span>
                  {match.scheduled_at ? (
                    <span className="tabular-nums">
                      {formatTime(match.scheduled_at, locale)}
                    </span>
                  ) : null}
                  {match.mat ? (
                    <span>
                      {tMatch("mat")} {match.mat}
                    </span>
                  ) : null}
                  {match.opponent ? (
                    <span className="min-w-0 flex-1 truncate">
                      {match.opponent}
                    </span>
                  ) : null}
                </div>
                <MatchButtons match={match} t={tMatch} tf={tf} />
              </li>
            ))}
          </ol>
        )}

        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {tf("finalResult")}
          </p>
          <MedalButtons fighter={fighter} t={tFighter} tf={tf} />
        </div>
      </li>
    );
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href={`/admin/competitions/${competition.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {tf("back")}
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <Crosshair className="size-5" />
          <h1 className="text-2xl font-bold">{tf("title")}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {competition.title} · {tf("subtitle")}
        </p>
      </div>

      {fighters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground">
          {tf("noFighters")}
        </div>
      ) : (
        <>
          {inPlay.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Radio className="size-4" />
                <h2 className="font-semibold">{tf("inPlay")}</h2>
                <Badge variant="muted">{inPlay.length}</Badge>
              </div>
              <ul className="space-y-4">
                {inPlay.map((fighter) => (
                  <FighterCard key={fighter.id} fighter={fighter} />
                ))}
              </ul>
            </section>
          ) : null}

          {done.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-semibold text-muted-foreground">
                {tf("done")}
              </h2>
              <ul className="space-y-4">
                {done.map((fighter) => (
                  <FighterCard key={fighter.id} fighter={fighter} />
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
