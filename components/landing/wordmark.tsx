import Link from 'next/link';

/** Three nodes joined by a descent line: the tree's own notation as a mark. */
export function Wordmark() {
  return (
    <Link
      href="/"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}
    >
      <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
        <path d="M11 6.5v4.5M4 17v-2.5h14V17" fill="none" stroke="var(--bronze)" strokeWidth="1.1" />
        <circle cx="11" cy="4" r="2.6" fill="none" stroke="var(--gold)" strokeWidth="1.2" />
        <circle cx="4" cy="19.4" r="2.6" fill="var(--gold)" />
        <circle cx="18" cy="19.4" r="2.6" fill="none" stroke="var(--gold)" strokeWidth="1.2" />
      </svg>
      <span
        style={{
          fontFamily: 'var(--font-spectral), Georgia, serif',
          fontSize: '1.3125rem',
          fontWeight: 400,
          letterSpacing: '0.01em',
          color: 'var(--ivory)',
        }}
      >
        Family Tree
      </span>
    </Link>
  );
}
