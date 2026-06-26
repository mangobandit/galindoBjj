"use client";

import { useActionState, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  saveMember,
  deleteMember,
  type SaveMemberState,
} from "../../actions";
import { SubmitButton } from "../../_components/SubmitButton";
import type { Member } from "@/lib/supabase/types";

const BELTS = [
  "Blanca",
  "Gris",
  "Amarilla",
  "Naranja",
  "Verde",
  "Azul",
  "Morada",
  "Marrón",
  "Negra",
];

const INITIAL: SaveMemberState = { status: "idle" };

export function MemberForm({ member }: { member?: Member }) {
  const t = useTranslations("admin.memberForm");
  const tc = useTranslations("common");
  const tm = useTranslations("admin.members");
  const tcommon = useTranslations("admin.common");
  const router = useRouter();
  const [section, setSection] = useState<"adults" | "kids">(
    member?.section ?? "adults",
  );
  const [state, formAction] = useActionState(saveMember, INITIAL);

  useEffect(() => {
    if (state.status === "success") {
      router.push("/admin/members");
      router.refresh();
    }
  }, [state.status, router]);

  const errorMessage =
    state.status === "error"
      ? state.error === "required"
        ? t("required")
        : state.error === "notConfigured"
          ? tcommon("notConfigured")
          : tcommon("saveError")
      : null;

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6">
        {member ? <input type="hidden" name="id" value={member.id} /> : null}

        <div className="space-y-2">
          <Label htmlFor="full_name">{t("fullName")}</Label>
          <Input
            id="full_name"
            name="full_name"
            required
            defaultValue={member?.full_name ?? ""}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="section">{t("section")}</Label>
            <Select
              id="section"
              name="section"
              value={section}
              onChange={(e) => setSection(e.target.value as "adults" | "kids")}
            >
              <option value="adults">{tm("adults")}</option>
              <option value="kids">{tm("kids")}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">{t("status")}</Label>
            <Select
              id="status"
              name="status"
              defaultValue={member?.status ?? "active"}
            >
              <option value="prospect">{tm("prospect")}</option>
              <option value="active">{tm("active")}</option>
              <option value="inactive">{tm("inactive")}</option>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input id="phone" name="phone" defaultValue={member?.phone ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={member?.email ?? ""}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="belt_rank">{t("belt")}</Label>
            <Input
              id="belt_rank"
              name="belt_rank"
              list="belts"
              defaultValue={member?.belt_rank ?? ""}
            />
            <datalist id="belts">
              {BELTS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language_pref">{t("language")}</Label>
            <Select
              id="language_pref"
              name="language_pref"
              defaultValue={member?.language_pref ?? "es"}
            >
              {routing.locales.map((loc) => (
                <option key={loc} value={loc}>
                  {tc(`languages.${loc}`)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_joined">{t("dateJoined")}</Label>
            <Input
              id="date_joined"
              name="date_joined"
              type="date"
              defaultValue={member?.date_joined ?? ""}
            />
          </div>
        </div>

        {section === "kids" ? (
          <fieldset className="space-y-4 rounded-lg border border-border bg-card/50 p-5">
            <legend className="px-1 text-sm font-medium text-muted-foreground">
              {t("kidsFields")}
            </legend>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="parent_name">{t("parentName")}</Label>
                <Input
                  id="parent_name"
                  name="parent_name"
                  defaultValue={member?.parent_name ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">{t("emergency")}</Label>
                <Input
                  id="emergency_contact"
                  name="emergency_contact"
                  defaultValue={member?.emergency_contact ?? ""}
                />
              </div>
            </div>
          </fieldset>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Textarea id="notes" name="notes" defaultValue={member?.notes ?? ""} />
        </div>

        {errorMessage ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <SubmitButton size="lg" pendingLabel={t("saving")}>
            {t("save")}
          </SubmitButton>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => router.push("/admin/members")}
          >
            {t("cancel")}
          </Button>
        </div>
      </form>

      {member ? (
        <form
          action={deleteMember}
          onSubmit={(e) => {
            if (!window.confirm(t("deleteConfirm"))) e.preventDefault();
          }}
          className="border-t border-border pt-6"
        >
          <input type="hidden" name="id" value={member.id} />
          <SubmitButton variant="destructive" size="sm">
            <Trash2 />
            {t("delete")}
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
