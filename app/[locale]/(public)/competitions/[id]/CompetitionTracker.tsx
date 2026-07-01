"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Clock,
  ExternalLink,
  Medal,
  Radio,
  Search,
  Share2,
  Swords,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { formatDateTime } from "@/lib/format";
import type {
  CompetitionRegistrationStatus,
  CompetitionResult,
  MatchResult,
  PublicCompetitionFighter,
  PublicCompetitionMatStream,
  PublicCompetitionMatch,
} from "@/lib/supabase/types";

// Poll the public views instead of opening Realtime on the base tables: the
// base tables carry coach-only columns and anon has no row policy on them, so
// a short poll of the already-public views is both simpler and safe.
const POLL_MS = 20_000;
const TICK_MS = 30_000;
// A fighter counts as "live" from their first-match time until this long after.
const LIVE_WINDOW_MS = 45 * 60 * 1000;

type Props = {
  competitionId: string;
  competitionTitle: string;
  initialFighters: PublicCompetitionFighter[];
  initialMatches: PublicCompetitionMatch[];
  initialStreams: PublicCompetitionMatStream[];
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

function medalEmoji(result: CompetitionResult): string | null {
  if (result === "gold") return "🥇";
  if (result === "silver") return "🥈";
  if (result === "bronze") return "🥉";
  return null;
}

function useRelativeTime(locale: string) {
  return useMemo(
    () => new Intl.RelativeTimeFormat(locale, { numeric: "auto" }),
    [locale],
  );
}

function relLabel(
  rtf: Intl.RelativeTimeFormat,
  targetMs: number,
  nowMs: number,
): string {
  const diff = targetMs - nowMs;
  const abs = Math.abs(diff);
  if (abs < 60_000) return rtf.format(Math.round(diff / 1_000), "second");
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), "minute");
  if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), "hour");
  return rtf.format(Math.round(diff / 86_400_000), "day");
}

export function CompetitionTracker({
  competitionId,
  competitionTitle,
  initialFighters,
  initialMatches,
  initialStreams,
}: Props) {
  const t = useTranslations("competitions");
  const locale = useLocale();
  const rtf = useRelativeTime(locale);

  const [fighters, setFighters] = useState(initialFighters);
  const [matches, setMatches] = useState(initialMatches);
  const [streams] = useState(initialStreams);
  const [now, setNow] = useState(() => Date.now());
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [section, setSection] = useState<"all" | "adults" | "kids">("all");
  const [result, setResult] = useState<"all" | "medals" | "pending">("all");
  const [sort, setSort] = useState<"time" | "name" | "result">("time");

  // A wall clock that advances so countdowns and the "live now" window move on
  // their own, even between data polls.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Live polling of the public views. Skips work while the tab is hidden and
  // refetches immediately when the visitor returns.
  useEffect(() => {
    if (!hasSupabaseEnv()) return;
    const supabase = createClient();
    let cancelled = false;

    const sync = async () => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "hidden"
      ) {
        return;
      }
      const [{ data: f }, { data: m }] = await Promise.all([
        supabase
          .from("public_competition_fighters")
          .select("*")
          .eq("competition_id", competitionId)
          .order("first_match_at", { ascending: true, nullsFirst: false })
          .order("display_name", { ascending: true }),
        supabase
          .from("public_competition_matches")
          .select("*")
          .eq("competition_id", competitionId)
          .order("match_order", { ascending: true }),
      ]);
      if (cancelled) return;
      if (f) setFighters(f as PublicCompetitionFighter[]);
      if (m) setMatches(m as PublicCompetitionMatch[]);
      setLastSync(Date.now());
    };

    const id = setInterval(sync, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    void sync();

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [competitionId]);

  const matchesByFighter = useMemo(() => {
    const map = new Map<string, PublicCompetitionMatch[]>();
    for (const match of matches) {
      const next = map.get(match.fighter_id) ?? [];
      next.push(match);
      map.set(match.fighter_id, next);
    }
    return map;
  }, [matches]);

  const fighterById = useMemo(
    () => new Map(fighters.map((f) => [f.id, f])),
    [fighters],
  );

  const streamByMat = useMemo(
    () => new Map(streams.map((s) => [normalizeMat(s.mat_name), s])),
    [streams],
  );

  const stats = useMemo(() => {
    const scheduled = fighters.filter((f) => f.first_match_at).length;
    const gold = fighters.filter((f) => f.result === "gold").length;
    const silver = fighters.filter((f) => f.result === "silver").length;
    const bronze = fighters.filter((f) => f.result === "bronze").length;
    const wins = matches.filter((m) => m.result === "win").length;
    const decided = matches.filter(
      (m) => m.result === "win" || m.result === "loss",
    ).length;
    return {
      total: fighters.length,
      scheduled,
      gold,
      silver,
      bronze,
      medals: gold + silver + bronze,
      wins,
      matchCount: matches.length,
      winRate: decided ? Math.round((wins / decided) * 100) : null,
    };
  }, [fighters, matches]);

  const { liveNow, upNext } = useMemo(() => {
    const withTime = fighters.filter((f) => f.first_match_at);
    const ts = (f: PublicCompetitionFighter) =>
      new Date(f.first_match_at as string).getTime();
    const live = withTime
      .filter(
        (f) =>
          f.result === "pending" &&
          ts(f) <= now &&
          ts(f) >= now - LIVE_WINDOW_MS,
      )
      .sort((a, b) => ts(a) - ts(b));
    const next = withTime
      .filter((f) => ts(f) > now)
      .sort((a, b) => ts(a) - ts(b))
      .slice(0, 4);
    return { liveNow: live, upNext: next };
  }, [fighters, now]);

  const podium = useMemo(
    () =>
      (["gold", "silver", "bronze"] as const).map((rank) => ({
        rank,
        fighters: fighters.filter((f) => f.result === rank),
      })),
    [fighters],
  );

  const activityByMat = useMemo(() => {
    const map = new Map<
      string,
      { id: string; title: string; time: string | null; detail: string | null }[]
    >();
    for (const f of fighters) {
      const key = normalizeMat(f.mat);
      if (!key) continue;
      const next = map.get(key) ?? [];
      next.push({
        id: `fighter-${f.id}`,
        title: f.display_name,
        time: f.first_match_at,
        detail: f.division,
      });
      map.set(key, next);
    }
    for (const m of matches) {
      const key = normalizeMat(m.mat);
      if (!key) continue;
      const next = map.get(key) ?? [];
      next.push({
        id: `match-${m.id}`,
        title: fighterById.get(m.fighter_id)?.display_name ?? `#${m.match_order}`,
        time: m.scheduled_at,
        detail: m.round ?? m.opponent ?? null,
      });
      map.set(key, next);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        if (!a.time && !b.time) return a.title.localeCompare(b.title);
        if (!a.time) return 1;
        if (!b.time) return -1;
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      });
    }
    return map;
  }, [fighters, matches, fighterById]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rank: Record<string, number> = {
      gold: 0,
      silver: 1,
      bronze: 2,
      no_medal: 3,
      withdrawn: 4,
      pending: 5,
    };
    let list = fighters.filter((f) => {
      if (
        q &&
        !f.display_name.toLowerCase().includes(q) &&
        !(f.division ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
      if (section === "kids" && !f.is_minor) return false;
      if (section === "adults" && f.is_minor) return false;
      if (result === "medals" && !["gold", "silver", "bronze"].includes(f.result))
        return false;
      if (result === "pending" && f.result !== "pending") return false;
      return true;
    });
    list = list.slice().sort((a, b) => {
      if (sort === "name") return a.display_name.localeCompare(b.display_name);
      if (sort === "result")
        return (rank[a.result] ?? 9) - (rank[b.result] ?? 9);
      const at = a.first_match_at ? new Date(a.first_match_at).getTime() : Infinity;
      const bt = b.first_match_at ? new Date(b.first_match_at).getTime() : Infinity;
      return at - bt;
    });
    return list;
  }, [fighters, query, section, result, sort]);

  const onShare = async (f: PublicCompetitionFighter) => {
    const url =
      typeof window !== "undefined" ? window.location.href : "";
    const medal = medalEmoji(f.result);
    const text = `${medal ? `${medal} ` : ""}${f.display_name} — ${competitionTitle}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: f.display_name, text, url });
      } catch {
        /* user dismissed the share sheet */
      }
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} ${url}`.trim());
      setCopied(f.id);
      setTimeout(() => setCopied((c) => (c === f.id ? null : c)), 2_000);
    }
  };

  return (
    <div>
      {/* Live status line */}
      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground/60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-foreground" />
        </span>
        <span className="font-medium text-foreground">{t("autoUpdating")}</span>
        {lastSync ? (
          <span aria-live="polite">
            · {t("updated")} {relLabel(rtf, lastSync, now)}
          </span>
        ) : null}
      </div>

      {/* Stats */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <Users className="size-5 text-muted-foreground" />
          <div className="mt-3 text-3xl font-bold tabular-nums">
            {stats.total}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("fighters")}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <Clock className="size-5 text-muted-foreground" />
          <div className="mt-3 text-3xl font-bold tabular-nums">
            {stats.scheduled}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("upcoming")}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <Medal className="size-5 text-muted-foreground" />
          <div className="mt-3 text-3xl font-bold tabular-nums">
            {stats.medals}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("medals")}
            {stats.medals > 0 ? (
              <span className="ml-1 whitespace-nowrap">
                · 🥇{stats.gold} 🥈{stats.silver} 🥉{stats.bronze}
              </span>
            ) : null}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <Swords className="size-5 text-muted-foreground" />
          <div className="mt-3 text-3xl font-bold tabular-nums">
            {stats.winRate == null ? "—" : `${stats.winRate}%`}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("winRate")}
            {stats.matchCount > 0 ? (
              <span className="ml-1">
                · {stats.wins}/{stats.matchCount} {t("wins")}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {/* Live now / up next */}
      {liveNow.length > 0 || upNext.length > 0 ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {liveNow.length > 0 ? (
            <div className="rounded-xl border border-foreground bg-card p-5">
              <div className="flex items-center gap-2">
                <Radio className="size-5" />
                <h2 className="text-lg font-bold">{t("liveNow")}</h2>
              </div>
              <ul className="mt-3 space-y-2">
                {liveNow.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between gap-3 rounded-md bg-secondary/60 p-2.5 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {f.display_name}
                      </span>
                      {f.division ? (
                        <span className="block truncate text-muted-foreground">
                          {f.division}
                        </span>
                      ) : null}
                    </span>
                    {f.mat ? <Badge variant="success">{f.mat}</Badge> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {upNext.length > 0 ? (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Clock className="size-5" />
                <h2 className="text-lg font-bold">{t("upNext")}</h2>
              </div>
              <ul className="mt-3 space-y-2">
                {upNext.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between gap-3 rounded-md bg-secondary/50 p-2.5 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {f.display_name}
                      </span>
                      {f.mat ? (
                        <span className="block truncate text-muted-foreground">
                          {t("mat")} {f.mat}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-right text-muted-foreground">
                      {relLabel(rtf, new Date(f.first_match_at as string).getTime(), now)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Podium */}
      {stats.medals > 0 ? (
        <section className="mt-10">
          <div className="flex items-center gap-2">
            <Medal className="size-5" />
            <h2 className="text-2xl font-bold">{t("podium")}</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {podium.map(({ rank, fighters: winners }) =>
              winners.length === 0 ? null : (
                <div
                  key={rank}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="text-2xl">{medalEmoji(rank)}</div>
                  <p className="mt-1 text-xs font-medium uppercase text-muted-foreground">
                    {t(`results.${rank}`)}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {winners.map((f) => (
                      <li key={f.id} className="text-sm font-semibold">
                        {f.display_name}
                        {f.division ? (
                          <span className="block text-xs font-normal text-muted-foreground">
                            {f.division}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        </section>
      ) : null}

      {/* Mat streams */}
      {streams.length > 0 ? (
        <section className="mt-10 space-y-4">
          <div className="flex items-center gap-2">
            <Video className="size-5" />
            <h2 className="text-2xl font-bold">{t("liveStreams")}</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {streams.map((stream) => {
              const activity =
                activityByMat.get(normalizeMat(stream.mat_name)) ?? [];
              return (
                <div
                  key={stream.id}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {stream.mat_name}
                      </h3>
                      {stream.stream_label ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {stream.stream_label}
                        </p>
                      ) : null}
                    </div>
                    <Button asChild size="sm">
                      <a
                        href={stream.stream_url}
                        target="_blank"
                        rel="noreferrer"
                      >
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
                              {item.time
                                ? formatDateTime(item.time, locale)
                                : t("timeTbd")}
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

      {/* Fighters + filters */}
      <div className="mt-10 flex items-center gap-2">
        <Trophy className="size-5" />
        <h2 className="text-2xl font-bold">{t("fighters")}</h2>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            aria-label={t("searchPlaceholder")}
          />
        </div>
        <Select
          value={section}
          onChange={(e) =>
            setSection(e.target.value as "all" | "adults" | "kids")
          }
          aria-label={t("allSections")}
        >
          <option value="all">{t("allSections")}</option>
          <option value="adults">{t("adults")}</option>
          <option value="kids">{t("kids")}</option>
        </Select>
        <Select
          value={result}
          onChange={(e) =>
            setResult(e.target.value as "all" | "medals" | "pending")
          }
          aria-label={t("allResults")}
        >
          <option value="all">{t("allResults")}</option>
          <option value="medals">{t("onlyMedals")}</option>
          <option value="pending">{t("onlyPending")}</option>
        </Select>
        <Select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as "time" | "name" | "result")
          }
          aria-label={t("sortTime")}
        >
          <option value="time">{t("sortTime")}</option>
          <option value="name">{t("sortName")}</option>
          <option value="result">{t("sortResult")}</option>
        </Select>
      </div>

      {visible.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
          {fighters.length === 0 ? t("noFighters") : t("noResultsFilter")}
        </div>
      ) : (
        <ul className="mt-5 grid gap-4 lg:grid-cols-2">
          {visible.map((fighter) => {
            const fighterStream = fighter.mat
              ? streamByMat.get(normalizeMat(fighter.mat))
              : null;
            const log = matchesByFighter.get(fighter.id) ?? [];
            const medal = medalEmoji(fighter.result);
            return (
              <li
                key={fighter.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold">
                        {medal ? <span className="mr-1">{medal}</span> : null}
                        {fighter.display_name}
                      </h3>
                      {fighter.belt_rank ? (
                        <Badge variant="muted">{fighter.belt_rank}</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {fighter.team}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={resultVariant(fighter.result)}>
                      {t(`results.${fighter.result}`)}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onShare(fighter)}
                      aria-label={t("share")}
                    >
                      <Share2 />
                      {copied === fighter.id ? t("linkCopied") : t("share")}
                    </Button>
                  </div>
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
                      <Badge
                        variant={registrationVariant(
                          fighter.registration_status,
                        )}
                      >
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
                      <p className="whitespace-pre-line">
                        {fighter.public_notes}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {log.length > 0 ? (
                  <div className="mt-5 border-t border-border pt-4">
                    <h4 className="font-semibold">{t("matchLogs")}</h4>
                    <ol className="mt-3 space-y-2">
                      {log.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-start justify-between gap-3 rounded-md bg-secondary/50 p-2.5 text-sm"
                        >
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-2">
                              <Badge variant={resultVariant(m.result)}>
                                {t(`results.${m.result}`)}
                              </Badge>
                              {m.round ? (
                                <span className="text-muted-foreground">
                                  {m.round}
                                </span>
                              ) : null}
                            </span>
                            {m.opponent ? (
                              <span className="mt-1 block truncate">
                                {t("versus")} {m.opponent}
                              </span>
                            ) : null}
                            {m.method || m.score ? (
                              <span className="mt-0.5 block truncate text-muted-foreground">
                                {[m.method, m.score].filter(Boolean).join(" · ")}
                              </span>
                            ) : null}
                          </span>
                          {m.scheduled_at ? (
                            <span className="shrink-0 text-muted-foreground">
                              {formatDateTime(m.scheduled_at, locale)}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                <div className="mt-5 border-t border-border pt-4">
                  <h4 className="font-semibold">{t("livestream")}</h4>
                  {fighterStream ? (
                    <Button asChild variant="outline" size="sm" className="mt-3">
                      <a
                        href={fighterStream.stream_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Video />
                        {t("watchMat", { mat: fighterStream.mat_name })}
                      </a>
                    </Button>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t("noStreamYet")}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
