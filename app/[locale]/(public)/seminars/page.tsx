import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "../../_components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatEuros } from "@/lib/format";
import type { Seminar } from "@/lib/supabase/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seminars" });
  return { title: t("title") };
}

export default async function SeminarsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seminars" });

  const supabase = await createClient();
  // Only future, published seminars — RLS already restricts anon to published.
  const { data } = supabase
    ? await supabase
        .from("seminars")
        .select("*")
        .eq("published", true)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
    : { data: [] as Seminar[] };

  const seminars = (data ?? []) as Seminar[];

  return (
    <section className="container max-w-2xl py-16 md:py-20">
      <div className="mb-2">
        <p className="kicker">{t("kicker")}</p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{t("title")}</h1>
      </div>
      <p className="max-w-xl text-lg text-muted-foreground">{t("intro")}</p>

      <div className="mt-6 inline-flex rounded-lg border border-border bg-card/50 px-4 py-2.5">
        <LanguageSwitcher withLabel />
      </div>

      {seminars.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
          <CalendarDays className="size-8" />
          {t("empty")}
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {seminars.map((s) => (
            <li
              key={s.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              {s.poster_url ? (
                <div className="relative aspect-[4/3] border-b border-border bg-background">
                  <Image
                    src={s.poster_url}
                    alt={s.title}
                    fill
                    sizes="(min-width: 768px) 42rem, 100vw"
                    className="object-contain"
                  />
                </div>
              ) : null}

              <div className="p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-xl font-bold">{s.title}</h2>
                  {s.price != null ? (
                    <Badge variant="outline">{formatEuros(s.price, locale)}</Badge>
                  ) : (
                    <Badge variant="muted">{t("free")}</Badge>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
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
                </div>

                {s.description ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                ) : null}

                <Button asChild className="mt-5">
                  <Link href={`/seminars/${s.id}`}>
                    {t("attend")}
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
