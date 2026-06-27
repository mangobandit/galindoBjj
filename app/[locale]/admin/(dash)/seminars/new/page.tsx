import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SeminarForm } from "../SeminarForm";

export default async function NewSeminarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.seminarForm" });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/admin/seminars"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("back")}
      </Link>
      <h1 className="text-2xl font-bold">{t("newTitle")}</h1>
      <SeminarForm />
    </div>
  );
}
