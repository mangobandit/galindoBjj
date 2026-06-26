import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-5 text-center">
      <p className="font-display text-6xl font-bold text-primary">404</p>
      <p className="text-muted-foreground">{t("footer.tagline")}</p>
      <Button asChild>
        <Link href="/">{t("nav.home")}</Link>
      </Button>
    </div>
  );
}
