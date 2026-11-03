'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/landing/wordmark';
import { LanguageToggle } from '@/components/landing/language-toggle';
import { useLocale } from '@/lib/i18n/provider';
import { useFamilyStore } from '@/store/family-store';
import { memberCount } from '@/lib/family-engine';
import { sampleTree } from '@/lib/sample-tree';
import type { Gender } from '@/types/family';

/**
 * Step 1 of the wizard: the person the tree is built around.
 *
 * Steps 2 to 7 (grandparents, parents, children, descendants, other relatives,
 * review) are not built yet. This writes to the real store, so whatever is
 * entered here carries into them.
 */
export default function CreatePage() {
  const { t } = useLocale();
  const tree = useFamilyStore((s) => s.tree);
  const updatePerson = useFamilyStore((s) => s.updatePerson);
  const load = useFamilyStore((s) => s.load);
  const root = tree.people[tree.rootId];
  const [name, setName] = useState(root?.fullName ?? '');
  const [gender, setGender] = useState<Gender>(root?.gender ?? 'unspecified');

  const commit = () => {
    updatePerson(tree.rootId, { fullName: name, gender });
  };

  return (
    <>
      <header style={{ borderBottom: '1px solid var(--rule)' }}>
        <div
          style={{
            maxWidth: '82rem',
            margin: '0 auto',
            padding: '1.125rem clamp(1rem, 4vw, 2.5rem)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <Wordmark />
          <span className="micro" style={{ marginLeft: 'auto', color: 'var(--grey)' }}>
            {memberCount(tree)} {t.stats.members}
          </span>
          <LanguageToggle />
        </div>
      </header>

      <main
        className="lineage"
        style={{ maxWidth: '82rem', margin: '0 auto', padding: 'clamp(2.5rem, 6vw, 4.5rem) clamp(1rem, 4vw, 2.5rem)' }}
      >
        <div className="lineage-rule" data-cap="start">
          <span className="lineage-node" data-fill="solid" />
        </div>

        <div style={{ maxWidth: '34rem' }}>
          <p className="gen-marker" style={{ margin: '0 0 0.75rem' }}>
            G0
          </p>
          <h1 className="heading" style={{ margin: '0 0 1rem' }}>
            {t.create.title}
          </h1>
          <p className="prose-quiet" style={{ margin: '0 0 2.5rem' }}>
            {t.create.lede}
          </p>

          <label htmlFor="name" className="micro" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--ivory-dim)' }}>
            {t.create.nameLabel}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={commit}
            autoComplete="off"
            placeholder={t.create.namePlaceholder}
            style={{
              width: '100%',
              minHeight: '48px',
              padding: '0.75rem 0.875rem',
              marginBottom: '1.75rem',
              border: '1px solid rgba(242, 237, 228, 0.18)',
              borderRadius: '3px',
              background: 'var(--ink-raise)',
              color: 'var(--ivory)',
              font: 'inherit',
            }}
          />

          <fieldset style={{ margin: '0 0 2.5rem', padding: 0, border: 0 }}>
            <legend className="micro" style={{ padding: 0, marginBottom: '0.625rem', color: 'var(--ivory-dim)' }}>
              {t.create.genderLabel}
            </legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
              {(['male', 'female', 'unspecified'] as Gender[]).map((option) => (
                <label
                  key={option}
                  className="micro"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    minHeight: '44px',
                    padding: '0 1rem',
                    border: `1px solid ${gender === option ? 'var(--gold)' : 'rgba(242, 237, 228, 0.18)'}`,
                    borderRadius: '3px',
                    background: gender === option ? 'rgba(201, 164, 92, 0.12)' : 'transparent',
                    color: gender === option ? 'var(--gold)' : 'var(--ivory-dim)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={gender === option}
                    onChange={() => {
                      setGender(option);
                      updatePerson(tree.rootId, { gender: option });
                    }}
                    style={{ accentColor: 'var(--gold)' }}
                  />
                  {t.create.gender[option]}
                </label>
              ))}
            </div>
          </fieldset>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.875rem',
              paddingTop: '1.75rem',
              borderTop: '1px solid var(--rule)',
            }}
          >
            <Link href="/" className="btn btn-quiet">
              {t.create.back}
            </Link>
            <button type="button" className="btn btn-quiet" onClick={() => load(sampleTree())}>
              {t.create.loadExample}
            </button>
          </div>

          <p className="micro" style={{ margin: '2rem 0 0', color: 'var(--grey)' }}>
            {t.create.notBuiltYet}
          </p>
        </div>
      </main>
    </>
  );
}
