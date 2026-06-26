"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { currentPeriod } from "@/lib/format";
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

function revalidateAdmin() {
  revalidatePath("/[locale]/admin", "page");
  revalidatePath("/[locale]/admin/members", "page");
  revalidatePath("/[locale]/admin/payments", "page");
  revalidatePath("/[locale]/admin/signups", "page");
}

// ── Payments ──────────────────────────────────────────────────────────────
/** One-tap toggle for "paid this period". Progressive-enhancement friendly. */
export async function togglePayment(formData: FormData) {
  const supabase = await client();
  const memberId = String(formData.get("memberId"));
  const period = String(formData.get("period"));
  const isPaid = String(formData.get("paid")) === "1";
  const amount = Number(formData.get("amount")) || null;
  const method = (String(formData.get("method") || "cash") as PaymentMethod);

  if (isPaid) {
    // Currently paid → undo.
    await supabase
      .from("payments")
      .delete()
      .eq("member_id", memberId)
      .eq("period", period);
  } else {
    await supabase.from("payments").upsert(
      {
        member_id: memberId,
        period,
        amount,
        method,
        paid_on: currentPeriod() === period
          ? new Date().toISOString().slice(0, 10)
          : `${period}-01`,
        status: "paid",
      },
      { onConflict: "member_id,period" },
    );
  }

  revalidateAdmin();
}

// ── Members ─────────────────────────────────────────────────────────────
export async function activateMember(formData: FormData) {
  const supabase = await client();
  await supabase
    .from("members")
    .update({ status: "active" })
    .eq("id", String(formData.get("id")));
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
  await supabase
    .from("members")
    .delete()
    .eq("id", String(formData.get("id")));
  revalidateAdmin();
}

// ── Sign-ups inbox ────────────────────────────────────────────────────────
export async function dismissSignup(formData: FormData) {
  const supabase = await client();
  await supabase
    .from("signups")
    .update({ converted: true })
    .eq("id", String(formData.get("id")));
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

  await supabase.from("members").insert({
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

  await supabase.from("signups").update({ converted: true }).eq("id", id);
  revalidateAdmin();
}
