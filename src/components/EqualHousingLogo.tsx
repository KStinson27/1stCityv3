import Image from "next/image";

/**
 * The official HUD Equal Housing Opportunity logo (the house pictogram with
 * the "EQUAL HOUSING OPPORTUNITY" wordmark baked in) — the actual fair-housing
 * mark advertisers are expected to display, not a redrawn approximation.
 */
export function EqualHousingLogo({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/eho-logo.png"
      alt="Equal Housing Opportunity"
      width={size}
      height={size}
      className={className}
    />
  );
}
