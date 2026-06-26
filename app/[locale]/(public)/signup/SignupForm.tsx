"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitSignup, type SignupState } from "./actions";

const INITIAL: SignupState = { status: "idle" };

export function SignupForm() {
  const t = useTranslations("signup");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [section, setSection] = useState<"" | "adults" | "kids">("");
  const [state, formAction, isPending] = useActionState(submitSignup, INITIAL);

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-success/40 bg-success/10 p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <h2 className="mt-4 text-2xl font-bold">{t("success.title")}</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          {t("success.body")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">{t("success.home")}</Link>
          </Button>
          <Button asChild variant="ghost">
            {/* Reload the form for a fresh submission */}
            <a href="">{t("success.again")}</a>
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
      case "section":
        return t("validation.section");
      case "notConfigured":
        return t("errors.notConfigured");
      default:
        return t("errors.generic");
    }
  })();

  return (
    <form action={formAction} className="space-y-6">
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
          <Label htmlFor="section">{t("form.section")}</Label>
          <Select
            id="section"
            name="section"
            required
            value={section}
            onChange={(e) =>
              setSection(e.target.value as "" | "adults" | "kids")
            }
          >
            <option value="" disabled>
              —
            </option>
            <option value="adults">{t("form.sectionAdults")}</option>
            <option value="kids">{t("form.sectionKids")}</option>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t("form.sectionHelp")}
          </p>
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

      {/* Kids-only fields */}
      {section === "kids" ? (
        <div className="grid gap-6 rounded-lg border border-border bg-card/50 p-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="parent_name">{t("form.parentName")}</Label>
            <Input
              id="parent_name"
              name="parent_name"
              autoComplete="name"
              placeholder={t("form.parentNamePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact">{t("form.emergency")}</Label>
            <Input
              id="emergency_contact"
              name="emergency_contact"
              placeholder={t("form.emergencyPlaceholder")}
            />
          </div>
        </div>
      ) : null}

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
