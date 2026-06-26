import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "../../_components/LanguageSwitcher";
import { SignupForm } from "./SignupForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "signup" });
  return { title: t("title") };
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "signup" });

  return (
    <section className="container max-w-2xl py-16 md:py-20">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="kicker">{t("kicker")}</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{t("title")}</h1>
        </div>
      </div>
      <p className="max-w-xl text-lg text-muted-foreground">{t("intro")}</p>

      {/* Prominent language switcher so non-Spanish speakers feel at home. */}
      <div className="mt-6 inline-flex rounded-lg border border-border bg-card/50 px-4 py-2.5">
        <LanguageSwitcher withLabel />
      </div>

      <div className="mt-10 rounded-xl border border-border bg-card p-6 md:p-8">
        <SignupForm />
      </div>
    </section>
  );
}
