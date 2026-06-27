// ─────────────────────────────────────────────────────────────
// Domain enums + the typed Database shape used by supabase-js.
// Hand-written to match supabase/migrations/0001_init.sql.
// ─────────────────────────────────────────────────────────────

export type Section = "kids" | "adults";
export type MemberStatus = "prospect" | "active" | "inactive";
export type LanguagePref = "es" | "en" | "de" | "it";
export type PaymentMethod = "cash" | "transfer" | "other";
export type PaymentStatus = "paid" | "due";
export type MerchStatus = "new" | "fulfilled";

export type Member = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  language_pref: LanguagePref;
  section: Section;
  belt_rank: string | null;
  status: MemberStatus;
  date_joined: string; // ISO date
  notes: string | null;
  parent_name: string | null;
  emergency_contact: string | null;
  created_at: string;
}

export type Payment = {
  id: string;
  member_id: string;
  period: string; // e.g. "2026-06"
  amount: number | null;
  method: PaymentMethod | null;
  paid_on: string | null; // ISO date
  status: PaymentStatus;
  created_at: string;
}

export type Signup = {
  id: string;
  name: string;
  contact: string;
  language: LanguagePref;
  section_interest: Section | null;
  message: string | null;
  parent_name: string | null;
  emergency_contact: string | null;
  converted: boolean;
  created_at: string;
}

export type MerchRequest = {
  id: string;
  member_id: string | null;
  item: string;
  size: string | null;
  quantity: number;
  notes: string | null;
  status: MerchStatus;
  created_at: string;
}

export type Seminar = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string; // ISO timestamp
  location: string | null;
  capacity: number | null;
  price: number | null;
  published: boolean;
  created_at: string;
}

export type SeminarSignup = {
  id: string;
  seminar_id: string;
  name: string;
  contact: string;
  language: LanguagePref;
  belt_rank: string | null;
  message: string | null;
  created_at: string;
}

// Generic helper: most columns are server-defaulted on insert.
type Insertable<T, Required extends keyof T> = Partial<Omit<T, "id" | "created_at">> &
  Pick<T, Required>;

// Shape each table so it satisfies supabase-js's GenericTable (needs
// Row / Insert / Update / Relationships) — otherwise the typed client
// silently degrades inserts to `never`.
type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      members: TableDef<
        Member,
        Insertable<Member, "full_name" | "section">,
        Partial<Member>
      >;
      payments: TableDef<
        Payment,
        Insertable<Payment, "member_id" | "period">,
        Partial<Payment>
      >;
      signups: TableDef<
        Signup,
        Insertable<Signup, "name" | "contact" | "language">,
        Partial<Signup>
      >;
      merch_requests: TableDef<
        MerchRequest,
        Insertable<MerchRequest, "item">,
        Partial<MerchRequest>
      >;
      seminars: TableDef<
        Seminar,
        Insertable<Seminar, "title" | "starts_at">,
        Partial<Seminar>
      >;
      seminar_signups: TableDef<
        SeminarSignup,
        Insertable<SeminarSignup, "seminar_id" | "name" | "contact">,
        Partial<SeminarSignup>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      section: Section;
      member_status: MemberStatus;
      language_pref: LanguagePref;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      merch_status: MerchStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
