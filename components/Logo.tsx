import { cn } from "@/lib/utils";

/**
 * On-brand black & white badge: ring + double diamond + "G" monogram.
 * A faithful SVG stand-in for the official Galindo Jiu-Jitsu logo — drop the
 * real artwork at `public/galindo-logo.png` and swap this for an <Image> if you
 * prefer the exact asset. Uses currentColor so it inherits the text colour.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      role="img"
      aria-label="Galindo Jiu-Jitsu"
    >
      <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="2.4" />
      <polygon
        points="50,15 85,50 50,85 15,50"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <polygon
        points="50,22 78,50 50,78 22,50"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <text
        x="50"
        y="52"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-display), system-ui, sans-serif"
        fontWeight={700}
        fontSize="40"
        fill="currentColor"
      >
        G
      </text>
    </svg>
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
