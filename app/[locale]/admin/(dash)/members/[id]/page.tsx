import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { MemberForm } from "../MemberForm";
import type { Member } from "@/lib/supabase/types";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "admin.memberForm" });

  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const member = data as Member;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/admin/members"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("back")}
      </Link>
      <h1 className="text-2xl font-bold">{t("editTitle")}</h1>
      <MemberForm member={member} />
    </div>
  );
}
