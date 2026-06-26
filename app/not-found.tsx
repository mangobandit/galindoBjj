import Link from "next/link";

// Global fallback for paths that don't resolve to a locale. It renders its own
// <html> because it sits outside the [locale] layout.
export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body
        style={{
          minHeight: "100dvh",
          margin: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          background: "#13110f",
          color: "#f0e9df",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "3rem", margin: 0 }}>404</h1>
        <p style={{ color: "#a59d92" }}>Galindo BJJ</p>
        <Link href="/" style={{ color: "#e0533b" }}>
          Inicio
        </Link>
      </body>
    </html>
  );
}
