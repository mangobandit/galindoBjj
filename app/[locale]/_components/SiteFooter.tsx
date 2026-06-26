import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  const t = useTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/70">
      <div className="container flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            {t("nav.home")}
          </Link>
          <Link href="/signup" className="hover:text-foreground">
            {t("nav.signup")}
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            {t("nav.contact")}
          </Link>
          <Link
            href="/admin/login"
            className="text-muted-foreground/70 hover:text-foreground"
          >
            {t("nav.admin")}
          </Link>
        </nav>
      </div>

      <div className="border-t border-border/50">
        <div className="container flex flex-col gap-1 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} Galindo BJJ. {t("footer.rights")}
          </span>
          <span>{t("footer.note")}</span>
        </div>
      </div>
    </footer>
  );
}
