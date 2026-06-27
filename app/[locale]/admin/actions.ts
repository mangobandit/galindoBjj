"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { serializeBeltRank } from "@/lib/belts";
import { currentPeriod } from "@/lib/format";
import { routing } from "@/i18n/routing";
import type {
  LanguagePref,
  MemberStatus,
  PaymentMethod,
  Section,
} from "@/lib/supabase/types";

const SEMINAR_POSTER_BUCKET = "seminar-posters";
const SEMINAR_POSTER_MAX_BYTES = 8 * 1024 * 1024;
const SEMINAR_POSTER_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
} as const;

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
    belt_rank: serializeBeltRank(
      String(formData.get("belt_color") || ""),
      String(formData.get("belt_degree") || "0"),
    ),
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
  error?:
    | "required"
    | "notConfigured"
    | "posterType"
    | "posterSize"
    | "posterUpload"
    | "generic";
};

type SupabaseServerClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;

function posterFile(formData: FormData): File | null {
  const file = formData.get("poster");
  if (!file || typeof file === "string" || file.size === 0) return null;
  return file;
}

function posterPathFromPublicUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${SEMINAR_POSTER_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;
  const path = url.slice(markerIndex + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

async function uploadSeminarPoster(
  supabase: SupabaseServerClient,
  file: File,
): Promise<
  | { status: "success"; path: string; url: string }
  | { status: "error"; error: SaveSeminarState["error"] }
> {
  const extension =
    SEMINAR_POSTER_TYPES[file.type as keyof typeof SEMINAR_POSTER_TYPES];

  if (!extension) return { status: "error", error: "posterType" };
  if (file.size > SEMINAR_POSTER_MAX_BYTES) {
    return { status: "error", error: "posterSize" };
  }

  const baseName =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "poster";
  const path = `${new Date().getUTCFullYear()}/${crypto.randomUUID()}-${baseName}.${extension}`;

  const { error } = await supabase.storage
    .from(SEMINAR_POSTER_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("uploadSeminarPoster failed:", error.message);
    return { status: "error", error: "posterUpload" };
  }

  const { data } = supabase.storage
    .from(SEMINAR_POSTER_BUCKET)
    .getPublicUrl(path);

  return { status: "success", path, url: data.publicUrl };
}

export async function saveSeminar(
  _prev: SaveSeminarState,
  formData: FormData,
): Promise<SaveSeminarState> {
  const supabase = await createClient();
  if (!supabase) return { status: "error", error: "notConfigured" };

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const startsAtRaw = String(formData.get("starts_at") || "").trim();
  const existingPosterUrl = String(formData.get("existing_poster_url") || "");
  const removePoster = String(formData.get("remove_poster") || "") === "1";

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

  const file = posterFile(formData);
  const uploadedPoster = file ? await uploadSeminarPoster(supabase, file) : null;
  if (uploadedPoster?.status === "error") {
    return { status: "error", error: uploadedPoster.error };
  }

  const poster_url =
    uploadedPoster?.status === "success"
      ? uploadedPoster.url
      : removePoster
        ? null
        : existingPosterUrl || null;

  const payload = {
    title,
    starts_at: startsAt.toISOString(),
    description: text("description"),
    location: text("location"),
    capacity: num("capacity"),
    price: num("price"),
    published: String(formData.get("published")) === "1",
    poster_url,
  };

  const { error } = id
    ? await supabase.from("seminars").update(payload).eq("id", id)
    : await supabase.from("seminars").insert(payload);

  if (error) {
    if (uploadedPoster?.status === "success") {
      await supabase.storage
        .from(SEMINAR_POSTER_BUCKET)
        .remove([uploadedPoster.path]);
    }
    console.error("saveSeminar failed:", error.message);
    return { status: "error", error: "generic" };
  }

  if ((removePoster || uploadedPoster?.status === "success") && existingPosterUrl) {
    const oldPath = posterPathFromPublicUrl(existingPosterUrl);
    if (oldPath) {
      const { error: removeError } = await supabase.storage
        .from(SEMINAR_POSTER_BUCKET)
        .remove([oldPath]);
      if (removeError) {
        console.warn("remove old seminar poster failed:", removeError.message);
      }
    }
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
