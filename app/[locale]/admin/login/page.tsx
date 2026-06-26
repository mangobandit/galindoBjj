import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link, redirect } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { LoginForm } from "../_components/LoginForm";

// Reads the auth cookie to skip the form when already signed in.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.login" });
  return { title: t("title") };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.login" });
  const tn = await getTranslations({ locale, namespace: "admin.nav" });

  // Already signed in? Skip straight to the dashboard.
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect({ href: "/admin", locale });
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Galindo Jiu-Jitsu">
            <Logo markClassName="size-11" />
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-7 shadow-lg">
          <h1 className="text-xl font-semibold">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {tn("viewSite")}
          </Link>
        </div>
      </div>
    </div>
  );
}
