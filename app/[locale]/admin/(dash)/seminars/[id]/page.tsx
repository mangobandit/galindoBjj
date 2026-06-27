import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Globe,
  MessageSquare,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import type { Seminar, SeminarSignup } from "@/lib/supabase/types";
import { removeAttendee } from "../../../actions";
import { SubmitButton } from "../../../_components/SubmitButton";
import { SeminarForm } from "../SeminarForm";

export default async function AdminSeminarDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "admin.seminars" });
  const tf = await getTranslations({ locale, namespace: "admin.seminarForm" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: seminarData } = await supabase
    .from("seminars")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!seminarData) notFound();
  const seminar = seminarData as Seminar;

  const { data: attendeeData } = await supabase
    .from("seminar_signups")
    .select("*")
    .eq("seminar_id", id)
    .order("created_at", { ascending: true });

  const attendees = (attendeeData ?? []) as SeminarSignup[];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/admin/seminars"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {tf("back")}
        </Link>
        <h1 className="mt-4 text-2xl font-bold">{seminar.title}</h1>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {formatDateTime(seminar.starts_at, locale)}
          </span>
          {seminar.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" />
              {seminar.location}
            </span>
          ) : null}
        </div>
      </div>

      {/* Attendee list — the whole point: who's coming. */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="size-5" />
          <h2 className="text-lg font-semibold">{t("attendees")}</h2>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-medium tabular-nums text-secondary-foreground">
            {seminar.capacity != null
              ? t("attendingOf", { going: attendees.length, cap: seminar.capacity })
              : attendees.length}
          </span>
        </div>

        {attendees.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-8 text-center text-muted-foreground">
            {t("noAttendees")}
          </div>
        ) : (
          <ul className="space-y-2">
            {attendees.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{a.name}</span>
                      {a.belt_rank ? (
                        <Badge variant="outline">{a.belt_rank}</Badge>
                      ) : null}
                      <Badge variant="muted">
                        <Globe className="size-3" />
                        {tc(`languages.${a.language}`)}
                      </Badge>
                    </div>
                    <a
                      href={
                        a.contact.includes("@")
                          ? `mailto:${a.contact}`
                          : `tel:${a.contact.replace(/\s+/g, "")}`
                      }
                      className="mt-1 inline-block text-sm text-primary hover:underline"
                    >
                      {a.contact}
                    </a>
                  </div>
                  <form
                    action={removeAttendee}
                    className="shrink-0"
                  >
                    <input type="hidden" name="id" value={a.id} />
                    <SubmitButton
                      variant="ghost"
                      size="sm"
                      aria-label={t("remove")}
                    >
                      <X />
                    </SubmitButton>
                  </form>
                </div>
                {a.message ? (
                  <p className="mt-2 flex gap-2 rounded-md bg-secondary/50 p-3 text-sm text-foreground">
                    <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    {a.message}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Edit the seminar details */}
      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">{t("editDetails")}</h2>
        <SeminarForm seminar={seminar} />
      </section>
    </div>
  );
}
