import { useTranslations } from "next-intl";
import { Dumbbell, HeartHandshake, Users, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container grid gap-10 py-20 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-28">
          <div className="space-y-6">
            <p className="kicker">{t("hero.kicker")}</p>
            <h1 className="text-balance text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="max-w-xl text-pretty text-lg text-muted-foreground">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
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
          </div>

          <div className="relative hidden md:block">
            <div className="aspect-[4/5] w-full rounded-xl border border-border bg-gradient-to-br from-secondary to-card p-1 shadow-2xl">
              <div className="flex h-full w-full items-center justify-center rounded-lg border border-border/60 bg-[radial-gradient(circle_at_50%_30%,hsl(8_72%_50%/0.18),transparent_60%)]">
                <span className="font-display text-7xl font-bold tracking-tight text-foreground/90">
                  柔術
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About the Professor */}
      <section className="border-t border-border/70 bg-card/40">
        <div className="container grid gap-8 py-16 md:grid-cols-[0.8fr_1.2fr] md:py-20">
          <div>
            <p className="kicker">{t("about.kicker")}</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              {t("about.title")}
            </h2>
          </div>
          <div className="space-y-4 text-pretty text-muted-foreground">
            <p className="text-lg leading-relaxed">{t("about.body1")}</p>
            <p className="leading-relaxed">{t("about.body2")}</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container py-16 md:py-20">
        <h2 className="text-2xl font-bold sm:text-3xl">{t("values.title")}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            { key: "technique", Icon: Dumbbell },
            { key: "community", Icon: HeartHandshake },
            { key: "everyone", Icon: Users },
          ].map(({ key, Icon }) => (
            <div
              key={key}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex size-11 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                {t(`values.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`values.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Schedule */}
      <section className="border-t border-border/70 bg-card/40">
        <div className="container py-16 md:py-20">
          <p className="kicker">{t("schedule.kicker")}</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            {t("schedule.title")}
          </h2>
          <div className="mt-8 overflow-hidden rounded-lg border border-border">
            <ul className="divide-y divide-border">
              {SCHEDULE.map((row, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-4 bg-card px-5 py-4"
                >
                  <span className="w-28 font-medium">
                    {tc(`days.${row.day}`)}
                  </span>
                  <span className="flex-1 tabular-nums text-muted-foreground">
                    {row.time}
                  </span>
                  <Badge
                    variant={row.section === "kids" ? "primary" : "default"}
                  >
                    {t(`schedule.${row.section}`)}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("schedule.note")}
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-16 md:py-24">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-secondary px-6 py-12 text-center md:px-12 md:py-16">
          <div className="mx-auto max-w-2xl space-y-4">
            <h2 className="text-3xl font-bold sm:text-4xl">
              {t("finalCta.title")}
            </h2>
            <p className="text-pretty text-lg text-muted-foreground">
              {t("finalCta.body")}
            </p>
            <div className="pt-2">
              <Button asChild size="lg">
                <Link href="/signup">
                  {t("finalCta.button")}
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
