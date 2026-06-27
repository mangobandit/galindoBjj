"use client";

import { useActionState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  saveSeminar,
  deleteSeminar,
  type SaveSeminarState,
} from "../../actions";
import { SubmitButton } from "../../_components/SubmitButton";
import type { Seminar } from "@/lib/supabase/types";

const INITIAL: SaveSeminarState = { status: "idle" };

/** ISO timestamp → "YYYY-MM-DDTHH:mm" for <input type="datetime-local">. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function SeminarForm({ seminar }: { seminar?: Seminar }) {
  const t = useTranslations("admin.seminarForm");
  const tcommon = useTranslations("admin.common");
  const router = useRouter();
  const [state, formAction] = useActionState(saveSeminar, INITIAL);

  useEffect(() => {
    if (state.status === "success") {
      router.push("/admin/seminars");
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
        {seminar ? <input type="hidden" name="id" value={seminar.id} /> : null}

        <div className="space-y-2">
          <Label htmlFor="title">{t("title")}</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={seminar?.title ?? ""}
            placeholder={t("titlePlaceholder")}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="starts_at">{t("startsAt")}</Label>
            <Input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              required
              defaultValue={
                seminar ? toLocalInput(seminar.starts_at) : ""
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" optional={t("optional")}>
              {t("location")}
            </Label>
            <Input
              id="location"
              name="location"
              defaultValue={seminar?.location ?? ""}
              placeholder={t("locationPlaceholder")}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="capacity" optional={t("optional")}>
              {t("capacity")}
            </Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              inputMode="numeric"
              defaultValue={seminar?.capacity ?? ""}
              placeholder={t("capacityPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price" optional={t("optional")}>
              {t("price")}
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              defaultValue={seminar?.price ?? ""}
              placeholder={t("pricePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="published">{t("visibility")}</Label>
            <Select
              id="published"
              name="published"
              defaultValue={seminar && !seminar.published ? "0" : "1"}
            >
              <option value="1">{t("published")}</option>
              <option value="0">{t("draft")}</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" optional={t("optional")}>
            {t("description")}
          </Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={seminar?.description ?? ""}
            placeholder={t("descriptionPlaceholder")}
          />
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
            onClick={() => router.push("/admin/seminars")}
          >
            {t("cancel")}
          </Button>
        </div>
      </form>

      {seminar ? (
        <form
          action={deleteSeminar}
          onSubmit={(e) => {
            if (!window.confirm(t("deleteConfirm"))) e.preventDefault();
          }}
          className="border-t border-border pt-6"
        >
          <input type="hidden" name="id" value={seminar.id} />
          <SubmitButton variant="destructive" size="sm">
            <Trash2 />
            {t("delete")}
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
