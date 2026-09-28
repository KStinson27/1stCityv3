/**
 * The HUD Equal Housing Opportunity logo — a house pictogram built from an
 * equals sign (roofline + two bars) inside a circle. This is the actual
 * fair-housing mark advertisers are expected to display (see HUD's Fair
 * Housing advertising guidelines), not a generic house icon — swap it out
 * for HUD's own artwork (hud.gov) if pixel-perfect fidelity matters for a
 * specific use (print signage, etc.).
 */
export function EqualHousingLogo({
  size = 18,
  color = "currentColor",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="5" />
      <path d="M26 46 L50 24 L74 46" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="29" y="50" width="42" height="9" fill={color} />
      <rect x="29" y="66" width="42" height="9" fill={color} />
    </svg>
  );
}
