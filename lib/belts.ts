export type BeltColor =
  | "white"
  | "grey"
  | "yellow"
  | "orange"
  | "green"
  | "blue"
  | "purple"
  | "brown"
  | "black";

export type BeltDegree = "0" | "1" | "2" | "3" | "4";

export const BELT_COLORS: Array<{
  value: BeltColor;
  labels: Record<string, string>;
}> = [
  { value: "white", labels: { es: "Cinturon blanco", en: "White belt" } },
  { value: "grey", labels: { es: "Cinturon gris", en: "Grey belt" } },
  { value: "yellow", labels: { es: "Cinturon amarillo", en: "Yellow belt" } },
  { value: "orange", labels: { es: "Cinturon naranja", en: "Orange belt" } },
  { value: "green", labels: { es: "Cinturon verde", en: "Green belt" } },
  { value: "blue", labels: { es: "Cinturon azul", en: "Blue belt" } },
  { value: "purple", labels: { es: "Cinturon morado", en: "Purple belt" } },
  { value: "brown", labels: { es: "Cinturon marron", en: "Brown belt" } },
  { value: "black", labels: { es: "Cinturon negro", en: "Black belt" } },
];

export const BELT_DEGREES: BeltDegree[] = ["0", "1", "2", "3", "4"];

const COLOR_ALIASES: Record<string, BeltColor> = {
  white: "white",
  blanca: "white",
  blanco: "white",
  grey: "grey",
  gray: "grey",
  gris: "grey",
  yellow: "yellow",
  amarilla: "yellow",
  amarillo: "yellow",
  orange: "orange",
  naranja: "orange",
  green: "green",
  verde: "green",
  blue: "blue",
  azul: "blue",
  purple: "purple",
  morada: "purple",
  morado: "purple",
  brown: "brown",
  marron: "brown",
  black: "black",
  negra: "black",
  negro: "black",
};

function normalizedLocale(locale = "es") {
  return locale.toLowerCase().startsWith("en") ? "en" : "es";
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function formatBeltColorLabel(color: BeltColor, locale = "es") {
  const option = BELT_COLORS.find((belt) => belt.value === color);
  return option?.labels[normalizedLocale(locale)] ?? option?.labels.es ?? color;
}

export function formatBeltDegreeLabel(degree: BeltDegree, locale = "es") {
  const isEnglish = normalizedLocale(locale) === "en";
  if (isEnglish) {
    return {
      "0": "No degree",
      "1": "1st degree",
      "2": "2nd degree",
      "3": "3rd degree",
      "4": "4th degree",
    }[degree];
  }

  return {
    "0": "Sin grado",
    "1": "1er grado",
    "2": "2o grado",
    "3": "3er grado",
    "4": "4o grado",
  }[degree];
}

export function parseBeltRank(rank?: string | null): {
  color: BeltColor | "";
  degree: BeltDegree;
} {
  if (!rank) return { color: "", degree: "0" };

  const canonical = rank.match(/^([a-z]+):([0-4])$/);
  if (canonical) {
    const color = canonical[1] as BeltColor;
    const degree = canonical[2] as BeltDegree;
    if (BELT_COLORS.some((belt) => belt.value === color)) {
      return { color, degree };
    }
  }

  const normalized = normalizeText(rank);
  const color = Object.entries(COLOR_ALIASES).find(([alias]) =>
    normalized.includes(alias),
  )?.[1];
  const degree = (normalized.match(/\b([0-4])\b/)?.[1] ?? "0") as BeltDegree;

  return {
    color: color ?? "",
    degree: BELT_DEGREES.includes(degree) ? degree : "0",
  };
}

export function serializeBeltRank(color: string, degree: string) {
  if (!BELT_COLORS.some((belt) => belt.value === color)) return null;
  const normalizedDegree = BELT_DEGREES.includes(degree as BeltDegree)
    ? (degree as BeltDegree)
    : "0";
  return `${color}:${normalizedDegree}`;
}

export function formatBeltRank(rank?: string | null, locale = "es") {
  const parsed = parseBeltRank(rank);
  if (!parsed.color) return rank ?? "";

  return `${formatBeltColorLabel(parsed.color, locale)} / ${formatBeltDegreeLabel(
    parsed.degree,
    locale,
  )}`;
}
