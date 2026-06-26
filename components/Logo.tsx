import { cn } from "@/lib/utils";

/**
 * Official Galindo Jiu-Jitsu badge (public/galindo-logo.svg — a circular black
 * & white mark). Round-cropped so the square edges disappear on the dark page.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/galindo-logo.svg"
      alt="Galindo Jiu-Jitsu"
      className={cn("rounded-full object-cover", className)}
    />
  );
}

export function Logo({
  className,
  markClassName,
  wordmark = true,
  subtitle = true,
}: {
  className?: string;
  markClassName?: string;
  wordmark?: boolean;
  subtitle?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={cn("size-9", markClassName)} />
      {wordmark ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold uppercase tracking-wide">
            Galindo
          </span>
          {subtitle ? (
            <span className="font-display text-[0.58rem] font-medium uppercase tracking-[0.32em] text-muted-foreground">
              Jiu-Jitsu
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
