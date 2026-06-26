"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Coach-friendly login: people type a username ("admin", "profe") and we map
// it to a real e-mail behind the scenes, because Supabase Auth logs in by
// e-mail. Create the Supabase users as <username>@galindobjj.es.
const LOGIN_DOMAIN = "galindobjj.es";

export function LoginForm() {
  const t = useTranslations("admin.login");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasSupabaseEnv()) {
      setError(t("notConfigured"));
      return;
    }

    // "admin" -> "admin@galindobjj.es" (already-typed e-mails pass through).
    const id = username.trim().toLowerCase();
    const email = id.includes("@") ? id : `${id}@${LOGIN_DOMAIN}`;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(t("error"));
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username">{t("username")}</Label>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          required
          placeholder={t("usernamePlaceholder")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? t("signingIn") : t("submit")}
      </Button>
    </form>
  );
}
