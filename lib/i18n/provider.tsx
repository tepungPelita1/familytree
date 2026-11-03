'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { type Locale, type Messages, defaultLocale, locales, messages } from './messages';

const STORAGE_KEY = 'familytree.locale';

interface LocaleValue {
  locale: Locale;
  t: Messages;
  setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // The language choice is a display preference, not family data, so it is the
  // one thing we are allowed to keep in localStorage.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && locales.includes(stored as Locale)) setLocaleState(stored as Locale);
    } catch {
      // Private windows and blocked site data both throw here. English stands.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not being able to remember the choice is not worth an error.
    }
  }, []);

  const value = useMemo<LocaleValue>(
    () => ({ locale, t: messages[locale], setLocale }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('useLocale must be used inside a LocaleProvider');
  return value;
}
