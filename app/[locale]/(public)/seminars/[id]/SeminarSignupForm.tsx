"use client";

import { useActionState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  submitSeminarSignup,
  type SeminarSignupState,
} from "../actions";

const INITIAL: SeminarSignupState = { status: "idle" };

export function SeminarSignupForm({ seminarId }: { seminarId: string }) {
  const t = useTranslations("seminars");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(
    submitSeminarSignup,
    INITIAL,
  );

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-foreground" />
        <h2 className="mt-4 text-2xl font-bold">{t("success.title")}</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          {t("success.body")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/seminars">{t("success.more")}</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">{t("success.home")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const errorMessage = (() => {
    if (state.status !== "error" || !state.errorKey) return null;
    switch (state.errorKey) {
      case "name":
        return t("validation.name");
      case "contact":
        return t("validation.contact");
      case "seminar":
        return t("errors.generic");
      case "notConfigured":
        return t("errors.notConfigured");
      default:
        return t("errors.generic");
    }
  })();

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="seminar_id" value={seminarId} />

      <div className="space-y-2">
        <Label htmlFor="name">{t("form.name")}</Label>
        <Input
          id="name"
          name="name"
          required
          autoComplete="name"
          placeholder={t("form.namePlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact">{t("form.contact")}</Label>
        <Input
          id="contact"
          name="contact"
          required
          placeholder={t("form.contactPlaceholder")}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="belt_rank" optional={t("form.optional")}>
            {t("form.belt")}
          </Label>
          <Input
            id="belt_rank"
            name="belt_rank"
            placeholder={t("form.beltPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">{t("form.language")}</Label>
          <Select id="language" name="language" defaultValue={locale}>
            {routing.locales.map((loc) => (
              <option key={loc} value={loc}>
                {tc(`languages.${loc}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" optional={t("form.optional")}>
          {t("form.message")}
        </Label>
        <Textarea
          id="message"
          name="message"
          placeholder={t("form.messagePlaceholder")}
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

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? t("form.submitting") : t("form.submit")}
        {!isPending ? <ArrowRight /> : null}
      </Button>
    </form>
  );
}
