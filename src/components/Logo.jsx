export function LogoMark({ size = 30, className = "" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="CostLog"
      fill="none"
    >
      <rect
        x="2.6"
        y="2.6"
        width="26.8"
        height="26.8"
        rx="8.4"
        fill="currentColor"
        opacity="0.12"
      />
      <rect
        x="2.6"
        y="2.6"
        width="26.8"
        height="26.8"
        rx="8.4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9.4 12.1h13.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9.4 16.3h8.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9.4 20.5h4.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="21.3" cy="20.5" r="1.9" fill="currentColor" />
    </svg>
  );
}

export default function Logo({ size = 30 }) {
  return (
    <span className="flex items-center gap-2.5 text-indigo">
      <LogoMark size={size} />
      <span className="font-display text-[1.35rem] font-semibold tracking-[-0.01em] text-ink">
        Cost<span className="text-indigo">Log</span>
      </span>
    </span>
  );
}
