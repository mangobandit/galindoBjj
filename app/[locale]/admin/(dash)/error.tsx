"use client";

// Dashboard-scoped error boundary. Keeps a failed admin action/render inside the
// panel context with a one-tap retry, instead of the opaque white-screen
// "client-side exception". Intentionally dependency-light so it can't fail too.

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-xl border border-border bg-card p-8 text-center">
      <p className="font-display text-3xl font-bold">Algo ha fallado</p>
      <p className="text-sm text-muted-foreground">
        No se ha podido completar la acción. Vuelve a intentarlo; si persiste,
        recarga el panel.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset} size="sm">
          Reintentar
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href="/admin">Ir al panel</a>
        </Button>
      </div>
      {error.digest ? (
        <p className="text-xs text-muted-foreground/70">Ref: {error.digest}</p>
      ) : null}
    </div>
  );
}
