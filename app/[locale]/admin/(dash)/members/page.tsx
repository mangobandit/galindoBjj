import { getTranslations } from "next-intl/server";
import { FilterX, Mail, Pencil, Phone, Plus, Search, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatBeltRank } from "@/lib/belts";
import { formatDate } from "@/lib/format";
import { activateMember } from "../../actions";
import { SubmitButton } from "../../_components/SubmitButton";
import { AdminMetric, PageHeader } from "../../_components/AdminMetric";
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
  const tc = await getTranslations({ locale, namespace: "common" });

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
  const activeCount = members.filter((m) => m.status === "active").length;
  const prospectCount = members.filter((m) => m.status === "prospect").length;
  const kidsCount = members.filter((m) => m.section === "kids").length;
  const adultsCount = members.filter((m) => m.section === "adults").length;
  const hasFilters = Boolean(q) || section !== "all" || status !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        action={
          <Button asChild>
          <Link href="/admin/members/new">
            <Plus />
            {t("new")}
          </Link>
        </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetric
          label={t("count", { count: members.length })}
          value={members.length}
          Icon={Users}
        />
        <AdminMetric label={t("active")} value={activeCount} tone="quiet" />
        <AdminMetric label={t("prospect")} value={prospectCount} tone="quiet" />
        <AdminMetric
          label={`${t("kids")} / ${t("adults")}`}
          value={`${kidsCount} / ${adultsCount}`}
          tone="quiet"
        />
      </div>

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
        {hasFilters ? (
          <Button asChild variant="ghost" className="sm:col-start-4">
            <Link href="/admin/members">
              <FilterX />
              {t("all")}
            </Link>
          </Button>
        ) : null}
      </form>

      {members.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground">
          <Users className="size-8" />
          <span>{t("empty")}</span>
        </div>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.id}
              className="grid gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/40 sm:grid-cols-[1fr_auto]"
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
                  <Badge variant="muted">
                    {tc(`languages.${m.language_pref}`)}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                  {m.belt_rank ? (
                    <span>
                      {t("belt")}: {formatBeltRank(m.belt_rank, locale)}
                    </span>
                  ) : null}
                  <span>
                    {t("joined")} {formatDate(m.date_joined, locale)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {m.phone ? (
                  <Button asChild variant="ghost" size="icon" aria-label={m.phone}>
                    <a href={`tel:${m.phone.replace(/\s+/g, "")}`}>
                      <Phone />
                    </a>
                  </Button>
                ) : null}
                {m.email ? (
                  <Button asChild variant="ghost" size="icon" aria-label={m.email}>
                    <a href={`mailto:${m.email}`}>
                      <Mail />
                    </a>
                  </Button>
                ) : null}
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
