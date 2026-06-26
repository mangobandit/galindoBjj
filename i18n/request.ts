import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";
import esMessages from "../messages/es.json";

type Messages = typeof esMessages;

/** Deep-merge locale messages over the Spanish base. */
function mergeMessages(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = out[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      baseValue &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      out[key] = mergeMessages(
        baseValue as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else {
      out[key] = value;
    }
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  // The public site is fully translated in every locale. The admin dashboard
  // is Spanish-first: any keys missing from a non-default locale fall back to
  // Spanish, so new admin locales can be added incrementally later.
  let messages = esMessages as Messages;
  if (locale !== routing.defaultLocale) {
    const localeMessages = (await import(`../messages/${locale}.json`)).default;
    messages = mergeMessages(
      esMessages as Record<string, unknown>,
      localeMessages,
    ) as Messages;
  }

  return { locale, messages };
});
