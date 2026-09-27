import Image from "next/image";

type LogoProps = {
  size?: number;
  textColor?: string;
};

// Real dimensions of the trimmed /public/logo.png, used to keep its aspect
// ratio when it's rendered at a fixed height (see Wordmark below).
const LOGO_ASPECT_RATIO = 586 / 403;

/**
 * The real "1st City LLC" logo (green "1" + black "ST/CITY/LLC"), rendered
 * with its transparent background as-is. Its black text only reads on a
 * light backdrop, so anywhere this is used needs a light surface behind it
 * (see Header, which is white for this reason) rather than sitting on a
 * colored bar directly.
 */
export function Wordmark({ height = 40 }: { height?: number }) {
  const width = Math.round(height * LOGO_ASPECT_RATIO);
  return <Image src="/logo.png" alt="1st City LLC" width={width} height={height} priority />;
}

/**
 * The green flag-"1" from the real 1st City LLC wordmark, redrawn as SVG
 * from the logo file provided directly (not yet committed as an asset —
 * see LogoMark below). Swap this path for the original vector if a source
 * SVG/AI file becomes available later.
 */
function FlagOne({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 140" fill="none" aria-hidden="true">
      <path d="M45 20 L70 20 L70 130 L45 130 L45 48 L20 48 Z" fill="#2e7d32" />
    </svg>
  );
}

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg bg-white"
      style={{ width: size, height: size }}
    >
      <FlagOne size={size * 0.5} />
    </div>
  );
}

export function Logo({ size = 36, textColor = "text-white" }: LogoProps) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className={`text-xl font-medium ${textColor}`}>1st City LLC</span>
    </span>
  );
}
