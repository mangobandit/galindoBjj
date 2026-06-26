import { defineRouting } from "next-intl/routing";

/**
 * Public site is Spanish-first. The default locale (es) is served at the
 * root with no prefix (galindobjj.es), other locales are prefixed
 * (galindobjj.es/en, /de, /it). The admin dashboard lives under the same
 * locale tree and defaults to Spanish.
 */
export const routing = defineRouting({
  locales: ["es", "en", "de", "it"],
  defaultLocale: "es",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
