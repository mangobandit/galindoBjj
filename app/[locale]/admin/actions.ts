"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { currentPeriod } from "@/lib/format";
import { routing } from "@/i18n/routing";
import type {
  LanguagePref,
  MemberStatus,
  PaymentMethod,
  Section,
} from "@/lib/supabase/types";

async function client() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

/**
 * Fail loudly on a swallowed Supabase write error. supabase-js resolves a
 * rejected write (RLS denial, constraint, transient failure) as { error }
 * instead of throwing, so without this a "save" can silently do nothing.
 * Throwing here surfaces the dashboard error boundary (a real, retryable
 * message) instead of pretending the action succeeded.
 */
function assertOk(
  error: { message: string } | null,
  where: string,
): void {
  if (error) {
    console.error(`${where} failed:`, error.message);
    throw new Error(`${where} failed: ${error.message}`);
  }
}

/** Read the active locale from a hidden form field, falling back to default. */
function formLocale(formData: FormData): (typeof routing.locales)[number] {
  const loc = String(formData.get("locale") || "");
  return (routing.locales as readonly string[]).includes(loc)
    ? (loc as (typeof routing.locales)[number])
    : routing.defaultLocale;
}

function revalidateAdmin() {
  revalidatePath("/[locale]/admin", "page");
  revalidatePath("/[locale]/admin/members", "page");
  revalidatePath("/[locale]/admin/payments", "page");
  revalidatePath("/[locale]/admin/signups", "page");
  revalidatePath("/[locale]/admin/seminars", "page");
}

// ── Payments ──────────────────────────────────────────────────────────────
export type TogglePaymentState = {
  status: "idle" | "success" | "error";
};

/**
 * One-tap toggle for "paid this period". Returns a typed state (consumed via
 * useActionState) so a failed write shows inline feedback instead of silently
 * doing nothing — this is the coach's core daily action.
 */
export async function togglePayment(
  _prev: TogglePaymentState,
  formData: FormData,
): Promise<TogglePaymentState> {
  const supabase = await createClient();
  if (!supabase) return { status: "error" };

  const memberId = String(formData.get("memberId"));
  const period = String(formData.get("period"));
  const isPaid = String(formData.get("paid")) === "1";
  const amount = Number(formData.get("amount")) || null;
  const method = String(formData.get("method") || "cash") as PaymentMethod;

  const { error } = isPaid
    ? // Currently paid → undo.
      await supabase
        .from("payments")
        .delete()
        .eq("member_id", memberId)
        .eq("period", period)
    : await supabase.from("payments").upsert(
        {
          member_id: memberId,
          period,
          amount,
          method,
          paid_on:
            currentPeriod() === period
              ? new Date().toISOString().slice(0, 10)
              : `${period}-01`,
          status: "paid",
        },
        { onConflict: "member_id,period" },
      );

  if (error) {
    console.error("togglePayment failed:", error.message);
    return { status: "error" };
  }

  revalidateAdmin();
  return { status: "success" };
}

// ── Members ─────────────────────────────────────────────────────────────
export async function activateMember(formData: FormData) {
  const supabase = await client();
  const { error } = await supabase
    .from("members")
    .update({ status: "active" })
    .eq("id", String(formData.get("id")));
  assertOk(error, "activateMember");
  revalidateAdmin();
}

export type SaveMemberState = {
  status: "idle" | "success" | "error";
  error?: string;
};

export async function saveMember(
  _prev: SaveMemberState,
  formData: FormData,
): Promise<SaveMemberState> {
  const supabase = await createClient();
  if (!supabase) return { status: "error", error: "notConfigured" };

  const id = String(formData.get("id") || "");
  const full_name = String(formData.get("full_name") || "").trim();
  const section = String(formData.get("section") || "") as Section;

  if (!full_name) return { status: "error", error: "required" };
  if (section !== "adults" && section !== "kids") {
    return { status: "error", error: "required" };
  }

  const text = (key: string) => {
    const v = String(formData.get(key) || "").trim();
    return v.length ? v : null;
  };

  const payload = {
    full_name,
    section,
    phone: text("phone"),
    email: text("email"),
    language_pref: (String(formData.get("language_pref") || "es") as LanguagePref),
    belt_rank: text("belt_rank"),
    status: (String(formData.get("status") || "active") as MemberStatus),
    date_joined: text("date_joined") ?? new Date().toISOString().slice(0, 10),
    notes: text("notes"),
    parent_name: section === "kids" ? text("parent_name") : null,
    emergency_contact: section === "kids" ? text("emergency_contact") : null,
  };

  const { error } = id
    ? await supabase.from("members").update(payload).eq("id", id)
    : await supabase.from("members").insert(payload);

  if (error) {
    console.error("saveMember failed:", error.message);
    return { status: "error", error: "generic" };
  }

  revalidateAdmin();
  return { status: "success" };
}

export async function deleteMember(formData: FormData) {
  const supabase = await client();
  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", String(formData.get("id")));
  assertOk(error, "deleteMember");
  revalidateAdmin();
  // Leave the now-deleted member's edit page instead of 404-ing on re-render.
  redirect({ href: "/admin/members", locale: formLocale(formData) });
}

// ── Sign-ups inbox ────────────────────────────────────────────────────────
export async function dismissSignup(formData: FormData) {
  const supabase = await client();
  const { error } = await supabase
    .from("signups")
    .update({ converted: true })
    .eq("id", String(formData.get("id")));
  assertOk(error, "dismissSignup");
  revalidateAdmin();
}

/** Convert a sign-up into a prospect member and clear it from the inbox. */
export async function convertSignup(formData: FormData) {
  const supabase = await client();
  const id = String(formData.get("id"));

  const { data: signup } = await supabase
    .from("signups")
    .select("*")
    .eq("id", id)
    .single();

  if (!signup) return;

  const { error: insertError } = await supabase.from("members").insert({
    full_name: signup.name,
    section: signup.section_interest ?? "adults",
    language_pref: signup.language,
    status: "prospect",
    // contact may be a phone or an email — keep it in the most likely field.
    phone: signup.contact.includes("@") ? null : signup.contact,
    email: signup.contact.includes("@") ? signup.contact : null,
    notes: signup.message,
    parent_name: signup.parent_name,
    emergency_contact: signup.emergency_contact,
  });
  assertOk(insertError, "convertSignup (insert member)");

  const { error: updateError } = await supabase
    .from("signups")
    .update({ converted: true })
    .eq("id", id);
  assertOk(updateError, "convertSignup (mark converted)");
  revalidateAdmin();
}

// ── Seminars ────────────────────────────────────────────────────────────
export type SaveSeminarState = {
  status: "idle" | "success" | "error";
  error?: string;
};

export async function saveSeminar(
  _prev: SaveSeminarState,
  formData: FormData,
): Promise<SaveSeminarState> {
  const supabase = await createClient();
  if (!supabase) return { status: "error", error: "notConfigured" };

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const startsAtRaw = String(formData.get("starts_at") || "").trim();

  if (!title) return { status: "error", error: "required" };
  if (!startsAtRaw) return { status: "error", error: "required" };

  // <input type="datetime-local"> gives "YYYY-MM-DDTHH:mm" — store as ISO.
  const startsAt = new Date(startsAtRaw);
  if (Number.isNaN(startsAt.getTime())) {
    return { status: "error", error: "required" };
  }

  const text = (key: string) => {
    const v = String(formData.get(key) || "").trim();
    return v.length ? v : null;
  };
  const num = (key: string) => {
    const v = String(formData.get(key) || "").trim();
    if (!v.length) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const payload = {
    title,
    starts_at: startsAt.toISOString(),
    description: text("description"),
    location: text("location"),
    capacity: num("capacity"),
    price: num("price"),
    published: String(formData.get("published")) === "1",
  };

  const { error } = id
    ? await supabase.from("seminars").update(payload).eq("id", id)
    : await supabase.from("seminars").insert(payload);

  if (error) {
    console.error("saveSeminar failed:", error.message);
    return { status: "error", error: "generic" };
  }

  revalidateAdmin();
  return { status: "success" };
}

export async function deleteSeminar(formData: FormData) {
  const supabase = await client();
  const { error } = await supabase
    .from("seminars")
    .delete()
    .eq("id", String(formData.get("id")));
  assertOk(error, "deleteSeminar");
  revalidateAdmin();
  // Return to the list rather than 404-ing on the deleted seminar's page.
  redirect({ href: "/admin/seminars", locale: formLocale(formData) });
}

/** Remove a single attendee from a seminar's list (e.g. a cancellation). */
export async function removeAttendee(formData: FormData) {
  const supabase = await client();
  const { error } = await supabase
    .from("seminar_signups")
    .delete()
    .eq("id", String(formData.get("id")));
  assertOk(error, "removeAttendee");
  revalidateAdmin();
}
