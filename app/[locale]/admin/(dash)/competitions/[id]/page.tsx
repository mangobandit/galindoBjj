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
  Trash2,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatBeltRank } from "@/lib/belts";
import { AdminMetric, PageHeader } from "../../../_components/AdminMetric";
import { SubmitButton } from "../../../_components/SubmitButton";
import {
  deleteCompetitionFighter,
  deleteCompetitionMatch,
  saveCompetitionFighter,
  saveCompetitionMatch,
} from "../../../actions";
import { CompetitionForm } from "../CompetitionForm";
import type {
  Competition,
  CompetitionFighter,
  CompetitionGiNogi,
  CompetitionMatch,
  CompetitionPaymentStatus,
  CompetitionRegistrationStatus,
  CompetitionResult,
  CompetitionWeighInStatus,
  MatchResult,
  Member,
} from "@/lib/supabase/types";

const registrationStatuses: CompetitionRegistrationStatus[] = [
  "needs_signup",
  "registered",
  "confirmed",
  "withdrawn",
];
const paymentStatuses: CompetitionPaymentStatus[] = ["unknown", "unpaid", "paid"];
const weighInStatuses: CompetitionWeighInStatus[] = ["unknown", "pending", "done"];
const resultStatuses: CompetitionResult[] = [
  "pending",
  "gold",
  "silver",
  "bronze",
  "no_medal",
  "withdrawn",
];
const matchResults: MatchResult[] = ["pending", "win", "loss", "draw", "dq"];
const giNogiOptions: CompetitionGiNogi[] = ["both", "gi", "nogi"];

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
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

function registrationVariant(status: CompetitionRegistrationStatus) {
  if (status === "confirmed") return "success" as const;
  if (status === "registered") return "outline" as const;
  if (status === "withdrawn") return "warning" as const;
  return "muted" as const;
}

function MemberSelect({
  members,
  defaultValue,
  fieldId,
  label,
  emptyLabel,
  optionalLabel,
}: {
  members: Member[];
  defaultValue?: string | null;
  fieldId: string;
  label: string;
  emptyLabel: string;
  optionalLabel: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} optional={optionalLabel}>
        {label}
      </Label>
      <Select
        id={fieldId}
        name="member_id"
        defaultValue={defaultValue ?? ""}
      >
        <option value="">{emptyLabel}</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.full_name}
          </option>
        ))}
      </Select>
    </div>
  );
}

function FighterFields({
  fighter,
  members,
  t,
  locale,
}: {
  fighter?: CompetitionFighter;
  members: Member[];
  t: Awaited<ReturnType<typeof getTranslations>>;
  locale: string;
}) {
  const id = fighter?.id ?? "new";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`full-name-${id}`}>{t("fullName")}</Label>
          <Input
            id={`full-name-${id}`}
            name="full_name"
            required
            defaultValue={fighter?.full_name ?? ""}
            placeholder={t("fullNamePlaceholder")}
          />
        </div>
        <MemberSelect
          members={members}
          defaultValue={fighter?.member_id}
          fieldId={`member-${id}`}
          label={t("linkedMember")}
          emptyLabel={t("noMember")}
          optionalLabel={t("optional")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`team-${id}`}>{t("team")}</Label>
          <Input
            id={`team-${id}`}
            name="team"
            defaultValue={fighter?.team ?? "Fusion Galindo Jiu-Jitsu"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`minor-${id}`}>{t("minor")}</Label>
          <Select
            id={`minor-${id}`}
            name="is_minor"
            defaultValue={fighter?.is_minor ? "1" : "0"}
          >
            <option value="0">{t("adultPublic")}</option>
            <option value="1">{t("minorPrivate")}</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`age-${id}`} optional={t("optional")}>
            {t("ageGroup")}
          </Label>
          <Input
            id={`age-${id}`}
            name="age_group"
            defaultValue={fighter?.age_group ?? ""}
            placeholder="Adult, Master 1, Juvenil..."
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor={`belt-${id}`} optional={t("optional")}>
            {t("belt")}
          </Label>
          <Input
            id={`belt-${id}`}
            name="belt_rank"
            defaultValue={fighter?.belt_rank ?? ""}
            placeholder="Blue belt 2nd degree"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`division-${id}`} optional={t("optional")}>
            {t("division")}
          </Label>
          <Input
            id={`division-${id}`}
            name="division"
            defaultValue={fighter?.division ?? ""}
            placeholder="Adult / Blue / Middle"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`weight-${id}`} optional={t("optional")}>
            {t("weightClass")}
          </Label>
          <Input
            id={`weight-${id}`}
            name="weight_class"
            defaultValue={fighter?.weight_class ?? ""}
            placeholder="-82.3 kg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`gi-nogi-${id}`}>{t("giNogi")}</Label>
          <Select
            id={`gi-nogi-${id}`}
            name="gi_nogi"
            defaultValue={fighter?.gi_nogi ?? "both"}
          >
            {giNogiOptions.map((option) => (
              <option key={option} value={option}>
                {t(`giNogiOptions.${option}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor={`registration-${id}`}>{t("registrationStatus")}</Label>
          <Select
            id={`registration-${id}`}
            name="registration_status"
            defaultValue={fighter?.registration_status ?? "needs_signup"}
          >
            {registrationStatuses.map((status) => (
              <option key={status} value={status}>
                {t(`registration.${status}`)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`payment-${id}`}>{t("paymentStatus")}</Label>
          <Select
            id={`payment-${id}`}
            name="payment_status"
            defaultValue={fighter?.payment_status ?? "unknown"}
          >
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {t(`payment.${status}`)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`weigh-${id}`}>{t("weighInStatus")}</Label>
          <Select
            id={`weigh-${id}`}
            name="weigh_in_status"
            defaultValue={fighter?.weigh_in_status ?? "unknown"}
          >
            {weighInStatuses.map((status) => (
              <option key={status} value={status}>
                {t(`weighIn.${status}`)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`result-${id}`}>{t("result")}</Label>
          <Select
            id={`result-${id}`}
            name="result"
            defaultValue={fighter?.result ?? "pending"}
          >
            {resultStatuses.map((status) => (
              <option key={status} value={status}>
                {t(`results.${status}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor={`first-match-${id}`} optional={t("optional")}>
            {t("firstMatchAt")}
          </Label>
          <Input
            id={`first-match-${id}`}
            name="first_match_at"
            type="datetime-local"
            defaultValue={toLocalInput(fighter?.first_match_at ?? null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`mat-${id}`} optional={t("optional")}>
            {t("mat")}
          </Label>
          <Input id={`mat-${id}`} name="mat" defaultValue={fighter?.mat ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`placement-${id}`} optional={t("optional")}>
            {t("placement")}
          </Label>
          <Input
            id={`placement-${id}`}
            name="placement"
            type="number"
            min="1"
            defaultValue={fighter?.placement ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`fighter-bracket-${id}`} optional={t("optional")}>
            {t("bracketUrl")}
          </Label>
          <Input
            id={`fighter-bracket-${id}`}
            name="bracket_url"
            type="url"
            defaultValue={fighter?.bracket_url ?? ""}
            placeholder="https://smoothcomp.com/..."
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`public-notes-${id}`} optional={t("optional")}>
            {t("publicNotes")}
          </Label>
          <Textarea
            id={`public-notes-${id}`}
            name="public_notes"
            rows={3}
            defaultValue={fighter?.public_notes ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`coach-notes-${id}`} optional={t("optional")}>
            {t("coachNotes")}
          </Label>
          <Textarea
            id={`coach-notes-${id}`}
            name="coach_notes"
            rows={3}
            defaultValue={fighter?.coach_notes ?? ""}
          />
        </div>
      </div>

      {fighter?.belt_rank ? (
        <p className="text-xs text-muted-foreground">
          {t("formattedBelt")}: {formatBeltRank(fighter.belt_rank, locale)}
        </p>
      ) : null}
    </>
  );
}

function MatchForm({
  fighterId,
  competitionId,
  match,
  t,
}: {
  fighterId: string;
  competitionId: string;
  match?: CompetitionMatch;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const id = match?.id ?? `new-${fighterId}`;

  return (
    <form
      action={saveCompetitionMatch}
      className="grid gap-3 rounded-md border border-border bg-background p-3 lg:grid-cols-[5rem_1fr_10rem_9rem_9rem_9rem_1fr_auto]"
    >
      <input type="hidden" name="fighter_id" value={fighterId} />
      <input type="hidden" name="competition_id" value={competitionId} />
      {match ? <input type="hidden" name="id" value={match.id} /> : null}

      <div className="space-y-1">
        <Label htmlFor={`order-${id}`}>{t("order")}</Label>
        <Input
          id={`order-${id}`}
          name="match_order"
          type="number"
          min="1"
          defaultValue={match?.match_order ?? ""}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`opponent-${id}`} optional={t("optional")}>
          {t("opponent")}
        </Label>
        <Input
          id={`opponent-${id}`}
          name="opponent"
          defaultValue={match?.opponent ?? ""}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`match-time-${id}`} optional={t("optional")}>
          {t("scheduledAt")}
        </Label>
        <Input
          id={`match-time-${id}`}
          name="scheduled_at"
          type="datetime-local"
          defaultValue={toLocalInput(match?.scheduled_at ?? null)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`match-mat-${id}`} optional={t("optional")}>
          {t("mat")}
        </Label>
        <Input id={`match-mat-${id}`} name="mat" defaultValue={match?.mat ?? ""} />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`round-${id}`} optional={t("optional")}>
          {t("round")}
        </Label>
        <Input id={`round-${id}`} name="round" defaultValue={match?.round ?? ""} />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`match-result-${id}`}>{t("result")}</Label>
        <Select
          id={`match-result-${id}`}
          name="result"
          defaultValue={match?.result ?? "pending"}
        >
          {matchResults.map((result) => (
            <option key={result} value={result}>
              {t(`results.${result}`)}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:block lg:space-y-1">
        <div className="space-y-1">
          <Label htmlFor={`method-${id}`} optional={t("optional")}>
            {t("method")}
          </Label>
          <Input
            id={`method-${id}`}
            name="method"
            defaultValue={match?.method ?? ""}
          />
        </div>
        <div className="space-y-1 lg:mt-3">
          <Label htmlFor={`score-${id}`} optional={t("optional")}>
            {t("score")}
          </Label>
          <Input
            id={`score-${id}`}
            name="score"
            defaultValue={match?.score ?? ""}
          />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <SubmitButton size="sm" pendingLabel={t("saving")}>
          {match ? t("save") : t("add")}
        </SubmitButton>
      </div>

      <div className="lg:col-span-full">
        <Label htmlFor={`match-notes-${id}`} optional={t("optional")}>
          {t("notes")}
        </Label>
        <Textarea
          id={`match-notes-${id}`}
          name="notes"
          rows={2}
          defaultValue={match?.notes ?? ""}
        />
      </div>
    </form>
  );
}

export default async function AdminCompetitionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "admin.competitions" });
  const tf = await getTranslations({ locale, namespace: "admin.competitionFighter" });
  const tm = await getTranslations({ locale, namespace: "admin.competitionMatch" });
  const formT = await getTranslations({ locale, namespace: "admin.competitionForm" });

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: competitionData } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!competitionData) notFound();
  const competition = competitionData as Competition;

  const [{ data: fightersData }, { data: matchesData }, { data: membersData }] =
    await Promise.all([
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
      supabase.from("members").select("*").order("full_name", { ascending: true }),
    ]);

  const fighters = (fightersData ?? []) as CompetitionFighter[];
  const matches = (matchesData ?? []) as CompetitionMatch[];
  const members = (membersData ?? []) as Member[];
  const matchesByFighter = new Map<string, CompetitionMatch[]>();
  for (const match of matches) {
    const next = matchesByFighter.get(match.fighter_id) ?? [];
    next.push(match);
    matchesByFighter.set(match.fighter_id, next);
  }

  const needsSignup = fighters.filter(
    (fighter) => fighter.registration_status === "needs_signup",
  ).length;
  const confirmed = fighters.filter(
    (fighter) => fighter.registration_status === "confirmed",
  ).length;
  const scheduled = fighters.filter((fighter) => fighter.first_match_at).length;
  const medals = fighters.filter((fighter) =>
    ["gold", "silver", "bronze"].includes(fighter.result),
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/competitions"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {formT("back")}
        </Link>
      </div>

      <PageHeader
        title={competition.title}
        subtitle={competition.notes}
        meta={
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
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
        }
        action={
          competition.bracket_url ? (
            <Button asChild variant="outline">
              <a href={competition.bracket_url} target="_blank" rel="noreferrer">
                <ExternalLink />
                {t("smoothcomp")}
              </a>
            </Button>
          ) : null
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetric label={t("fighters")} value={fighters.length} Icon={Users} />
        <AdminMetric
          label={t("needsSignup")}
          value={needsSignup}
          Icon={UserCheck}
          tone={needsSignup > 0 ? "urgent" : "quiet"}
        />
        <AdminMetric
          label={t("scheduled", { count: scheduled })}
          value={scheduled}
          Icon={Clock}
          tone="quiet"
        />
        <AdminMetric
          label={t("medals", { count: medals })}
          value={`${medals} / ${confirmed}`}
          Icon={Medal}
          tone="quiet"
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="size-5" />
          <h2 className="text-lg font-semibold">{tf("addTitle")}</h2>
        </div>
        <form
          action={saveCompetitionFighter}
          className="space-y-4 rounded-lg border border-border bg-card p-5"
        >
          <input type="hidden" name="competition_id" value={competition.id} />
          <FighterFields members={members} t={tf} locale={locale} />
          <SubmitButton pendingLabel={tf("saving")}>{tf("add")}</SubmitButton>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="size-5" />
          <h2 className="text-lg font-semibold">{tf("heading")}</h2>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-medium tabular-nums text-secondary-foreground">
            {fighters.length}
          </span>
        </div>

        {fighters.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground">
            {tf("empty")}
          </div>
        ) : (
          <ul className="space-y-5">
            {fighters.map((fighter) => {
              const fighterMatches = matchesByFighter.get(fighter.id) ?? [];
              return (
                <li
                  key={fighter.id}
                  className="space-y-5 rounded-lg border border-border bg-card p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{fighter.full_name}</h3>
                        {fighter.is_minor ? (
                          <Badge variant="primary">
                            <Shield className="size-3" />
                            {tf("minorBadge")}
                          </Badge>
                        ) : null}
                        <Badge variant={registrationVariant(fighter.registration_status)}>
                          {tf(`registration.${fighter.registration_status}`)}
                        </Badge>
                        <Badge variant={resultVariant(fighter.result)}>
                          {tf(`results.${fighter.result}`)}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{fighter.team}</span>
                        {fighter.division ? <span>{fighter.division}</span> : null}
                        {fighter.first_match_at ? (
                          <span>
                            {tf("firstMatchAt")}:{" "}
                            {formatDateTime(fighter.first_match_at, locale)}
                          </span>
                        ) : null}
                        {fighter.mat ? <span>{tf("mat")}: {fighter.mat}</span> : null}
                      </div>
                    </div>

                    {fighter.bracket_url ? (
                      <Button asChild variant="ghost" size="sm">
                        <a
                          href={fighter.bracket_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink />
                          {tf("bracket")}
                        </a>
                      </Button>
                    ) : null}
                  </div>

                  <form action={saveCompetitionFighter} className="space-y-4">
                    <input type="hidden" name="id" value={fighter.id} />
                    <input
                      type="hidden"
                      name="competition_id"
                      value={competition.id}
                    />
                    <FighterFields
                      fighter={fighter}
                      members={members}
                      t={tf}
                      locale={locale}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <SubmitButton size="sm" pendingLabel={tf("saving")}>
                        {tf("save")}
                      </SubmitButton>
                    </div>
                  </form>

                  <form action={deleteCompetitionFighter}>
                    <input type="hidden" name="id" value={fighter.id} />
                    <SubmitButton variant="ghost" size="sm">
                      <Trash2 />
                      {tf("delete")}
                    </SubmitButton>
                  </form>

                  <div className="space-y-3 border-t border-border pt-5">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <h4 className="font-semibold">{tm("heading")}</h4>
                      <Badge variant="muted">{fighterMatches.length}</Badge>
                    </div>

                    {fighterMatches.map((match) => (
                      <div key={match.id} className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant={resultVariant(match.result)}>
                            {tm(`results.${match.result}`)}
                          </Badge>
                          <span>{tm("matchNumber", { count: match.match_order })}</span>
                          {match.scheduled_at ? (
                            <span>{formatDateTime(match.scheduled_at, locale)}</span>
                          ) : null}
                          {match.opponent ? <span>{match.opponent}</span> : null}
                        </div>
                        <MatchForm
                          fighterId={fighter.id}
                          competitionId={competition.id}
                          match={match}
                          t={tm}
                        />
                        <form action={deleteCompetitionMatch}>
                          <input type="hidden" name="id" value={match.id} />
                          <SubmitButton variant="ghost" size="sm">
                            <Trash2 />
                            {tm("delete")}
                          </SubmitButton>
                        </form>
                      </div>
                    ))}

                    <MatchForm
                      fighterId={fighter.id}
                      competitionId={competition.id}
                      t={tm}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">{t("editDetails")}</h2>
        <div className="max-w-2xl">
          <CompetitionForm competition={competition} />
        </div>
      </section>
    </div>
  );
}
