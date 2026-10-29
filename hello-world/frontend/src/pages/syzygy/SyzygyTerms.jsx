// Syzygy terms of service — the "Application terms of service link" on
// the Google Auth Platform branding screen. Thin, honest wrapper around
// the MIT license plus the Google-integration ground rules.

import useDocumentMeta from '../../hooks/useDocumentMeta.js';
import { syz, REPO_URL, CONTACT_EMAIL } from './syzygyTheme.js';
import {
  PaperPage,
  PaperContainer,
  InkLabel,
  SyzygyFooter,
  syzH2
} from './SyzygyChrome.jsx';

export default function SyzygyTerms() {
  useDocumentMeta({
    title: 'Terms of Service — Syzygy | Penumbra',
    description:
      'Syzygy terms of service: free, MIT-licensed open-source software ' +
      'provided as-is. Your content is yours.',
    canonical: 'https://penumbra-tech.com/syzygy/terms'
  });

  return (
    <PaperPage>
      <section style={{ padding: '4rem 0 4.5rem' }}>
        <PaperContainer narrow>
          <InkLabel>Syzygy</InkLabel>
          <h1 style={h1Style}>Terms of Service</h1>
          <p style={stampStyle}>Last updated: October 28, 2026</p>

          <h2 style={{ ...syzH2, marginTop: '1.2em' }}>The software</h2>
          <p style={bodyStyle}>
            Syzygy is free, open-source software distributed under the{' '}
            <a
              href={`${REPO_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              MIT License
            </a>
            . By using it you accept that license&apos;s terms,
            summarized below.
          </p>

          <h2 style={syzH2}>No warranty</h2>
          <p style={bodyStyle}>
            The software is provided &ldquo;as is&rdquo;, without
            warranty of any kind, express or implied, including but not
            limited to the warranties of merchantability, fitness for a
            particular purpose, and noninfringement. You are responsible
            for backing up your own data.
          </p>

          <h2 style={syzH2}>Limitation of liability</h2>
          <p style={bodyStyle}>
            In no event shall the authors or copyright holders be liable
            for any claim, damages, or other liability, whether in an
            action of contract, tort, or otherwise, arising from, out
            of, or in connection with the software or the use of or
            other dealings in the software.
          </p>

          <h2 style={syzH2}>Your content</h2>
          <p style={bodyStyle}>
            Your documents and projects are yours. Syzygy claims no
            rights over anything you create with it. If you link Google
            Drive, your use of Drive remains governed by{' '}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              Google&apos;s Terms of Service
            </a>
            .
          </p>

          <h2 style={syzH2}>Acceptable use</h2>
          <p style={bodyStyle}>
            You agree not to use Syzygy&apos;s Google integration in
            ways that violate Google&apos;s API policies or applicable
            law.
          </p>

          <h2 style={syzH2}>Changes</h2>
          <p style={bodyStyle}>
            These terms may be revised as the project evolves; the
            current version is always at this page and in the{' '}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              repository
            </a>
            .
          </p>

          <h2 style={syzH2}>Contact</h2>
          <p style={bodyStyle}>
            <a href={`mailto:${CONTACT_EMAIL}`} style={linkStyle}>
              {CONTACT_EMAIL}
            </a>
          </p>
        </PaperContainer>
      </section>
      <SyzygyFooter />
    </PaperPage>
  );
}

const h1Style = {
  fontFamily: syz.font,
  fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  margin: '0.3em 0 0.15em',
  color: syz.text
};

const stampStyle = {
  fontFamily: syz.mono,
  fontSize: '0.8rem',
  color: syz.muted,
  margin: '0 0 2em'
};

const bodyStyle = {
  color: syz.text2,
  fontSize: '1.02rem',
  maxWidth: '62ch'
};

const linkStyle = { color: syz.accent };
