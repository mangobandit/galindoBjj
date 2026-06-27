import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/Logo";

type ScheduleRow = {
  day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
  time: string;
  section: "kids" | "adults";
};

const SCHEDULE: ScheduleRow[] = [
  { day: "mon", time: "17:30 – 18:30", section: "kids" },
  { day: "mon", time: "19:30 – 21:00", section: "adults" },
  { day: "wed", time: "17:30 – 18:30", section: "kids" },
  { day: "wed", time: "19:30 – 21:00", section: "adults" },
  { day: "fri", time: "19:30 – 21:00", section: "adults" },
  { day: "sat", time: "11:00 – 12:30", section: "adults" },
];

export default function HomePage() {
  const t = useTranslations("home");
  const tc = useTranslations("common");

  return (
    <>
      {/* Hero — calm, logo-forward, not a marketing splash */}
      <section className="container flex flex-col items-center py-20 text-center md:py-28">
        <LogoMark className="size-24 md:size-28" />
        <p className="kicker mt-8">{t("hero.kicker")}</p>
        <h1 className="mt-3 max-w-2xl text-balance text-4xl font-bold leading-[1.05] sm:text-5xl">
          {t("hero.title")}
        </h1>
        <p className="mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
          {t("hero.subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/signup">
              {t("hero.ctaPrimary")}
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">{t("hero.ctaSecondary")}</Link>
          </Button>
        </div>
      </section>

      {/* What we train — clarifies it's only BJJ, Gi & No-Gi */}
      <section className="border-t border-border/70 bg-card/30">
        <div className="container py-14 md:py-16">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            {t("offer.title")}
          </h2>
          <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
            {(["gi", "nogi"] as const).map((k) => (
              <div
                key={k}
                className="rounded-lg border border-border bg-card p-6"
              >
                <h3 className="text-lg font-semibold">{t(`offer.${k}`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`offer.${k}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="container py-14 md:py-16">
        <p className="kicker">{t("schedule.kicker")}</p>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
          {t("schedule.title")}
        </h2>
        <div className="mt-7 overflow-hidden rounded-lg border border-border">
          <ul className="divide-y divide-border">
            {SCHEDULE.map((row, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-4 bg-card px-5 py-4"
              >
                <span className="w-28 font-medium">{tc(`days.${row.day}`)}</span>
                <span className="flex-1 tabular-nums text-muted-foreground">
                  {row.time}
                </span>
                <Badge variant={row.section === "kids" ? "outline" : "default"}>
                  {t(`schedule.${row.section}`)}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {t("schedule.note")}
        </p>
      </section>

      {/* Seminars — quiet pointer to one-off events */}
      <section className="border-t border-border/70 bg-card/30">
        <div className="container max-w-2xl py-14 text-center md:py-16">
          <p className="kicker">{t("seminars.kicker")}</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            {t("seminars.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            {t("seminars.body")}
          </p>
          <Button asChild variant="outline" className="mt-7">
            <Link href="/seminars">
              {t("seminars.cta")}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      {/* About the Professor — short and honest */}
      <section className="border-t border-border/70 bg-card/30">
        <div className="container max-w-2xl py-14 text-center md:py-16">
          <p className="kicker">{t("about.title")}</p>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            {t("about.body")}
          </p>
          <p className="mt-4 text-sm uppercase tracking-wider text-muted-foreground/80">
            {t("about.lineage")}
          </p>
        </div>
      </section>
    </>
  );
}
