// The workshop's optic mark and configurable wordmark. Geometry stays local and theme-aware.
import { SITE } from "@aihot/industry/site";

export function OpticMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true" focusable="false">
      <path d="M9 3H23L29 9V23L23 29H9L3 23V9L9 3Z" fill="var(--accent-soft)" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9 8H23M8 9V23M24 9V23M9 24H23" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.8" />
      <circle cx="16" cy="16" r="6.3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="2.8" fill="currentColor" />
      <path d="M16 3V8M16 24V29M3 16H8M24 16H29" stroke="currentColor" strokeWidth="1.5" />
      <path d="M23 3L29 9" stroke="var(--signal-secondary)" strokeWidth="2" />
    </svg>
  );
}

export function Wordmark({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`workshop-wordmark inline-flex items-center gap-[0.26em] whitespace-nowrap font-bold leading-none tracking-[-0.045em] ${className}`} style={{ fontSize: size }} aria-label={SITE.name} role="img">
      <OpticMark className="size-[0.88em] shrink-0 text-accent" />
      <span aria-hidden="true">{SITE.name}</span>
    </span>
  );
}

/** The optic's inner ring; movement is reserved for a loading state. */
export function RingMark({ className = "", spinning = false }: { className?: string; spinning?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <g style={spinning ? { transformOrigin: "12px 12px", animation: "spin-slow 1.1s linear infinite" } : undefined}>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeDasharray="14 5" />
      </g>
      <circle cx="12" cy="12" r="4.4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <circle cx="12" cy="12" r="2.3" fill="currentColor" />
    </svg>
  );
}
