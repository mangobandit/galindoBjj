import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users, Tag, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "../../../_components/LanguageSwitcher";
import { formatDateTime, formatEuros } from "@/lib/format";
import type { Seminar } from "@/lib/supabase/types";
import { SeminarSignupForm } from "./SeminarSignupForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) return {};
  const { data } = await supabase
    .from("seminars")
    .select("title")
    .eq("id", id)
    .maybeSingle();
  return { title: data?.title };
}

export default async function SeminarDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "seminars" });

  const supabase = await createClient();
  if (!supabase) notFound();

  const { data } = await supabase
    .from("seminars")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();

  if (!data) notFound();
  const seminar = data as Seminar;

  const details = [
    {
      Icon: CalendarDays,
      value: formatDateTime(seminar.starts_at, locale),
    },
    seminar.location
      ? { Icon: MapPin, value: seminar.location }
      : null,
    seminar.capacity != null
      ? { Icon: Users, value: t("limited", { count: seminar.capacity }) }
      : null,
    {
      Icon: Tag,
      value:
        seminar.price != null ? formatEuros(seminar.price, locale) : t("free"),
    },
  ].filter(Boolean) as { Icon: typeof CalendarDays; value: string }[];

  return (
    <section className="container max-w-2xl py-16 md:py-20">
      <Link
        href="/seminars"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Link>

      <p className="kicker mt-6">{t("kicker")}</p>
      <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{seminar.title}</h1>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {details.map(({ Icon, value }, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card/50 px-4 py-3 text-sm"
          >
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span>{value}</span>
          </div>
        ))}
      </div>

      {seminar.description ? (
        <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
          {seminar.description}
        </p>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">{t("signUpHeading")}</h2>
        <div className="inline-flex rounded-lg border border-border bg-card/50 px-3 py-2">
          <LanguageSwitcher withLabel />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-card p-6 md:p-8">
        <SeminarSignupForm seminarId={seminar.id} />
      </div>
    </section>
  );
}
