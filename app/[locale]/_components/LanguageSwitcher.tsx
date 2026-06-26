"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
  withLabel = false,
}: {
  className?: string;
  withLabel?: boolean;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onChange(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next as Locale });
    });
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Globe
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
      {withLabel ? (
        <span className="text-sm text-muted-foreground">
          {t("languageLabel")}
        </span>
      ) : null}
      <Select
        aria-label={t("languageLabel")}
        value={locale}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-auto min-w-[7.5rem] pr-8 text-sm"
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {t(`languages.${loc}`)}
          </option>
        ))}
      </Select>
    </div>
  );
}
