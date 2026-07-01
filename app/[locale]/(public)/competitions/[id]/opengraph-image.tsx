import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import type {
  Competition,
  PublicCompetitionFighter,
} from "@/lib/supabase/types";

export const alt = "Galindo BJJ — competition tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dynamic share card: the competition title plus live headline numbers, so a
// link dropped in WhatsApp/Instagram shows the team's standing at a glance.
export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let competition: Competition | null = null;
  let fighters: PublicCompetitionFighter[] = [];

  const supabase = await createClient();
  if (supabase) {
    const [{ data: c }, { data: f }] = await Promise.all([
      supabase
        .from("competitions")
        .select("*")
        .eq("id", id)
        .eq("published", true)
        .maybeSingle(),
      supabase
        .from("public_competition_fighters")
        .select("*")
        .eq("competition_id", id),
    ]);
    competition = (c as Competition) ?? null;
    fighters = (f as PublicCompetitionFighter[]) ?? [];
  }

  const title = competition?.title ?? "Galindo BJJ";
  const medals = fighters.filter((x) =>
    ["gold", "silver", "bronze"].includes(x.result),
  ).length;

  const stat = (value: string, label: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>{value}</div>
      <div style={{ display: "flex", fontSize: 26, color: "#a1a1aa" }}>{label}</div>
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 2, color: "#a1a1aa" }}>
          FUSIÓN GALINDO · JIU-JITSU
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
          {title}
        </div>
        <div style={{ display: "flex", gap: 80 }}>
          {stat(String(fighters.length), "Competitors")}
          {stat(String(medals), "Medals")}
        </div>
      </div>
    ),
    size,
  );
}
