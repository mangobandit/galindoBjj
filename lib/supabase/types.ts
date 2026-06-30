// ─────────────────────────────────────────────────────────────
// Domain enums + the typed Database shape used by supabase-js.
// Hand-written to match supabase/migrations/0001_init.sql.
// ─────────────────────────────────────────────────────────────

export type Section = "kids" | "adults";
export type MemberStatus = "prospect" | "active" | "inactive";
export type LanguagePref =
  | "es"
  | "en"
  | "de"
  | "it"
  | "pt"
  | "fr"
  | "ca"
  | "ar"
  | "ro";
export type PaymentMethod = "cash" | "transfer" | "other";
export type PaymentStatus = "paid" | "due";
export type MerchStatus = "new" | "fulfilled";
export type CompetitionGiNogi = "gi" | "nogi" | "both";
export type CompetitionRegistrationStatus =
  | "needs_signup"
  | "registered"
  | "confirmed"
  | "withdrawn";
export type CompetitionPaymentStatus = "unknown" | "unpaid" | "paid";
export type CompetitionWeighInStatus = "unknown" | "pending" | "done";
export type CompetitionResult =
  | "pending"
  | "gold"
  | "silver"
  | "bronze"
  | "no_medal"
  | "withdrawn";
export type MatchResult = "pending" | "win" | "loss" | "draw" | "dq";

export type Member = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  language_pref: LanguagePref;
  section: Section;
  belt_rank: string | null;
  status: MemberStatus;
  weekly_sessions: number | null; // how many days/week they train
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
  poster_url: string | null;
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

export type Competition = {
  id: string;
  title: string;
  organizer: string | null;
  starts_on: string; // ISO date
  ends_on: string | null; // ISO date
  location: string | null;
  registration_url: string | null;
  bracket_url: string | null;
  team_url: string | null;
  published: boolean;
  notes: string | null;
  created_at: string;
}

export type CompetitionFighter = {
  id: string;
  competition_id: string;
  member_id: string | null;
  full_name: string;
  team: string;
  is_minor: boolean;
  age_group: string | null;
  belt_rank: string | null;
  division: string | null;
  weight_class: string | null;
  gi_nogi: CompetitionGiNogi;
  registration_status: CompetitionRegistrationStatus;
  payment_status: CompetitionPaymentStatus;
  weigh_in_status: CompetitionWeighInStatus;
  bracket_url: string | null;
  mat: string | null;
  first_match_at: string | null;
  result: CompetitionResult;
  placement: number | null;
  public_notes: string | null;
  coach_notes: string | null;
  created_at: string;
}

export type CompetitionMatch = {
  id: string;
  fighter_id: string;
  match_order: number;
  opponent: string | null;
  scheduled_at: string | null;
  mat: string | null;
  round: string | null;
  result: MatchResult;
  method: string | null;
  score: string | null;
  notes: string | null;
  created_at: string;
}

export type CompetitionMatStream = {
  id: string;
  competition_id: string;
  mat_name: string;
  stream_url: string;
  stream_label: string | null;
  sort_order: number;
  notes: string | null;
  created_at: string;
}

export type PublicCompetitionFighter = Omit<
  CompetitionFighter,
  "full_name" | "member_id" | "payment_status" | "coach_notes"
> & {
  display_name: string;
}

export type PublicCompetitionMatch = CompetitionMatch & {
  competition_id: string;
}

export type PublicCompetitionMatStream = CompetitionMatStream;

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

type ViewDef<Row> = {
  Row: Row;
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
      competitions: TableDef<
        Competition,
        Insertable<Competition, "title" | "starts_on">,
        Partial<Competition>
      >;
      competition_fighters: TableDef<
        CompetitionFighter,
        Insertable<CompetitionFighter, "competition_id" | "full_name">,
        Partial<CompetitionFighter>
      >;
      competition_matches: TableDef<
        CompetitionMatch,
        Insertable<CompetitionMatch, "fighter_id">,
        Partial<CompetitionMatch>
      >;
      competition_mat_streams: TableDef<
        CompetitionMatStream,
        Insertable<CompetitionMatStream, "competition_id" | "mat_name" | "stream_url">,
        Partial<CompetitionMatStream>
      >;
    };
    Views: {
      public_competition_fighters: ViewDef<PublicCompetitionFighter>;
      public_competition_matches: ViewDef<PublicCompetitionMatch>;
      public_competition_mat_streams: ViewDef<PublicCompetitionMatStream>;
    };
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
