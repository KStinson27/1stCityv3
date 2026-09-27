import Image from "next/image";

// Real dimensions of the trimmed /public/logo.png, used to keep its aspect
// ratio when it's rendered at a fixed height.
const LOGO_ASPECT_RATIO = 586 / 403;

/**
 * The real "1st City LLC" logo (green "1" + black "ST/CITY/LLC"), rendered
 * with its transparent background as-is. Its black text only reads on a
 * light backdrop, so this only belongs directly on a light surface (see
 * Header, which is white for this reason) — use WordmarkPlate instead on a
 * colored or dark background.
 */
export function Wordmark({ height = 40 }: { height?: number }) {
  const width = Math.round(height * LOGO_ASPECT_RATIO);
  return <Image src="/logo.png" alt="1st City LLC" width={width} height={height} priority />;
}

/** Wordmark on a white plate, for colored/dark surfaces (e.g. the dark footer). */
export function WordmarkPlate({ height = 28 }: { height?: number }) {
  return (
    <div className="flex w-fit items-center rounded-lg bg-white px-2.5 py-1.5">
      <Wordmark height={height} />
    </div>
  );
}
