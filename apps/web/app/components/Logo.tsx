// The selected folded-Z mark and configurable wordmark.
import { SITE } from "@aihot/industry/site";
import { Z_MARK } from "@aihot/industry/branding";

export function ZMark({ className = "" }: { className?: string }) {
  return <svg viewBox={Z_MARK.viewBox} className={className} aria-hidden="true" focusable="false">
    {Z_MARK.paths.map((path) => <path key={path.fill} d={path.d} fill={path.fill} />)}
  </svg>;
}

export function Wordmark({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`workshop-wordmark inline-flex items-center gap-[0.26em] whitespace-nowrap font-bold leading-none tracking-[-0.045em] ${className}`} style={{ fontSize: size }} aria-label={SITE.name} role="img">
      <ZMark className="size-[1.2em] shrink-0" />
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
