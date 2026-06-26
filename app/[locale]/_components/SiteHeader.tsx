import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function SiteHeader() {
  const t = useTranslations("common");

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            Galindo
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-primary">
            BJJ
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <Link
            href="/"
            className="transition-colors hover:text-foreground"
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/contact"
            className="transition-colors hover:text-foreground"
          >
            {t("nav.contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/signup">{t("nav.signup")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
