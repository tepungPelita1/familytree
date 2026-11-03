'use client';

import { useLocale } from '@/lib/i18n/provider';
import { locales, messages } from '@/lib/i18n/messages';

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t.nav.language}
      style={{ display: 'inline-flex', border: '1px solid var(--rule)', borderRadius: '3px', overflow: 'hidden' }}
    >
      {locales.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={active}
            title={messages[option].localeName}
            style={{
              minHeight: '40px',
              padding: '0 0.875rem',
              border: 0,
              background: active ? 'rgba(201, 164, 92, 0.16)' : 'transparent',
              color: active ? 'var(--gold)' : 'var(--grey)',
              font: 'inherit',
              fontSize: 'var(--step-micro)',
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {option === 'en' ? 'EN' : 'BM'}
          </button>
        );
      })}
    </div>
  );
}
