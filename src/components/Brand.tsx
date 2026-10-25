interface BrandMarkProps {
  className?: string;
}

/** A "T" whose stem turns into a download arrow. */
export function BrandMark({ className = '' }: BrandMarkProps) {
  return (
    <span className={`brand-mark ${className}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M9.5 9.5h13M16 9.5v14.5m0 0-5.25-5.25M16 24l5.25-5.25"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

interface BrandProps {
  compact?: boolean;
  className?: string;
}

export function Brand({ compact = false, className = '' }: BrandProps) {
  return (
    <span className={`brand ${className}`} aria-label="TSun Studio">
      <BrandMark />
      <span className="brand-copy">
        <span className="brand-name">
          TSun{!compact && <span className="brand-suffix">Studio</span>}
        </span>
        {!compact && <span className="brand-tagline">TikTok downloader</span>}
      </span>
    </span>
  );
}
