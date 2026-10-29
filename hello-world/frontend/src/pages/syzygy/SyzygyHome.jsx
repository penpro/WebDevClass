// Syzygy product portal — landing page.
//
// Canonical home page for the Syzygy desktop app, and the "Application
// home page" registered on the Google Auth Platform branding screen
// (authorized domain: penumbra-tech.com). It must describe the product
// and its Drive usage honestly — Google reviews this page.
//
// Copy voice is local-first, never absolute-offline: "nothing ever
// leaves this PC" is Aphelion's claim; Syzygy has optional Google Drive
// collaboration, so the honest framing is "local by default, shared on
// purpose".

import { Link } from 'react-router-dom';
import useDocumentMeta from '../../hooks/useDocumentMeta.js';
import { syz, REPO_URL, DOWNLOAD_URL } from './syzygyTheme.js';
import {
  PaperPage,
  PaperContainer,
  PaperButton,
  InkLabel,
  SyzygyMark,
  SyzygyFooter,
  syzH2
} from './SyzygyChrome.jsx';

const FEATURES = [
  {
    title: 'Research projects',
    body:
      'Collect sources, notes, drafts, and conversations in one workspace. ' +
      'Projects live on your machine and stay organized by the questions ' +
      'you are actually asking.'
  },
  {
    title: 'Ask your sources',
    body:
      'An Ask mode with configurable experts puts a locally running AI ' +
      'engine to work on your own documents — question a project’s ' +
      'sources, draft against them, and keep a running transcript per tab.'
  },
  {
    title: 'Collaborate through Drive',
    body:
      'Optionally link a Google account and share a project folder with ' +
      'collaborators. Syzygy uses Google’s narrowest Drive permission ' +
      '(drive.file): it can only see folders and files it created itself.'
  },
  {
    title: 'Local-first, open source',
    body:
      'The AI engine runs on your computer; your documents are yours. MIT ' +
      'licensed, with the full source on GitHub and in-app updates from ' +
      'signed releases.'
  }
];

export default function SyzygyHome() {
  useDocumentMeta({
    title: 'Syzygy — local-first collaborative research workspace | Penumbra',
    description:
      'Syzygy is a free, open-source desktop app for collaborative research: ' +
      'local AI over your own documents, research projects, and optional ' +
      'Google Drive folder collaboration using the narrow drive.file scope. ' +
      'Sister app to Aphelion, by Penumbra.',
    canonical: 'https://penumbra-tech.com/syzygy'
  });

  return (
    <PaperPage>
      {/* ============================ Hero ============================ */}
      <section
        style={{
          padding: '4.5rem 0 3.5rem',
          borderBottom: `1px solid ${syz.border}`
        }}
      >
        <PaperContainer>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.4rem',
              flexWrap: 'wrap',
              marginBottom: '1.6rem'
            }}
          >
            <SyzygyMark size={48} />
            <InkLabel>Penumbra product · Open source · Windows</InkLabel>
          </div>
          <h1
            style={{
              fontFamily: syz.font,
              fontSize: 'clamp(2.1rem, 4.5vw, 3.2rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.08,
              margin: '0 0 0.5em',
              maxWidth: '22ch'
            }}
          >
            Syzygy: research together, in alignment.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: '62ch',
              fontSize: '1.2rem',
              color: syz.text2
            }}
          >
            A free, open-source desktop workspace for collaborative
            research. Draft, question your sources with a locally running
            AI engine, and — when you choose to — share a project folder
            with collaborators over Google Drive. Local by default, shared
            on purpose.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '0.9rem',
              flexWrap: 'wrap',
              marginTop: '2rem'
            }}
          >
            <PaperButton href={DOWNLOAD_URL}>Download for Windows ↓</PaperButton>
            <PaperButton href={REPO_URL} variant="secondary">
              View source on GitHub ↗
            </PaperButton>
          </div>
          <p
            style={{
              margin: '1.1rem 0 0',
              fontFamily: syz.mono,
              fontSize: '0.8rem',
              color: syz.muted
            }}
          >
            Early development — installers ship from GitHub releases and
            update themselves in-app.
          </p>
        </PaperContainer>
      </section>

      {/* ========================== Features ========================== */}
      <section style={{ padding: '3.5rem 0', background: syz.panel }}>
        <PaperContainer>
          <InkLabel>What it does</InkLabel>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.2rem',
              marginTop: '1.4rem'
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  background: syz.bg,
                  border: `1px solid ${syz.border}`,
                  borderRadius: syz.radius,
                  boxShadow: syz.shadow,
                  padding: '1.4rem 1.5rem'
                }}
              >
                <h3
                  style={{
                    margin: '0 0 0.5em',
                    fontSize: '1.08rem',
                    fontWeight: 600,
                    color: syz.accent
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ margin: 0, color: syz.text2, fontSize: '0.98rem' }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </PaperContainer>
      </section>

      {/* ===================== Drive, honestly ======================== */}
      <section
        style={{
          padding: '3.5rem 0',
          borderTop: `1px solid ${syz.border}`,
          borderBottom: `1px solid ${syz.border}`
        }}
      >
        <PaperContainer narrow>
          <InkLabel>Google Drive, honestly</InkLabel>
          <h2 style={{ ...syzH2, marginTop: '0.6em' }}>
            The narrowest scope Google offers.
          </h2>
          <p style={{ color: syz.text2, maxWidth: '62ch' }}>
            Collaboration is opt-in. If you link a Google account, Syzygy
            requests only the <code style={codeStyle}>drive.file</code>{' '}
            scope — it can read and write the project folders it creates,
            and nothing else in your Drive. Tokens stay on your computer,
            there is no Penumbra server in the middle, and you can unlink
            from inside the app or revoke access from your Google account
            at any time. The details live in the{' '}
            <Link to="/syzygy/privacy" style={inlineLink}>
              privacy policy
            </Link>
            .
          </p>
        </PaperContainer>
      </section>

      {/* ======================= Brand family ========================= */}
      <section style={{ padding: '3.5rem 0 4rem' }}>
        <PaperContainer narrow>
          <InkLabel>Brand family</InkLabel>
          <h2 style={{ ...syzH2, marginTop: '0.6em' }}>
            Sister app to Aphelion.
          </h2>
          <p style={{ color: syz.text2, maxWidth: '62ch' }}>
            <em>Aphelion</em> is the point in an orbit farthest from the
            sun — the Penumbra app that keeps AI at the farthest point
            from the cloud. A <em>syzygy</em> is the moment bodies come
            into alignment — the Penumbra app for working in alignment
            with other people. Same engineering, same local-first spine,
            two different jobs.
          </p>
          <div style={{ marginTop: '1.4rem' }}>
            <PaperButton to="/projects/aphelion" variant="secondary">
              Meet Aphelion →
            </PaperButton>
          </div>
        </PaperContainer>
      </section>

      <SyzygyFooter />
    </PaperPage>
  );
}

const codeStyle = {
  fontFamily: syz.mono,
  fontSize: '0.88em',
  background: syz.bg2,
  border: `1px solid ${syz.border}`,
  borderRadius: '4px',
  padding: '0.08em 0.35em'
};

const inlineLink = { color: syz.accent };
