"use server";

import { createClient } from "@/lib/supabase/server";
import type { LanguagePref, Section } from "@/lib/supabase/types";

export type SignupErrorKey =
  | "name"
  | "contact"
  | "section"
  | "generic"
  | "notConfigured";

export type SignupState = {
  status: "idle" | "success" | "error";
  errorKey?: SignupErrorKey;
};

export async function submitSignup(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const section = String(formData.get("section") ?? "") as Section | "";
  const language = String(formData.get("language") ?? "es") as LanguagePref;
  const message = String(formData.get("message") ?? "").trim() || null;
  const parentName = String(formData.get("parent_name") ?? "").trim() || null;
  const emergency =
    String(formData.get("emergency_contact") ?? "").trim() || null;

  // Server-side validation (the form also validates for nicer UX).
  if (!name) return { status: "error", errorKey: "name" };
  if (!contact) return { status: "error", errorKey: "contact" };
  if (section !== "adults" && section !== "kids") {
    return { status: "error", errorKey: "section" };
  }

  const supabase = await createClient();
  if (!supabase) return { status: "error", errorKey: "notConfigured" };

  const { error } = await supabase.from("signups").insert({
    name,
    contact,
    language,
    section_interest: section,
    message,
    parent_name: section === "kids" ? parentName : null,
    emergency_contact: section === "kids" ? emergency : null,
  });

  if (error) {
    console.error("signup insert failed:", error.message);
    return { status: "error", errorKey: "generic" };
  }

  return { status: "success" };
}
