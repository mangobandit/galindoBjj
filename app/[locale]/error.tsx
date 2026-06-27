"use client";

// Error boundary for the whole locale subtree (public site + admin). Without
// this, any error thrown while rendering a Server Component or running a Server
// Action surfaces as the opaque "Application error: a client-side exception has
// occurred" overlay, with the real message only in the console. This catches it
// and offers a way back. Deliberately free of next-intl/data dependencies so it
// can render even when those are the thing that failed.

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces the real cause in the browser console (and Vercel logs).
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-5 text-center">
      <p className="font-display text-5xl font-bold text-primary">Vaya…</p>
      <p className="max-w-md text-muted-foreground">
        Algo ha fallado al cargar esta página. Vuelve a intentarlo; si el
        problema continúa, recarga la página.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Reintentar</Button>
        <Button asChild variant="outline">
          <a href="/">Volver al inicio</a>
        </Button>
      </div>
      {error.digest ? (
        <p className="text-xs text-muted-foreground/70">Ref: {error.digest}</p>
      ) : null}
    </div>
  );
}
