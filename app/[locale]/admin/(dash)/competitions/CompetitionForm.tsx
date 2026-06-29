"use client";

import { useActionState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SMOOTHCOMP_TEAM_URL } from "@/lib/competition-team";
import {
  deleteCompetition,
  saveCompetition,
  type SaveCompetitionState,
} from "../../actions";
import { SubmitButton } from "../../_components/SubmitButton";
import type { Competition } from "@/lib/supabase/types";

const INITIAL: SaveCompetitionState = { status: "idle" };

function toDateInput(date: string | null | undefined): string {
  return date ? date.slice(0, 10) : "";
}

export function CompetitionForm({ competition }: { competition?: Competition }) {
  const t = useTranslations("admin.competitionForm");
  const tcommon = useTranslations("admin.common");
  const locale = useLocale();
  const router = useRouter();
  const [state, formAction] = useActionState(saveCompetition, INITIAL);

  useEffect(() => {
    if (state.status === "success" && state.id) {
      router.push(`/admin/competitions/${state.id}`);
      router.refresh();
    }
  }, [router, state.id, state.status]);

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
        {competition ? (
          <input type="hidden" name="id" value={competition.id} />
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="title">{t("title")}</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={competition?.title ?? ""}
            placeholder={t("titlePlaceholder")}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="starts_on">{t("startsOn")}</Label>
            <Input
              id="starts_on"
              name="starts_on"
              type="date"
              required
              defaultValue={toDateInput(competition?.starts_on)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ends_on" optional={t("optional")}>
              {t("endsOn")}
            </Label>
            <Input
              id="ends_on"
              name="ends_on"
              type="date"
              defaultValue={toDateInput(competition?.ends_on)}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="organizer" optional={t("optional")}>
              {t("organizer")}
            </Label>
            <Input
              id="organizer"
              name="organizer"
              defaultValue={competition?.organizer ?? ""}
              placeholder={t("organizerPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" optional={t("optional")}>
              {t("location")}
            </Label>
            <Input
              id="location"
              name="location"
              defaultValue={competition?.location ?? ""}
              placeholder={t("locationPlaceholder")}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="registration_url" optional={t("optional")}>
              {t("registrationUrl")}
            </Label>
            <Input
              id="registration_url"
              name="registration_url"
              type="url"
              defaultValue={competition?.registration_url ?? ""}
              placeholder="https://smoothcomp.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bracket_url" optional={t("optional")}>
              {t("bracketUrl")}
            </Label>
            <Input
              id="bracket_url"
              name="bracket_url"
              type="url"
              defaultValue={competition?.bracket_url ?? ""}
              placeholder="https://smoothcomp.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team_url" optional={t("optional")}>
              {t("teamUrl")}
            </Label>
            <Input
              id="team_url"
              name="team_url"
              type="url"
              defaultValue={competition?.team_url ?? SMOOTHCOMP_TEAM_URL}
              placeholder="https://smoothcomp.com/en/club/..."
            />
          </div>
        </div>

        <div className="space-y-2 sm:max-w-xs">
          <Label htmlFor="published">{t("visibility")}</Label>
          <Select
            id="published"
            name="published"
            defaultValue={competition && !competition.published ? "0" : "1"}
          >
            <option value="1">{t("published")}</option>
            <option value="0">{t("draft")}</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" optional={t("optional")}>
            {t("notes")}
          </Label>
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={competition?.notes ?? ""}
            placeholder={t("notesPlaceholder")}
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
            onClick={() => router.push("/admin/competitions")}
          >
            {t("cancel")}
          </Button>
        </div>
      </form>

      {competition ? (
        <form
          action={deleteCompetition}
          onSubmit={(event) => {
            if (!window.confirm(t("deleteConfirm"))) event.preventDefault();
          }}
          className="border-t border-border pt-6"
        >
          <input type="hidden" name="id" value={competition.id} />
          <input type="hidden" name="locale" value={locale} />
          <SubmitButton variant="destructive" size="sm">
            <Trash2 />
            {t("delete")}
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
