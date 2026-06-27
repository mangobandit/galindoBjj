"use server";

import { createClient } from "@/lib/supabase/server";
import type { LanguagePref } from "@/lib/supabase/types";

export type SeminarSignupErrorKey =
  | "name"
  | "contact"
  | "seminar"
  | "generic"
  | "notConfigured";

export type SeminarSignupState = {
  status: "idle" | "success" | "error";
  errorKey?: SeminarSignupErrorKey;
};

export async function submitSeminarSignup(
  _prev: SeminarSignupState,
  formData: FormData,
): Promise<SeminarSignupState> {
  const seminarId = String(formData.get("seminar_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const language = String(formData.get("language") ?? "es") as LanguagePref;
  const beltRank = String(formData.get("belt_rank") ?? "").trim() || null;
  const message = String(formData.get("message") ?? "").trim() || null;

  if (!seminarId) return { status: "error", errorKey: "seminar" };
  if (!name) return { status: "error", errorKey: "name" };
  if (!contact) return { status: "error", errorKey: "contact" };

  const supabase = await createClient();
  if (!supabase) return { status: "error", errorKey: "notConfigured" };

  const { error } = await supabase.from("seminar_signups").insert({
    seminar_id: seminarId,
    name,
    contact,
    language,
    belt_rank: beltRank,
    message,
  });

  if (error) {
    console.error("seminar signup insert failed:", error.message);
    return { status: "error", errorKey: "generic" };
  }

  return { status: "success" };
}
