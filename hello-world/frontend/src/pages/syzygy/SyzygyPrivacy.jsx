// Syzygy privacy policy — the "Application privacy policy link" on the
// Google Auth Platform branding screen. Google (and users deciding
// whether to link Drive) read this page, so it states plainly what the
// app does and does not collect. Keep it accurate as Drive usage
// evolves; the app repo's docs/GOOGLE-DRIVE.md is the engineering
// source of truth.

import useDocumentMeta from '../../hooks/useDocumentMeta.js';
import { syz, REPO_URL, CONTACT_EMAIL } from './syzygyTheme.js';
import {
  PaperPage,
  PaperContainer,
  InkLabel,
  SyzygyFooter,
  syzH2
} from './SyzygyChrome.jsx';

export default function SyzygyPrivacy() {
  useDocumentMeta({
    title: 'Privacy Policy — Syzygy | Penumbra',
    description:
      'Syzygy privacy policy: no accounts, no analytics, no telemetry. ' +
      'Optional Google Drive collaboration uses the narrow drive.file ' +
      'scope; tokens stay on your computer.',
    canonical: 'https://penumbra-tech.com/syzygy/privacy'
  });

  return (
    <PaperPage>
      <section style={{ padding: '4rem 0 4.5rem' }}>
        <PaperContainer narrow>
          <InkLabel>Syzygy</InkLabel>
          <h1 style={h1Style}>Privacy Policy</h1>
          <p style={stampStyle}>Last updated: October 28, 2026</p>

          <p style={bodyStyle}>
            Syzygy is a local-first desktop application. This policy
            describes what data the application handles and what, if
            anything, leaves your computer.
          </p>

          <h2 style={syzH2}>What we collect</h2>
          <p style={bodyStyle}>
            <strong>Nothing.</strong> Syzygy has no accounts, no
            analytics, no telemetry, and no servers of ours. Your
            documents, projects, settings, and AI conversations are
            stored on your own computer. We (Penumbra) never receive,
            see, or store any of your data.
          </p>

          <h2 style={syzH2}>Local AI processing</h2>
          <p style={bodyStyle}>
            Syzygy&apos;s built-in AI engine runs on your machine.
            Prompts and documents processed by the local engine are not
            sent to any external service.
          </p>

          <h2 style={syzH2}>Google Drive (optional)</h2>
          <p style={bodyStyle}>
            If you choose to link a Google account for collaboration,
            Syzygy requests the <code style={codeStyle}>drive.file</code>{' '}
            OAuth scope. This is Google&apos;s narrowest Drive
            permission: Syzygy can only access files and folders that
            Syzygy itself created. It cannot read the rest of your
            Drive.
          </p>
          <ul style={{ ...bodyStyle, paddingLeft: '1.3rem' }}>
            <li style={liStyle}>
              Drive access is used solely to store and sync the shared
              project folders you create in the app, directly between
              your computer and Google&apos;s Drive API.
            </li>
            <li style={liStyle}>
              Your OAuth tokens are stored locally on your computer and
              are never transmitted to us.
            </li>
            <li style={liStyle}>
              You can disconnect at any time from within the app, and
              you can revoke Syzygy&apos;s access entirely at{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                myaccount.google.com/permissions
              </a>
              .
            </li>
          </ul>
          <p style={bodyStyle}>
            Syzygy&apos;s use and transfer of information received from
            Google APIs adheres to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>

          <h2 style={syzH2}>Updates</h2>
          <p style={bodyStyle}>
            The app checks GitHub Releases for new versions. This
            request carries no personal data beyond what any ordinary
            HTTPS request includes.
          </p>

          <h2 style={syzH2}>Changes to this policy</h2>
          <p style={bodyStyle}>
            Changes will be posted to this page, versioned alongside the{' '}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              open-source repository
            </a>
            .
          </p>

          <h2 style={syzH2}>Contact</h2>
          <p style={bodyStyle}>
            Questions:{' '}
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

const liStyle = { marginBottom: '0.5em' };

const linkStyle = { color: syz.accent };

const codeStyle = {
  fontFamily: syz.mono,
  fontSize: '0.88em',
  background: syz.bg2,
  border: `1px solid ${syz.border}`,
  borderRadius: '4px',
  padding: '0.08em 0.35em'
};
