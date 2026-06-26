"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const t = useTranslations("admin.nav");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onLogout() {
    startTransition(async () => {
      if (hasSupabaseEnv()) {
        await createClient().auth.signOut();
      }
      router.replace("/admin/login");
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onLogout}
      disabled={isPending}
      className="text-muted-foreground"
    >
      <LogOut className="size-4" />
      <span className="hidden sm:inline">{t("logout")}</span>
    </Button>
  );
}
