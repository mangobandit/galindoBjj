import { getTranslations } from "next-intl/server";
import { ExternalLink, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link, redirect } from "@/i18n/navigation";
import { AdminNav } from "../_components/AdminNav";
import { LogoutButton } from "../_components/LogoutButton";

// Auth + live data: never statically cache the dashboard. Applies to every
// route nested under this layout.
export const dynamic = "force-dynamic";

export default async function DashLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });

  const supabase = await createClient();

  // Not configured yet → show a calm setup notice instead of crashing.
  if (!supabase) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-5">
        <div className="max-w-md rounded-xl border border-border bg-card p-7 text-center">
          <Settings className="mx-auto size-8 text-muted-foreground" />
          <h1 className="mt-4 text-lg font-semibold">{t("nav.panel")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("common.notConfigured")}
          </p>
        </div>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/admin/login", locale });

  const { count: newSignups } = await supabase
    .from("signups")
    .select("id", { count: "exact", head: true })
    .eq("converted", false);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-card/40">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold tracking-tight">
              Galindo
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-primary">
              BJJ
            </span>
            <span className="ml-1 hidden text-sm text-muted-foreground sm:inline">
              · {t("nav.panel")}
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              <ExternalLink className="size-4" />
              {t("nav.viewSite")}
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="border-b border-border/70 bg-background">
        <div className="container py-3">
          <AdminNav newSignups={newSignups ?? 0} />
        </div>
      </div>

      <main className="container py-8">{children}</main>
    </div>
  );
}
