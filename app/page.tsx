'use client';

import Link from 'next/link';
import { LanguageToggle } from '@/components/landing/language-toggle';
import { Wordmark } from '@/components/landing/wordmark';
import { TreeFigure } from '@/components/family-tree/tree-figure';
import { useLocale } from '@/lib/i18n/provider';
import { sampleTree } from '@/lib/sample-tree';
import { layoutTree } from '@/lib/tree-layout';

// Deterministic, so it is computed once at module scope and the landing page
// ships as static HTML with the real engine's output already in it.
const demoTree = sampleTree();
const demoLayout = layoutTree(demoTree);

export default function LandingPage() {
  const { t } = useLocale();

  return (
    <>
      <a
        href="#main"
        className="btn btn-quiet"
        style={{ position: 'absolute', left: '-9999px', top: '0.5rem', zIndex: 10 }}
        onFocus={(event) => {
          event.currentTarget.style.left = '0.5rem';
        }}
        onBlur={(event) => {
          event.currentTarget.style.left = '-9999px';
        }}
      >
        {t.nav.skipToContent}
      </a>

      <header style={{ borderBottom: '1px solid var(--rule)' }}>
        <div
          className="lineage"
          style={{ maxWidth: '82rem', margin: '0 auto', padding: '1.125rem clamp(1rem, 4vw, 2.5rem)' }}
        >
          <div />
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
            <Wordmark />
            <nav style={{ display: 'flex', gap: '1.5rem', marginLeft: 'auto' }}>
              <a href="#how" className="micro" style={{ color: 'var(--ivory-dim)', textDecoration: 'none' }}>
                {t.nav.howItWorks}
              </a>
              <a href="#privacy" className="micro" style={{ color: 'var(--ivory-dim)', textDecoration: 'none' }}>
                {t.nav.privacy}
              </a>
            </nav>
            <LanguageToggle />
            <Link href="/create" className="btn btn-primary" style={{ padding: '0.625rem 1.25rem' }}>
              {t.nav.create}
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero: the first thing on the page is the layout engine's real output. */}
        <section
          className="lineage"
          style={{ maxWidth: '82rem', margin: '0 auto', padding: 'clamp(2.5rem, 6vw, 5.5rem) clamp(1rem, 4vw, 2.5rem) clamp(3rem, 7vw, 6rem)' }}
        >
          <div className="lineage-rule" data-cap="start">
            <span className="lineage-node" data-fill="solid" />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 22rem), 1fr))',
              gap: 'clamp(2rem, 5vw, 4rem)',
              alignItems: 'center',
            }}
          >
            <div>
              <h1 className="display" style={{ margin: '0 0 1.5rem', maxWidth: '20ch' }}>
                {t.hero.title}
              </h1>
              <p className="lede" style={{ margin: '0 0 2.25rem' }}>
                {t.hero.lede}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem' }}>
                <Link href="/create" className="btn btn-primary">
                  {t.hero.create}
                </Link>
                <Link href="/create?open=1" className="btn btn-quiet">
                  {t.hero.open}
                </Link>
              </div>
              <p className="micro" style={{ margin: '1.75rem 0 0', color: 'var(--grey)' }}>
                {t.hero.privacyNote}
              </p>
            </div>

            <figure style={{ margin: 0 }}>
              <TreeFigure tree={demoTree} layout={demoLayout} />
              <figcaption className="micro" style={{ marginTop: '1.25rem', color: 'var(--grey)' }}>
                {t.hero.figureCaption}
              </figcaption>
            </figure>
          </div>
        </section>

        {/* The four steps really are a generational sequence, so they are
            marked with the tree's own generation notation. */}
        <section
          id="how"
          className="lineage"
          style={{
            maxWidth: '82rem',
            margin: '0 auto',
            padding: 'clamp(2.5rem, 6vw, 4.5rem) clamp(1rem, 4vw, 2.5rem)',
            borderTop: '1px solid var(--rule)',
          }}
        >
          <div className="lineage-rule">
            <span className="lineage-node" />
          </div>

          <div>
            <h2 className="heading" style={{ margin: '0 0 2.75rem', maxWidth: '26ch' }}>
              {t.how.title}
            </h2>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {t.how.steps.map((step, index) => (
                <li
                  key={step.marker}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(3.5rem, auto) minmax(0, 1fr)',
                    gap: 'clamp(1rem, 3vw, 2.5rem)',
                    padding: '1.75rem 0',
                    borderTop: index === 0 ? 'none' : '1px solid rgba(201, 164, 92, 0.1)',
                  }}
                >
                  <span className="gen-marker">{step.marker}</span>
                  <div>
                    <h3 className="title" style={{ margin: '0 0 0.5rem' }}>
                      {step.title}
                    </h3>
                    <p className="prose-quiet" style={{ margin: 0 }}>
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="privacy"
          className="lineage"
          style={{
            maxWidth: '82rem',
            margin: '0 auto',
            padding: 'clamp(2.5rem, 6vw, 4.5rem) clamp(1rem, 4vw, 2.5rem) clamp(3rem, 7vw, 5rem)',
            borderTop: '1px solid var(--rule)',
          }}
        >
          <div className="lineage-rule" data-cap="end">
            <span className="lineage-node" />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))',
              gap: 'clamp(1.75rem, 4vw, 3.5rem)',
            }}
          >
            <div>
              <h2 className="heading" style={{ margin: '0 0 1.125rem', maxWidth: '22ch' }}>
                {t.privacy.title}
              </h2>
              <p className="prose-quiet" style={{ margin: 0, color: 'var(--ivory-dim)' }}>
                {t.privacy.body}
              </p>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', alignSelf: 'center' }}>
              {t.privacy.points.map((point) => (
                <li
                  key={point}
                  className="micro"
                  style={{
                    padding: '0.8125rem 0',
                    borderBottom: '1px solid rgba(201, 164, 92, 0.1)',
                    color: 'var(--ivory-dim)',
                  }}
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: '1px solid var(--rule)' }}>
        <div
          className="lineage"
          style={{ maxWidth: '82rem', margin: '0 auto', padding: '1.75rem clamp(1rem, 4vw, 2.5rem)' }}
        >
          <div />
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem 1.5rem',
              alignItems: 'baseline',
              justifyContent: 'space-between',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-spectral), Georgia, serif',
                fontStyle: 'italic',
                fontSize: '1.125rem',
                color: 'var(--ivory-dim)',
              }}
            >
              {t.footer.tagline}
            </p>
            <p className="micro" style={{ margin: 0, color: 'var(--grey)' }}>
              {t.footer.meta}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
