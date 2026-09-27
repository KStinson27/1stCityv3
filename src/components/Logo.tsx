type LogoProps = {
  size?: number;
  textColor?: string;
};

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg bg-white"
      style={{ width: size, height: size }}
    >
      <span
        className="font-bold text-primary"
        style={{ fontSize: size * 0.42, letterSpacing: "-0.02em" }}
      >
        1C
      </span>
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
