import { getTranslations } from "next-intl/server";
import { Plus, Search, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { activateMember } from "../../actions";
import { SubmitButton } from "../../_components/SubmitButton";
import type { Member, MemberStatus, Section } from "@/lib/supabase/types";

function statusVariant(status: MemberStatus) {
  if (status === "active") return "success" as const;
  if (status === "prospect") return "warning" as const;
  return "muted" as const;
}

export default async function MembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; section?: string; status?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "admin.members" });

  const supabase = await createClient();
  if (!supabase) return null;

  const q = (sp.q ?? "").trim();
  const section = sp.section ?? "all";
  const status = sp.status ?? "all";

  let query = supabase.from("members").select("*").order("full_name");
  if (q) query = query.ilike("full_name", `%${q}%`);
  if (section === "kids" || section === "adults") {
    query = query.eq("section", section as Section);
  }
  if (status === "prospect" || status === "active" || status === "inactive") {
    query = query.eq("status", status as MemberStatus);
  }
  const { data } = await query;
  const members = (data ?? []) as Member[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/admin/members/new">
            <Plus />
            {t("new")}
          </Link>
        </Button>
      </div>

      {/* Search + filters (server-driven GET form) */}
      <form className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <Select
          name="section"
          defaultValue={section}
          aria-label={t("filterSection")}
          className="sm:w-40"
        >
          <option value="all">{t("all")}</option>
          <option value="kids">{t("kids")}</option>
          <option value="adults">{t("adults")}</option>
        </Select>
        <Select
          name="status"
          defaultValue={status}
          aria-label={t("filterStatus")}
          className="sm:w-40"
        >
          <option value="all">{t("all")}</option>
          <option value="prospect">{t("prospect")}</option>
          <option value="active">{t("active")}</option>
          <option value="inactive">{t("inactive")}</option>
        </Select>
        <Button type="submit" variant="secondary">
          <Search />
          <span className="sm:hidden">{t("searchPlaceholder")}</span>
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {t("count", { count: members.length })}
      </p>

      {members.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{m.full_name}</span>
                  <Badge variant={m.section === "kids" ? "primary" : "outline"}>
                    {m.section === "kids" ? t("kids") : t("adults")}
                  </Badge>
                  <Badge variant={statusVariant(m.status)}>
                    {t(m.status)}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                  {m.belt_rank ? (
                    <span>
                      {t("belt")}: {m.belt_rank}
                    </span>
                  ) : null}
                  <span>
                    {t("joined")} {formatDate(m.date_joined, locale)}
                  </span>
                  {m.phone ? <span>{m.phone}</span> : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {m.status === "prospect" ? (
                  <form action={activateMember}>
                    <input type="hidden" name="id" value={m.id} />
                    <SubmitButton variant="success" size="sm">
                      {t("activate")}
                    </SubmitButton>
                  </form>
                ) : null}
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/members/${m.id}`}>
                    <Pencil />
                    {t("edit")}
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
