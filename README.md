# Galindo BJJ — Dojo Platform

A calm, low-maintenance platform for a Brazilian Jiu-Jitsu coach ("the Professor").
It replaces a notepad: a **private admin dashboard** to manage members and
payments, plus a **public multilingual sign-up page** so anyone — including
non-Spanish speakers — can register.

> **Domain:** `galindobjj.es` · **Default language:** Spanish (es) · Also English (en), German (de), Italian (it)

This repository contains **Phase 1 (the demo MVP)**. Phases 2 and 3 are
scaffolded or noted but intentionally **not built** — see [Roadmap](#roadmap).

---

## Tech stack

| Concern        | Choice                                            |
| -------------- | ------------------------------------------------- |
| Framework      | Next.js 15 (App Router) + TypeScript              |
| Styling        | Tailwind CSS v3 + shadcn-style components         |
| Database/Auth  | Supabase (Postgres + Auth), free tier             |
| i18n           | next-intl (es / en / de / it)                     |
| Hosting        | Vercel                                            |

Everything is chosen to be **free-tier friendly and low-ops**: one Supabase
project, one Vercel project, redeploy on `git push`.

---

## What Phase 1 ships

**Public site** (Spanish-first, language switcher → en/de/it, mobile-first)
- Home — intro to the dojo + the Professor, a sample class schedule, clear CTA.
- Sign-up — name, contact, preferred language, section (kids/adults). Choosing
  **kids** reveals parent name + emergency contact. Submits to the `signups`
  table; friendly confirmation screen. **All four locales fully translated.**
- Contact — simple contact block, no member data or finances exposed.

**Admin dashboard** (coach logs in; Spanish labels)
- Login via Supabase Auth (email + password).
- Overview — active members, kids vs adults, payments due this month, new sign-ups.
- Members — searchable, filter by section/status, add/edit, one-tap prospect → active.
- Payments — pick a month, see paid vs due, **one-tap "mark as paid"** (the core daily action).
- Sign-ups inbox — review submissions, convert to a member (as a prospect) or dismiss.

**Seeded sample data** — a realistic mix of kids/adults members, some paid and
some due for June 2026, plus a few pending sign-ups, so the dashboard looks
alive in a demo. See [`supabase/seed.sql`](supabase/seed.sql).

---

## Local setup

### 1. Prerequisites
- Node.js 20+ and npm
- A free [Supabase](https://supabase.com) account (only needed for the admin
  dashboard + saving sign-ups; the public marketing pages run without it)

### 2. Install
```bash
npm install
```

### 3. Configure environment
Copy the example and fill it in:
```bash
cp .env.example .env.local
```
Then set (from your Supabase project → **Project Settings → Data API**):
```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```
> The app **boots without these** — the public site renders and the admin shows
> a calm "not configured yet" notice — so you can preview the UI immediately.
> Supabase is required for sign-ups to save and for the dashboard to work.

### 4. Create the database schema + sample data
In the Supabase dashboard → **SQL Editor**, run, in order:
1. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — tables, enums, Row Level Security.
2. [`supabase/seed.sql`](supabase/seed.sql) — sample members, payments, sign-ups.

> Prefer the CLI? With the [Supabase CLI](https://supabase.com/docs/guides/cli)
> linked to your project, `supabase db push` applies the migration and
> `supabase db execute --file supabase/seed.sql` loads the seed.

### 5. Create the coach's login
The maintainer provisions the account (there is no public registration).
In Supabase → **Authentication → Users → Add user**, create a user with an
email + password and **"Auto Confirm User"** checked. Those credentials are
what the Professor uses at `/admin/login`.

### 6. Run
```bash
npm run dev
```
- Public site: http://localhost:3000  (Spanish; `/en`, `/de`, `/it` for others)
- Admin login: http://localhost:3000/admin/login

---

## Project structure

```
app/
  [locale]/
    layout.tsx              Root layout: fonts, <html>, NextIntl provider
    (public)/               Public site (shares header + footer)
      page.tsx              Home
      signup/               Sign-up form + server action
      contact/
    admin/
      login/                Supabase email/password login
      (dash)/               Auth-gated dashboard (force-dynamic)
        page.tsx            Overview
        members/            List · new · [id] edit
        payments/           Period picker + mark-as-paid
        signups/            Inbox: convert / dismiss
    _components/            Header, Footer, LanguageSwitcher
components/ui/              Button, Input, Select, Card, Badge, …
i18n/                       routing, request (with es fallback), navigation
messages/                  es.json (full) · en/de/it (public flow)
lib/supabase/              browser / server / middleware clients + types
supabase/
  migrations/0001_init.sql  Schema + RLS
  seed.sql                  Sample data
middleware.ts              next-intl locale routing + Supabase session refresh
```

### Internationalisation
- **Public flow is fully translated in all four locales.**
- **Admin is Spanish-first.** Admin copy lives in the i18n system (not
  hardcoded), but only Spanish strings exist today; `i18n/request.ts` merges
  each locale over the Spanish base, so the dashboard works under any locale and
  new admin translations can be added incrementally later.

### Security (Row Level Security)
RLS is enabled on every table:
- **Public (anon)** can only `INSERT` into `signups` — nothing else is readable
  or writable.
- **The authenticated coach** can read/write members, payments, sign-ups and
  merch requests.

No business internals (members, money) are ever exposed publicly.

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel → **New Project** → import the repo (framework auto-detected as Next.js).
3. Add Environment Variables (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://galindobjj.es`
4. Deploy. Run the migration + seed against your Supabase project (step 4 above)
   and create the coach user (step 5) if you haven't already.

> Set the env vars **before** the first build. Admin routes read the auth cookie
> and are always rendered on demand (never statically cached).

### Point `galindobjj.es` at Vercel
1. Vercel → Project → **Settings → Domains → Add** → `galindobjj.es` (and `www`).
2. At your domain registrar, add the DNS records Vercel shows:
   - Apex `galindobjj.es` → **A** record `76.76.21.21` (or the ALIAS/ANAME Vercel gives).
   - `www.galindobjj.es` → **CNAME** `cname.vercel-dns.com`.
3. Wait for DNS to propagate; Vercel issues HTTPS automatically.
4. (Optional) In Supabase → **Authentication → URL Configuration**, set the Site
   URL to `https://galindobjj.es`.

---

## Roadmap

### Phase 2 — scaffolded, **no UI yet**
- **Merchandise requests** — the `merch_requests` table already exists (see the
  migration) with admin-only RLS. The public request form and the admin
  fulfilment view are **not built**.
- **Class schedule management** — the home page shows a hardcoded sample
  schedule (`app/[locale]/(public)/page.tsx`). There is no editable schedule
  model or admin UI yet.
- **Email / WhatsApp reminders** — not started.

### Phase 3 — noted only
- Optional online payments (kept manual in v1 on purpose — no card processing,
  invoicing or tax complexity).
- Attendance tracking.
- Automated payment reminders.

---

## Notes & conventions
- Payments are **tracked, not collected** here. The coach keeps collecting money
  however they do today; the app only records who has paid for a given month.
- The `signups` table extends the brief with optional `parent_name` /
  `emergency_contact` so a kid's details survive conversion to a member.
- All marketing copy (the Professor's bio, address, phone, email, schedule) is
  **placeholder** — edit `messages/*.json` and the schedule array before going live.

## Scripts
```bash
npm run dev      # local dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint (does not block the build)
```
