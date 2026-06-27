"use client";

// Last-resort boundary for errors thrown in the root/locale layout itself (above
// the [locale]/error.tsx boundary). It must render its own <html>/<body> and
// can't rely on the app's CSS or providers, so it uses inline styles — mirroring
// app/not-found.tsx's global fallback.

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Fatal error:", error);
  }, [error]);

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
          background: "#0a0a0a",
          color: "#f5f5f5",
          textAlign: "center",
          padding: "1.25rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Algo ha fallado</h1>
        <p style={{ color: "#a3a3a3", maxWidth: "28rem" }}>
          Ha ocurrido un error inesperado. Vuelve a intentarlo o recarga la
          página.
        </p>
        <button
          onClick={reset}
          style={{
            border: "1px solid #f5f5f5",
            background: "#f5f5f5",
            color: "#0a0a0a",
            borderRadius: "0.4rem",
            padding: "0.5rem 1.25rem",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
        {error.digest ? (
          <p style={{ color: "#737373", fontSize: "0.75rem" }}>
            Ref: {error.digest}
          </p>
        ) : null}
      </body>
    </html>
  );
}
