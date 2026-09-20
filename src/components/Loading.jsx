export function Spinner({ size = 16, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        className="spinner"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label ? <span>{label}</span> : null}
    </span>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function PageLoader({ label = "Loading…" }) {
  return (
    <div
      className="grid min-h-[60vh] place-items-center px-6"
      role="status"
      aria-live="polite"
    >
      <div className="neu-in flex items-center gap-3 px-6 py-4 text-muted">
        <Spinner size={18} />
        <span className="label-caps">{label}</span>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="neu p-5">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="mt-4 h-5 w-2/3" />
      <Skeleton className="mt-3 h-3 w-1/2" />
      <Skeleton className="mt-4 h-8 w-1/2" />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="neu-sm p-4">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="mt-3 h-3 w-1/3" />
    </div>
  );
}
