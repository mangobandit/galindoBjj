import { useTranslations } from "next-intl";
import { Mail, Phone, MapPin, Clock, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const t = useTranslations("contact");

  const items = [
    { Icon: Mail, label: t("emailLabel"), value: t("email"), href: `mailto:${t("email")}` },
    { Icon: Phone, label: t("phoneLabel"), value: t("phone"), href: `tel:${t("phone").replace(/\s+/g, "")}` },
    { Icon: MapPin, label: t("addressLabel"), value: t("address") },
    { Icon: Clock, label: t("hoursLabel"), value: t("hours") },
  ];

  return (
    <section className="container max-w-3xl py-16 md:py-24">
      <p className="kicker">{t("kicker")}</p>
      <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        {t("intro")}
      </p>

      <dl className="mt-10 grid gap-4 sm:grid-cols-2">
        {items.map(({ Icon, label, value, href }) => (
          <div
            key={label}
            className="flex items-start gap-4 rounded-lg border border-border bg-card p-5"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 font-medium">
                {href ? (
                  <a href={href} className="hover:text-primary">
                    {value}
                  </a>
                ) : (
                  value
                )}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-col items-start gap-4 rounded-lg border border-border bg-card/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">{t("note")}</p>
        <Button asChild>
          <Link href="/signup">
            {t("ctaSignup")}
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
