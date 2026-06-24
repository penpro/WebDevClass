// The full DIY playbook.
//
// Long-form, opinionated, honest. Walks an unfamiliar reader from "I
// have an AWS account email open in a tab" to "I have a working,
// secured, monitored, backed-up production website on my own EC2
// instance for $15/month." Thirteen chapters plus a foreword and a
// closing CTA.
//
// Renders as a long-scroll React page with a sticky TOC on the left,
// content on the right, and a "Save as PDF" button at the top right
// that triggers the browser's print dialog. Print CSS strips the
// nav/footer/TOC/buttons and reformats code blocks for paper, so the
// PDF the visitor saves is a clean ~40-page document.
//
// The framing isn't "this is hard, hire me." It's "here is the actual
// playbook; the catch is the 80 hours you'll spend learning what
// every error message means while you're tired at 11pm." The closer
// makes the case that paying someone whose full-time job is this is
// often cheaper than your own time.

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  space
} from '../theme.js';
import Container from '../components/Container.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import HudLabel from '../components/HudLabel.jsx';

const CAL_BOOKING_URL = 'https://cal.com/wesley-weaver-avi7mu/30min';

// Single source of truth for chapter metadata. The TOC reads from here,
// the chapter sections render off this, the print-page-break CSS keys
// off the id. To rename / re-order chapters: edit this array.
const CHAPTERS = [
  { id: 'foreword',     num: '0',  title: 'Yes, you can. Here is the catch.' },
  { id: 'aws-account',  num: '1',  title: 'AWS account, IAM, billing alarm' },
  { id: 'ec2-launch',   num: '2',  title: 'Launch an EC2 instance' },
  { id: 'server-setup', num: '3',  title: 'First server setup' },
  { id: 'swap',         num: '4',  title: 'Swap and the t3.micro reality' },
  { id: 'mysql',        num: '5',  title: 'MySQL' },
  { id: 'node-nginx',   num: '6',  title: 'Node, nginx, PM2' },
  { id: 'dns',          num: '7',  title: 'DNS and Route 53' },
  { id: 'tls',          num: '8',  title: 'Let’s Encrypt and HTTPS' },
  { id: 'express',      num: '9',  title: 'The Express backend patterns that matter' },
  { id: 'react',        num: '10', title: 'The React frontend and the deploy script' },
  { id: 'headers',      num: '11', title: 'Security headers, CSP, compression' },
  { id: 'ops',          num: '12', title: 'Operations: backups, monitoring, recovery' },
  { id: 'honest',       num: '13', title: 'The honest chapter' }
];

// ---------------------------------------------------------------------- //
// Helper components
// ---------------------------------------------------------------------- //

function ChapterTitle({ num, title, id }) {
  return (
    <div style={{ marginBottom: space.lg }}>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: fontSizes.xs,
          color: colors.cyan,
          textTransform: 'uppercase',
          letterSpacing: '0.12em'
        }}
      >
        Chapter {num}
      </div>
      <h2
        id={id}
        style={{
          fontFamily: fonts.heading,
          fontSize: fontSizes['2xl'],
          fontWeight: fontWeights.bold,
          color: colors.text,
          margin: `${space.xs} 0 0`,
          letterSpacing: '-0.015em',
          lineHeight: 1.2,
          scrollMarginTop: '90px'
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function P({ children }) {
  return (
    <p
      style={{
        margin: `0 0 ${space.md}`,
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        lineHeight: 1.7
      }}
    >
      {children}
    </p>
  );
}

function H3({ children, id }) {
  return (
    <h3
      id={id}
      style={{
        fontFamily: fonts.heading,
        fontSize: fontSizes.lg,
        fontWeight: fontWeights.semibold,
        color: colors.text,
        margin: `${space.xl} 0 ${space.sm}`,
        letterSpacing: '-0.005em',
        scrollMarginTop: '90px'
      }}
    >
      {children}
    </h3>
  );
}

function C({ children }) {
  return (
    <code
      style={{
        fontFamily: fonts.mono,
        fontSize: '0.92em',
        color: colors.accent,
        background: colors.codeBg,
        padding: '0.12em 0.4em',
        borderRadius: 4
      }}
    >
      {children}
    </code>
  );
}

function CodeBlock({ children, label }) {
  return (
    <div style={{ margin: `${space.md} 0 ${space.lg}` }}>
      {label ? (
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: fontSizes.xs,
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: space.xs
          }}
        >
          {label}
        </div>
      ) : null}
      <pre
        className="guide-code-block"
        style={{
          margin: 0,
          padding: space.md,
          background: colors.codeBg,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          fontFamily: fonts.mono,
          fontSize: fontSizes.sm,
          lineHeight: 1.5,
          color: colors.text,
          overflowX: 'auto',
          whiteSpace: 'pre',
          tabSize: 2
        }}
      >
        {children}
      </pre>
    </div>
  );
}

function Gotcha({ children, title = 'What actually goes wrong here' }) {
  return (
    <aside
      className="guide-gotcha"
      style={{
        margin: `${space.xl} 0`,
        padding: `${space.lg} ${space.xl}`,
        borderRadius: 12,
        background: 'rgba(192, 132, 252, 0.06)',
        border: `1px dashed ${colors.magenta}`
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: fontSizes.xs,
          color: colors.magenta,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          marginBottom: space.sm
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: fontSizes.md,
          color: colors.text,
          lineHeight: 1.7
        }}
      >
        {children}
      </div>
    </aside>
  );
}

function UL({ children }) {
  return (
    <ul
      style={{
        margin: `0 0 ${space.md}`,
        paddingLeft: space.xl,
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        lineHeight: 1.7
      }}
    >
      {children}
    </ul>
  );
}

// ---------------------------------------------------------------------- //
// Page
// ---------------------------------------------------------------------- //

export default function Guide() {
  useEffect(() => {
    document.title = 'The DIY playbook — Penumbra Tech';
  }, []);

  return (
    <>
      {/* Print-only stylesheet. Strips the nav, footer, TOC sidebar, and
          the buttons; keeps the content; restyles code blocks and gotchas
          so they render cleanly on white paper. Forces a page break
          before each chapter (h2.scroll-margin gives the anchor space). */}
      <style>{`
        @media print {
          header, footer, .guide-no-print { display: none !important; }
          .guide-shell {
            display: block !important;
            background: #ffffff !important;
            color: #111111 !important;
            padding: 0 !important;
          }
          .guide-toc { display: none !important; }
          .guide-content {
            max-width: none !important;
            color: #111111 !important;
            padding: 0 !important;
          }
          .guide-content h1,
          .guide-content h2,
          .guide-content h3 {
            color: #000000 !important;
          }
          .guide-content p,
          .guide-content li {
            color: #222222 !important;
          }
          .guide-chapter {
            page-break-before: always;
          }
          .guide-chapter:first-of-type {
            page-break-before: avoid;
          }
          .guide-code-block {
            background: #f4f4f4 !important;
            color: #111111 !important;
            border: 1px solid #cccccc !important;
            white-space: pre-wrap !important;
            word-break: break-all !important;
            page-break-inside: avoid;
          }
          .guide-code-block code,
          .guide-content code {
            color: #5a3a8a !important;
            background: #f4f4f4 !important;
          }
          .guide-gotcha {
            background: #fef6e7 !important;
            border: 1px dashed #b08020 !important;
            color: #111111 !important;
            page-break-inside: avoid;
          }
          .guide-gotcha div {
            color: #111111 !important;
          }
          a {
            color: #1a3aa8 !important;
            text-decoration: underline;
          }
        }
      `}</style>

      {/* =============================== Hero =============================== */}
      <section
        className="guide-no-print"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['2xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`,
          background: colors.bg
        }}
      >
        <Container>
          <HudLabel tone="corona">The DIY playbook</HudLabel>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: fontWeights.bold,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text,
              maxWidth: '24ch'
            }}
          >
            Build it yourself. Here&apos;s the whole playbook.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: '62ch',
              fontSize: fontSizes.lg,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            Every step that got <Link to="/" style={{ color: colors.accent, textDecoration: 'none' }}>penumbra-tech.com</Link>{' '}
            from "I have an AWS signup tab open" to a working, secured,
            monitored, backed-up production website on my own EC2
            instance for fifteen dollars a month. Open source, opinionated,
            and honest about the parts that hurt.
          </p>
          <div
            style={{
              marginTop: space.xl,
              display: 'flex',
              gap: space.md,
              flexWrap: 'wrap'
            }}
          >
            <Button
              onClick={() => window.print()}
              variant="primary"
            >
              Save as PDF →
            </Button>
            <Button as={Link} to="/judgment" variant="secondary">
              Or read the judgement page first
            </Button>
            <Button
              as="a"
              href={CAL_BOOKING_URL}
              target="_blank"
              rel="noreferrer noopener"
              variant="ghost"
            >
              Or skip ahead and hire me
            </Button>
          </div>
          <p
            style={{
              marginTop: space.lg,
              fontSize: fontSizes.xs,
              fontFamily: fonts.mono,
              color: colors.textMuted,
              letterSpacing: '0.04em'
            }}
          >
            Approx. 40 pages printed · Single-engineer reality, no agency padding
          </p>
        </Container>
      </section>

      {/* ===================== Two-column shell (TOC + content) ===================== */}
      <div
        className="guide-shell"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 240px) minmax(0, 1fr)',
          gap: space['2xl'],
          maxWidth: '1180px',
          margin: '0 auto',
          padding: `${space['2xl']} ${space.lg}`
        }}
      >
        {/* Sticky TOC */}
        <aside
          className="guide-toc guide-no-print"
          style={{
            position: 'sticky',
            top: '88px',
            alignSelf: 'start',
            maxHeight: 'calc(100vh - 110px)',
            overflowY: 'auto',
            paddingRight: space.md,
            borderRight: `1px solid ${colors.borderSubtle}`
          }}
        >
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: fontSizes.xs,
              color: colors.cyan,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: space.md
            }}
          >
            Contents
          </div>
          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: fontSizes.sm,
              lineHeight: 1.6
            }}
          >
            {CHAPTERS.map((c) => (
              <li key={c.id} style={{ marginBottom: space.xs }}>
                <a
                  href={`#${c.id}`}
                  style={{
                    color: colors.textSecondary,
                    textDecoration: 'none',
                    display: 'block',
                    padding: '4px 6px',
                    borderRadius: 4
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.text;
                    e.currentTarget.style.background = colors.bgSoft;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.textSecondary;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ color: colors.textMuted, fontFamily: fonts.mono, marginRight: 8 }}>
                    {c.num.padStart(2, '0')}
                  </span>
                  {c.title}
                </a>
              </li>
            ))}
          </ol>
          <div
            style={{
              marginTop: space.xl,
              paddingTop: space.md,
              borderTop: `1px solid ${colors.borderSubtle}`
            }}
          >
            <button
              onClick={() => window.print()}
              style={{
                fontFamily: fonts.mono,
                fontSize: fontSizes.xs,
                color: colors.cyan,
                background: 'transparent',
                border: `1px solid ${colors.cyan}`,
                padding: '8px 12px',
                borderRadius: 4,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              Save as PDF
            </button>
          </div>
        </aside>

        {/* Content column */}
        <article
          className="guide-content"
          style={{
            maxWidth: '70ch'
          }}
        >
          {/* =========================== Chapter 0 — Foreword =========================== */}
          <section className="guide-chapter">
            <ChapterTitle num="0" id="foreword" title="Yes, you can. Here is the catch." />
            <P>
              This guide is the whole playbook. If you read it end to end
              and follow it, you will end up with a working, secured,
              monitored, backed-up production website on your own AWS
              account for about fifteen dollars a month. The site you
              are reading right now was built the same way.
            </P>
            <P>
              There are no AI gates, no NDA-protected secrets, no special
              knowledge required. Every step in here is documented
              somewhere on the public internet. I am writing it down in
              one place because the documentation is scattered across
              forty different blog posts, three AWS docs portals, six
              Stack Overflow answers (two of them out of date), and
              whatever Claude or ChatGPT happen to give you that hour.
            </P>
            <P>
              The catch is honest: this is a forty-to-eighty-hour project
              for somebody with zero experience. It is much faster the
              second time, like everything else in this kind of work.
              The hard part is not the steps. The hard part is what
              happens between the steps. A particular line of output
              you weren&apos;t expecting. A page in your browser that
              should be loading and isn&apos;t. A 502 that wasn&apos;t
              there an hour ago. The DNS change that is &ldquo;supposed
              to propagate instantly&rdquo; and hasn&apos;t. A cron job
              that runs silently for two weeks before you realise it
              failed every night.
            </P>
            <P>
              If at any point during this process you find yourself
              spending four hours on a single error message, that is
              normal. Take a walk. Come back. The error message is
              correct; you are just missing one piece of context the
              author of the tool assumed everybody would have. Half of
              this work is building up that context the first time.
            </P>
            <P>
              At the end of the guide there is a short, honest chapter
              about whether you should be doing this at all. If your
              hourly value of time is over fifty dollars and writing
              backend code is not what you actually want to be doing
              with your life, the math is straightforward: it is cheaper
              to pay somebody whose full-time job is this. That somebody
              can be me, or it can be one of the dozens of other capable
              engineers who do this work. Either way, the guide is
              here, and it is yours.
            </P>
            <Gotcha title="Before you start">
              Have these things ready before you sit down: a credit card
              you do not mind AWS having on file, a phone for two-factor
              auth, an email address you will keep for the long term
              (this becomes your AWS root account; treat it like a
              password manager entry), a domain name or a willingness to
              register one through Route 53 during chapter 7, and four
              hours of uninterrupted time for the first session. You
              will not finish in one session. Plan for at least three.
            </Gotcha>
          </section>

          {/* =========================== Chapter 1 — AWS account =========================== */}
          <section className="guide-chapter">
            <ChapterTitle num="1" id="aws-account" title="AWS account, IAM, billing alarm" />
            <P>
              Go to <a href="https://aws.amazon.com/" target="_blank" rel="noreferrer noopener" style={{ color: colors.cyan }}>aws.amazon.com</a>{' '}
              and create an account. Use an email address you will own
              for many years. AWS will ask for a credit card. They will
              put a one-dollar authorisation on it. Within the free tier
              your monthly bill for this stack runs about twelve to
              fifteen dollars. If your bill ever crosses fifty dollars
              without warning, something is wrong; we will set up an
              alarm for that in a minute.
            </P>

            <H3>Turn on MFA on the root account</H3>
            <P>
              The email address you just signed up with is now your
              <em> root account</em>. The root account can do anything,
              including close the account and wire money out via support
              tickets. If somebody phishes you out of the password, they
              have your whole AWS environment.
            </P>
            <P>
              Go to IAM &gt; Dashboard. There will be a banner saying
              &ldquo;Enable MFA on your root user.&rdquo; Do that now.
              Use an authenticator app (Aegis, 1Password, Authy). Do not
              use SMS; sim-swap attacks are real.
            </P>

            <H3>Create an IAM user for day-to-day work</H3>
            <P>
              The whole point of having a separate IAM user is that you
              do not log in as root for ordinary work. Create one user,
              give it AdministratorAccess (you can tighten this later
              when you know what you actually need), enable MFA on it
              too, and from now on use that login for everything.
            </P>
            <CodeBlock label="IAM user setup checklist">
{`1. IAM > Users > Create user
   - User name: yourname-admin
   - Provide console access: yes
   - Console password: autogenerated, store in your password manager
   - Require password reset on first login: no

2. Attach permissions policy: AdministratorAccess

3. After creation: IAM > Users > yourname-admin > Security credentials
   - Enable MFA (authenticator app, not SMS)

4. Bookmark the IAM sign-in URL it shows you on the user page:
   https://<account-id>.signin.aws.amazon.com/console`}
            </CodeBlock>

            <H3>Set a billing alarm</H3>
            <P>
              Set this once and forget it. If anything goes wrong (a
              forgotten EC2 instance, a misconfigured Lambda in a
              recursive loop, an accidental NAT gateway), you find out
              from this alarm and not from a $4,000 bill.
            </P>
            <CodeBlock label="Billing alarm">
{`1. Billing > Billing Preferences > turn on "Receive Billing Alerts"

2. CloudWatch > Alarms > Billing > Create alarm
   - Region: us-east-1 (billing metrics live here regardless of
     where your actual resources run)
   - Metric: Total Estimated Charge, USD
   - Threshold: > 30 USD (pick a number 2x your expected bill)
   - SNS topic: create one called "billing-alerts", subscribe
     your email
   - Confirm the email Amazon sends you to the SNS topic`}
            </CodeBlock>

            <Gotcha>
              <P>
                The most common way new AWS users get a surprise bill is
                <em> not </em> from EC2. It is from things that look
                free but are not, like an Elastic IP that you allocated
                and then released the instance from (AWS charges a few
                dollars a month for orphan EIPs), or a NAT gateway
                somebody created in a tutorial without explaining the
                $33-per-month per-AZ cost, or a CloudWatch log group
                that grows without an expiry policy.
              </P>
              <P>
                The billing alarm catches all of this within a day. The
                console&apos;s &ldquo;Free Tier usage&rdquo; widget is
                slower and less reliable.
              </P>
            </Gotcha>
          </section>

          {/* =========================== Chapter 2 — Launch EC2 =========================== */}
          <section className="guide-chapter">
            <ChapterTitle num="2" id="ec2-launch" title="Launch an EC2 instance" />
            <P>
              EC2 is &ldquo;a Linux server in the cloud you rent by the
              hour.&rdquo; That is the entire model. We are going to
              rent a small one, install everything on it ourselves, and
              learn what is actually on it. This is the part where most
              tutorials skip ahead to a managed service; we are not
              going to.
            </P>

            <H3>Pick a region</H3>
            <P>
              Regions are physically-different AWS data centres. The
              instance you launch in <C>us-east-2</C> (Ohio) cannot
              talk to a database you put in <C>us-west-1</C> (N.
              California) without going over the public internet. Pick
              one region and put everything there. <C>us-east-2</C> is
              a fine default; it&apos;s slightly cheaper than{' '}
              <C>us-east-1</C> and runs newer hardware.
            </P>

            <H3>Launch the instance</H3>
            <CodeBlock label="EC2 > Instances > Launch instance">
{`Name and tags:
  Name: penumbra-prod   (or whatever your project is called)

Application and OS Images:
  Ubuntu Server 24.04 LTS (HVM), 64-bit (x86)
  This is free-tier eligible.

Instance type:
  t3.micro              (1 GB RAM, 2 vCPU burst, $7.59/mo on-demand)
  This is also free-tier eligible for your first 12 months.

Key pair (login):
  Create new key pair
  - Name: penumbra-prod
  - Type: ED25519
  - Format: .pem
  - DOWNLOAD THE FILE. You cannot re-download it later.
  - chmod 400 ~/.ssh/penumbra-prod.pem on your local machine.

Network settings:
  Create security group
  - Name: penumbra-prod-sg
  - Allow SSH (22) from My IP
  - Allow HTTP (80) from Anywhere (0.0.0.0/0)
  - Allow HTTPS (443) from Anywhere (0.0.0.0/0)

Configure storage:
  20 GiB gp3 root volume
  (8 GiB will fight you when npm starts installing things)

Launch.`}
            </CodeBlock>

            <H3>Allocate an Elastic IP</H3>
            <P>
              Without an Elastic IP, your instance&apos;s public IP
              changes every time you stop and start it. That breaks DNS,
              breaks SSL, breaks everything that knows the old IP.
              Elastic IPs are free as long as they are attached to a
              running instance, and cost about four dollars a month if
              you orphan one. Allocate one and attach it to the instance
              you just launched.
            </P>

            <H3>SSH in for the first time</H3>
            <CodeBlock label="From your local machine">
{`ssh -i ~/.ssh/penumbra-prod.pem ubuntu@<your-elastic-ip>

# First connection asks "are you sure" — type yes.
# You should land at:
ubuntu@ip-xx-xx-xx-xx:~$`}
            </CodeBlock>

            <Gotcha>
              <P>
                Three things kill new AWS users at this step. First, the
                .pem file. If you do not chmod it to 400, ssh refuses to
                use it with a vague error. Second, the security group.
                If your local IP changes (different coffee shop, VPN
                toggle, ISP renewal), the &ldquo;allow SSH from My IP&rdquo;
                rule no longer matches and ssh times out. The fix is to
                go back to EC2 &gt; Security Groups and update the rule
                with your new IP. Third, the user name. Ubuntu AMIs use{' '}
                <C>ubuntu@</C>, not <C>root@</C>, not <C>ec2-user@</C>.
                If you type the wrong user, ssh fails with &ldquo;Permission
                denied (publickey).&rdquo;
              </P>
            </Gotcha>
          </section>

          {/* =========================== Chapter 3 — First server setup =========================== */}
          <section className="guide-chapter">
            <ChapterTitle num="3" id="server-setup" title="First server setup" />
            <P>
              You are now SSHed into a fresh Ubuntu. The first thing to
              do is the boring thing: bring it up to date and lock the
              outside doors.
            </P>

            <H3>Update everything</H3>
            <CodeBlock>
{`sudo apt update
sudo apt upgrade -y
sudo apt install -y build-essential curl git`}
            </CodeBlock>
            <P>
              This will take a few minutes on a fresh box. Some of the
              upgrades will require a kernel reboot. If apt prints
              &ldquo;A reboot is required,&rdquo; do it now: <C>sudo reboot</C>.
              Wait sixty seconds, SSH back in.
            </P>

            <H3>Enable the firewall</H3>
            <P>
              The EC2 security group already restricts traffic at the
              AWS level. <C>ufw</C> adds a second layer at the OS
              level, which matters because it&apos;s the layer your{' '}
              <em>own</em> services interact with.
            </P>
            <CodeBlock>
{`sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
sudo ufw status`}
            </CodeBlock>

            <H3>Turn on unattended security upgrades</H3>
            <P>
              You do not want to wake up to the news that your server has
              been compromised because of a kernel CVE that was patched
              two months ago and you never installed. Unattended-upgrades
              installs security patches automatically.
            </P>
            <CodeBlock>
{`sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
# When asked: yes, automatically install stable updates.`}
            </CodeBlock>

            <H3>Disable SSH password auth</H3>
            <P>
              You already have key-only access (you SSHed in with the
              .pem file). The default Ubuntu config also allows
              password auth, which means every bot scanning the internet
              for port 22 will try a million dictionary passwords on
              you. Turn it off.
            </P>
            <CodeBlock>
{`sudo nano /etc/ssh/sshd_config

# Find these lines and set them to:
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes

# Save (Ctrl-O, enter, Ctrl-X), then:
sudo systemctl restart ssh`}
            </CodeBlock>
            <P>
              Do not close your existing SSH session before you test
              that a <em>new</em> SSH session still works. If you made a
              typo, the new session will fail to connect, and you still
              have the old session to fix it from.
            </P>

            <Gotcha>
              <P>
                The classic way to lock yourself out at this step is to
                enable ufw <em>before</em> you allowed port 22, or to
                edit sshd_config with a typo and restart sshd without
                testing a new session. If either happens, you cannot SSH
                back in. The recovery path on EC2 is to detach the
                volume, mount it on another instance, edit the file
                from there, and re-attach. That is a one-hour adventure
                you do not want.
              </P>
              <P>
                Always test a new SSH session before closing your old
                one when you change ssh config.
              </P>
            </Gotcha>
          </section>

          {/* =========================== Chapter 4 — Swap =========================== */}
          <section className="guide-chapter">
            <ChapterTitle num="4" id="swap" title="Swap and the t3.micro reality" />
            <P>
              A t3.micro has one gigabyte of RAM. That is enough to run
              nginx, Node, MySQL, and PM2 in steady state. It is{' '}
              <em>not</em> enough to run <C>npm install</C> on a
              non-trivial React project, or <C>vite build</C> on
              anything past a few dozen modules. Those processes will
              be killed by the Linux OOM killer mid-run, and the only
              error you will see is &ldquo;Killed&rdquo; on the line
              after a long pause.
            </P>
            <P>
              The fix is a swap file. A two-gigabyte swap turns the OOM
              kills into &ldquo;your build takes ninety seconds instead
              of twenty.&rdquo; That is the right trade on a t3.micro.
            </P>

            <CodeBlock label="2 GB swap file, persistent across reboots">
{`sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make it permanent (survives reboots):
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify:
sudo swapon --show
free -h`}
            </CodeBlock>

            <Gotcha>
              <P>
                You will discover you need swap the first time{' '}
                <C>npm install</C> dies halfway through with no useful
                error. The fix is not &ldquo;use a bigger instance&rdquo;
                (that costs money) and not &ldquo;upgrade Node&rdquo;
                (the problem is RAM, not Node). The fix is swap. Add it
                preemptively before your first deploy.
              </P>
              <P>
                The other thing that will eventually catch you is disk:
                a t3.micro with an 8 GB root volume runs out of disk
                space after a few months of npm installs, apt upgrades,
                and PM2 logs. Allocate 20 GB at instance launch (chapter
                2) so you do not have to grow the volume later. Growing
                an EBS volume that is already 100% full is a fun
                chicken-and-egg problem; ask me how I know.
              </P>
            </Gotcha>
          </section>

          {/* =========================== Chapter 5 — MySQL =========================== */}
          <section className="guide-chapter">
            <ChapterTitle num="5" id="mysql" title="MySQL" />
            <P>
              We will install MySQL 8 from the Ubuntu repos, lock down
              the root user, then create a single non-root user with
              privileges only on the application database. This is
              standard least-privilege practice; do not be tempted to
              ship the root password as your app credential.
            </P>

            <H3>Install</H3>
            <CodeBlock>
{`sudo apt install -y mysql-server
sudo systemctl status mysql      # should be active (running)`}
            </CodeBlock>

            <H3>Secure the install</H3>
            <CodeBlock>
{`sudo mysql_secure_installation

# Walk through the prompts:
# - VALIDATE PASSWORD COMPONENT? no   (it forbids characters that break .env parsing)
# - Set root password: pick something long, store in your password manager
# - Remove anonymous users: yes
# - Disallow root remote login: yes
# - Remove test database: yes
# - Reload privilege tables: yes`}
            </CodeBlock>

            <H3>Create the app database + app user</H3>
            <CodeBlock>
{`sudo mysql                                       # enter as root via socket

CREATE DATABASE hello_app
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'hello_user'@'localhost'
  IDENTIFIED BY 'GENERATE_A_LONG_RANDOM_PASSWORD_HERE';

GRANT ALL PRIVILEGES ON hello_app.* TO 'hello_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Test:
mysql -u hello_user -p hello_app -e "SELECT 'ok';"`}
            </CodeBlock>

            <Gotcha>
              <P>
                People put the MySQL root password in <C>.env</C> as the
                application credential because the docs example used
                root. Do not do this. If your application&apos;s
                process is ever compromised (a dependency vulnerability,
                a leaked environment file, a misconfigured nginx
                proxying an admin page), the attacker has full database
                access. With a dedicated app user that only has
                privileges on the one database, the blast radius is
                bounded.
              </P>
              <P>
                Also: when you eventually want to add database backups
                (chapter 12), <C>mysqldump</C> as the app user works,
                but it will print &ldquo;Access denied; you need
                PROCESS privilege&rdquo; unless you pass{' '}
                <C>--no-tablespaces</C>. That is a known MySQL 8 thing.
                Pass the flag.
              </P>
            </Gotcha>
          </section>

          {/* =========================== Chapter 6 — Node + nginx + PM2 =========================== */}
          <section className="guide-chapter">
            <ChapterTitle num="6" id="node-nginx" title="Node, nginx, PM2" />
            <P>
              Three pieces:
            </P>
            <UL>
              <li>
                <strong>Node.js</strong>: the runtime your backend lives in.
              </li>
              <li>
                <strong>nginx</strong>: the web server that terminates HTTPS,
                serves your static frontend, and reverse-proxies API
                requests to Node.
              </li>
              <li>
                <strong>PM2</strong>: the process manager that keeps Node
                running, restarts it on crash, and rotates its logs.
              </li>
            </UL>

            <H3>Node (from NodeSource, not apt)</H3>
            <P>
              The Node in Ubuntu&apos;s default repos is old. Get the
              current LTS from NodeSource:
            </P>
            <CodeBlock>
{`curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version       # should be v20.x
npm --version`}
            </CodeBlock>

            <H3>nginx</H3>
            <CodeBlock>
{`sudo apt install -y nginx
sudo systemctl status nginx
# Visit http://<your-elastic-ip> — should see the default nginx page.`}
            </CodeBlock>

            <H3>PM2</H3>
            <CodeBlock>
{`sudo npm install -g pm2

# Make PM2 launch on boot, as your current user:
pm2 startup systemd -u $USER --hp $HOME
# It will print a sudo command. Copy and run it.

# Later, after you start your app for the first time:
# pm2 start ./server.js --name hello-backend
# pm2 save                        # persists the process list across reboots`}
            </CodeBlock>

            <Gotcha>
              <P>
                Apt&apos;s default Node is several major versions behind.
                You will install a package that requires Node 18+ and
                get a cryptic error about engines. Use NodeSource. Also,{' '}
                <C>pm2 startup</C> prints a command you have to run as
                sudo; if you skip that step, PM2 forgets your processes
                across reboot and your site goes dark next time the
                instance restarts.
              </P>
            </Gotcha>
          </section>

          {/* =========================== Chapter 7 — DNS =========================== */}
          <section className="guide-chapter">
            <ChapterTitle num="7" id="dns" title="DNS and Route 53" />
            <P>
              You have a public IP. You need a domain name pointing at
              it. The cleanest path is to register the domain through
              Route 53 (AWS&apos;s DNS service); the records, the
              registrar, and the billing all live in one place.
            </P>

            <H3>Register a domain</H3>
            <P>
              Route 53 &gt; Registered domains &gt; Register domain.
              Standard <C>.com</C> registrations are around twelve to
              fifteen dollars a year. Privacy protection is included by
              default. Registration takes a few minutes to a few hours
              to propagate; you cannot do the next step until the
              hosted zone is created (which Route 53 does automatically).
            </P>

            <H3>Create A records pointing at your EC2 IP</H3>
            <CodeBlock label="Route 53 > Hosted zones > yourdomain.com > Create record">
{`Record 1 (apex):
  Record name:  (leave blank)
  Record type:  A
  Value:        <your-elastic-ip>
  TTL:          300

Record 2 (www):
  Record name:  www
  Record type:  A
  Value:        <your-elastic-ip>
  TTL:          300`}
            </CodeBlock>

            <H3>Verify DNS</H3>
            <CodeBlock>
{`# From your local machine:
nslookup yourdomain.com
nslookup www.yourdomain.com

# Both should return your Elastic IP. Route 53 propagates fast
# (seconds, not minutes). If it isn't resolving after a minute,
# the record didn't save.`}
            </CodeBlock>

            <Gotcha>
              <P>
                If you bought the domain at another registrar (GoDaddy,
                Namecheap), you also need to point the domain&apos;s
                nameservers at Route 53&apos;s. The hosted zone page
                shows you the four <C>ns-*.awsdns-*.org</C>{' '}
                nameservers; copy them into your registrar&apos;s
                control panel as the &ldquo;custom nameservers.&rdquo;
                That propagation step can take 24 hours. Plan for it.
              </P>
            </Gotcha>
          </section>

          {/* =========================== Chapter 8 — TLS =========================== */}
          <section className="guide-chapter">
            <ChapterTitle num="8" id="tls" title="Let’s Encrypt and HTTPS" />
            <P>
              Free TLS certificates, with auto-renewal, in two commands.
              Let&apos;s Encrypt is the open certificate authority that
              broke the &ldquo;HTTPS costs money and is painful to
              renew&rdquo; status quo a decade ago. Certbot is the
              tool that talks to them.
            </P>

            <CodeBlock>
{`sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx \\
  -d yourdomain.com \\
  -d www.yourdomain.com

# It will:
# 1. ask for an email (for renewal failure notifications)
# 2. agree to terms of service
# 3. validate that you control the domain by serving a file from
#    your nginx on port 80 (this is why DNS had to be live first)
# 4. issue the cert, place it in /etc/letsencrypt/live/...
# 5. edit your nginx config to load the cert and redirect HTTP to HTTPS
# 6. reload nginx

# Verify auto-renew is installed:
sudo systemctl status certbot.timer

# Manual dry run of renewal (to confirm everything works):
sudo certbot renew --dry-run`}
            </CodeBlock>

            <P>
              Now visit <C>https://yourdomain.com</C> and you should see
              the default nginx page over HTTPS with a valid green lock
              in the browser. We are about to replace that default
              page, but the cert and the redirect are now in place
              regardless.
            </P>

            <Gotcha>
              <P>
                Certbot validates by serving a file from your nginx on
                port 80. If DNS is not actually pointed at your server
                yet, the validation fails with a message that makes it
                look like a permissions problem. Verify DNS resolves
                first.
              </P>
              <P>
                The other footgun: if you add a new subdomain later
                (say, you launch <C>api.yourdomain.com</C>), the
                existing cert does not automatically cover it. Re-run
                certbot with <C>--expand</C> and the new <C>-d</C> flag
                to add it to the same cert.
              </P>
            </Gotcha>
          </section>

          {/* =========================== Chapter 9 — Express =========================== */}
          <section className="guide-chapter">
            <ChapterTitle num="9" id="express" title="The Express backend patterns that matter" />
            <P>
              This chapter is not a tutorial on Express. It is a list of
              the specific patterns that matter in production and that
              most quick-start tutorials skip. Adopt them on day one;
              they cost almost nothing to add early and a lot to retrofit
              later.
            </P>

            <H3>Sessions with a MySQL store</H3>
            <P>
              Default express-session uses in-memory storage. That works
              for development and fails the first time PM2 restarts the
              process and every logged-in user loses their session.
              Back it with MySQL using <C>express-mysql-session</C>.
            </P>

            <H3>bcrypt cost 12 + timing-constant login</H3>
            <P>
              Hash passwords with <C>bcrypt</C>, cost factor 12. On a
              t3.micro that is about 250ms per hash, which is the right
              tradeoff between user-facing latency and attacker cost.
            </P>
            <P>
              Then a subtle thing: when somebody tries to log in with
              an email that does not exist, do not skip the bcrypt
              comparison. If you do, your login route returns in 5ms
              for a non-existent user and 250ms for an existing one,
              and an attacker can enumerate your user list by timing
              alone. The fix is to always run the comparison, against a
              fake hash if necessary.
            </P>
            <CodeBlock>
{`const FAKE_PASSWORD_HASH = bcrypt.hashSync('placeholder-for-timing', 12);

const user = await findUserByEmail(email);
const hashToCompare = user ? user.password_hash : FAKE_PASSWORD_HASH;
const ok = await bcrypt.compare(submittedPassword, hashToCompare);

if (!user || !ok) {
  // Same response either way. Same timing either way.
  return res.status(401).json({ error: 'Invalid credentials' });
}`}
            </CodeBlock>

            <H3>Rate limiting</H3>
            <P>
              <C>express-rate-limit</C>, multiple tiers. A loose tier on
              <C> /api/*</C> (100 req/min/IP) as a global safety net,
              a strict tier on auth mutations (10 req/15-min/IP on
              login, register, forgot-password), and a separate tight
              tier on the contact form (5 req/hour/IP) so bots cannot
              flood your inbox.
            </P>

            <H3>The Stripe webhook trap</H3>
            <P>
              If you ever take payments via Stripe, this single thing
              will burn three hours of your life if you have not heard
              it before. Stripe signs webhooks with HMAC over the
              <em> raw </em> request bytes. If <C>express.json()</C>{' '}
              parses the body before your webhook handler runs, the
              bytes change (whitespace, key order), and signature
              verification silently fails forever.
            </P>
            <CodeBlock label="server.js — order matters">
{`// Stripe webhook MUST be mounted BEFORE express.json():
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentsWebhookHandler
);

// THEN the global JSON parser:
app.use(express.json());`}
            </CodeBlock>

            <H3>Global error handler + uncaught exception handlers</H3>
            <P>
              One unhandled promise rejection is enough to crash a Node
              process. Without a handler, you get a silent process exit
              and PM2 restarts you, but every in-flight request fails.
              Wire all three:
            </P>
            <CodeBlock>
{`// Last middleware: catches errors thrown synchronously or passed to next(err)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Process-level catches for the things Express never sees:
process.on('uncaughtException', (err) => {
  console.error('uncaughtException:', err);
  process.exit(1);   // clean exit so PM2 restarts cleanly
});
process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection:', reason);
  process.exit(1);
});`}
            </CodeBlock>

            <H3>Fail-fast on missing secrets</H3>
            <P>
              The <C>process.env.SESSION_SECRET || 'dev-default'</C>{' '}
              fallback you see in every Express tutorial is fine in dev
              and dangerous in prod. If <C>.env</C> is misplaced or the
              env var isn&apos;t loaded, the app cheerfully boots with
              a hardcoded secret that is public on GitHub. Refuse to
              start instead.
            </P>
            <CodeBlock>
{`if (process.env.NODE_ENV === 'production') {
  if (!process.env.SESSION_SECRET || /change-me|insecure|example/i.test(process.env.SESSION_SECRET)) {
    console.error('FATAL: SESSION_SECRET missing or example value in production');
    process.exit(1);
  }
  if (process.env.COOKIE_SECURE !== 'true') {
    console.error('FATAL: COOKIE_SECURE must be "true" in production');
    process.exit(1);
  }
}`}
            </CodeBlock>

            <H3>An /api/health endpoint</H3>
            <P>
              UptimeRobot (chapter 12) needs something to ping. Give it
              a tiny endpoint that confirms the worker can talk to the
              database.
            </P>
            <CodeBlock>
{`app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', uptime: process.uptime() });
  } catch (err) {
    res.status(503).json({ status: 'degraded', reason: 'db_unreachable' });
  }
});`}
            </CodeBlock>

            <Gotcha>
              <P>
                The Stripe webhook ordering bug is the single most common
                serious mistake in this whole guide. The symptom is
                &ldquo;my webhooks worked yesterday and now they
                don&apos;t and Stripe&apos;s logs show signature
                verification failures.&rdquo; The cause is almost
                always somebody (or some refactor) moving the{' '}
                <C>express.json()</C> line above the webhook route.
                Add a code-comment shouting the constraint, because
                you <em>will</em> forget.
              </P>
            </Gotcha>
          </section>

          {/* =========================== Chapter 10 — React frontend =========================== */}
          <section className="guide-chapter">
            <ChapterTitle num="10" id="react" title="The React frontend and the deploy script" />
            <P>
              Frontend choice: React + Vite + React Router. Vite is
              fast, React Router is the de-facto SPA router, both are
              well-documented. The build output is a static{' '}
              <C>dist/</C> directory you copy onto the server.
            </P>

            <H3>Scaffold</H3>
            <CodeBlock>
{`npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom`}
            </CodeBlock>

            <H3>Code splitting from day one</H3>
            <P>
              The default Vite setup statically imports every route into
              one bundle. A marketing visitor downloads your entire
              admin dashboard, your Stripe Elements SDK, and code they
              will never see. Use <C>React.lazy</C> and a Suspense
              boundary in your layout instead.
            </P>
            <CodeBlock>
{`import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));

<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/admin" element={<Admin />} />
  </Routes>
</Suspense>`}
            </CodeBlock>

            <H3>Deploy script</H3>
            <P>
              On the server, build into <C>dist/</C>, then copy into
              <C> /var/www/your-app</C> (where nginx looks for static
              files).
            </P>
            <CodeBlock label="deploy_frontend.sh">
{`#!/usr/bin/env bash
set -euo pipefail

cd /home/ubuntu/your-repo/frontend
npm install
npm run build

sudo mkdir -p /var/www/your-app
sudo rm -rf /var/www/your-app/*
sudo cp -r dist/* /var/www/your-app/

sudo nginx -t
sudo systemctl reload nginx
echo "Frontend deployed."`}
            </CodeBlock>

            <H3>nginx config for the SPA</H3>
            <P>
              The critical line is the <C>try_files</C> directive: when
              somebody visits <C>/login</C> directly, nginx tries to
              find <C>/var/www/your-app/login</C>, fails, and falls
              back to serving <C>index.html</C> so React Router can
              take over.
            </P>
            <CodeBlock label="/etc/nginx/sites-available/your-app">
{`server {
    listen 443 ssl;   # managed by Certbot
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/your-app;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri /index.html;
    }

    # Certbot adds the ssl_certificate / ssl_certificate_key lines below
}`}
            </CodeBlock>

            <Gotcha>
              <P>
                Forgetting the <C>try_files $uri /index.html;</C> line
                is the most common SPA-on-nginx mistake. Symptom: the
                home page loads fine, internal links work fine,
                refreshing any non-root URL returns a 404. The fix is
                the one line.
              </P>
              <P>
                Related: do not use <C>try_files $uri $uri/ /index.html;</C>{' '}
                with the trailing slash variant if you have static
                subdirectories under your web root (like a{' '}
                <C>/public/screenshots/</C> directory with no
                index.html). Nginx will see the directory exists,
                try to autoindex it, hit autoindex-off, and return 403.
                Be specific about which paths get the directory-index
                lookup.
              </P>
            </Gotcha>
          </section>

          {/* =========================== Chapter 11 — Security headers =========================== */}
          <section className="guide-chapter">
            <ChapterTitle num="11" id="headers" title="Security headers, CSP, compression" />
            <P>
              Five HTTP response headers, plus gzip, plus cache control.
              Default nginx ships with none of these. Adding them takes
              twenty minutes and meaningfully changes your site&apos;s
              security posture and performance.
            </P>

            <H3>The headers</H3>
            <CodeBlock label="Include this from inside your server block">
{`# Force HTTPS for a year, on the apex and any subdomain.
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Stop browsers from MIME-sniffing a response away from its declared type.
add_header X-Content-Type-Options "nosniff" always;

# Refuse to be embedded in an iframe by any origin.
add_header X-Frame-Options "DENY" always;

# Send the full URL as Referer for same-origin only; just the origin
# for cross-origin; nothing for HTTPS-to-HTTP downgrades.
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Content Security Policy — the big one. Restrict what scripts, styles,
# fonts, etc. the browser will load. Start strict ('self' for everything)
# and add explicit origins as you discover what your app actually needs.
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self' https://api.stripe.com; frame-src 'self' https://js.stripe.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;`}
            </CodeBlock>

            <H3>Compression</H3>
            <CodeBlock>
{`gzip on;
gzip_vary on;
gzip_min_length 256;
gzip_comp_level 6;
gzip_types text/plain text/css text/javascript
           application/javascript application/json
           application/xml image/svg+xml;`}
            </CodeBlock>

            <H3>Cache control</H3>
            <P>
              Vite content-hashes your bundle filenames (e.g.{' '}
              <C>index-CU4XbcKP.js</C>). That means every file under{' '}
              <C>/assets/</C> is safe to cache forever; if the contents
              change, the hash changes, and the filename changes, so
              the browser fetches the new one. The HTML shell, on the
              other hand, has a fixed name and needs to be re-checked
              every visit so the new bundle hash gets picked up after
              a deploy.
            </P>
            <CodeBlock>
{`location ~* ^/assets/.+\\.(js|css|woff2?|ttf|otf|eot|svg)$ {
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    try_files $uri =404;
}

location = /index.html {
    add_header Cache-Control "no-cache, must-revalidate" always;
}`}
            </CodeBlock>

            <Gotcha>
              <P>
                The CSP <C>font-src 'self'</C> rule will block Google
                Fonts (or any other font CDN) without giving you a
                visible error. Browsers silently fall back to system
                fonts, the brand identity quietly degrades, and you
                only notice when somebody on a fresh device tells you
                the site looks &ldquo;different.&rdquo; Fix it either
                by whitelisting <C>fonts.gstatic.com</C> in font-src
                and <C>fonts.googleapis.com</C> in style-src, or by
                self-hosting the fonts (<C>@fontsource/*</C> packages
                handle this cleanly with Vite).
              </P>
              <P>
                The CSP also breaks any third-party widget you embed
                without updating the relevant directive. When you add
                a chat widget, an analytics script, an embed from
                another domain — expect to update CSP. The blocked
                request shows up in DevTools &gt; Console with a
                specific origin name. Add that origin to the matching
                directive.
              </P>
            </Gotcha>
          </section>

          {/* =========================== Chapter 12 — Operations =========================== */}
          <section className="guide-chapter">
            <ChapterTitle num="12" id="ops" title="Operations: backups, monitoring, recovery" />
            <P>
              You are done building. Now the boring work that decides
              whether you find out about problems from your monitoring
              or from your customers.
            </P>

            <H3>Nightly database backup</H3>
            <P>
              <C>mysqldump</C> in a cron job. Gzip the output. Keep the
              last fourteen days. The total disk impact is a few
              megabytes a day at small scale.
            </P>
            <CodeBlock label="backup-db.sh">
{`#!/usr/bin/env bash
set -euo pipefail

# Pull DB creds out of the app's .env to stay in sync with prod.
ENV_FILE="$HOME/your-repo/backend/.env"
DB_USER="$(grep ^DB_USER= "$ENV_FILE" | cut -d= -f2-)"
DB_PASSWORD="$(grep ^DB_PASSWORD= "$ENV_FILE" | cut -d= -f2-)"
DB_NAME="$(grep ^DB_NAME= "$ENV_FILE" | cut -d= -f2-)"

sudo mkdir -p /backups
sudo chown "$USER:$USER" /backups

# Use --defaults-extra-file so the password never appears in 'ps'.
TMP_CNF="$(mktemp)"
trap 'rm -f "$TMP_CNF"' EXIT
cat >"$TMP_CNF" <<EOF
[client]
user=$DB_USER
password=$DB_PASSWORD
EOF
chmod 600 "$TMP_CNF"

mysqldump --defaults-extra-file="$TMP_CNF" \\
  --single-transaction --quick --routines --triggers \\
  --skip-lock-tables --set-gtid-purged=OFF --no-tablespaces \\
  "$DB_NAME" \\
  | gzip -c > "/backups/${DB_NAME}_$(date +%F).sql.gz"

# Keep 14 days.
find /backups -maxdepth 1 -name "${DB_NAME}_*.sql.gz" -mtime +14 -delete
echo "[$(date -Iseconds)] backup OK"`}
            </CodeBlock>

            <CodeBlock label="Install the cron entry (runs at 3am)">
{`chmod +x backup-db.sh
sudo touch /var/log/your-backup.log
sudo chown $USER:$USER /var/log/your-backup.log
( crontab -l 2>/dev/null ; echo "0 3 * * * $HOME/backup-db.sh >> /var/log/your-backup.log 2>&1" ) | crontab -`}
            </CodeBlock>

            <P>
              <strong>EC2 is in UTC by default.</strong> A cron entry of{' '}
              <C>0 3 * * *</C> runs at 3am UTC, which is the previous
              evening in most US time zones. That is fine for backups
              (low-traffic window everywhere). Just know which clock
              you are scheduling against.
            </P>

            <H3>UptimeRobot (free)</H3>
            <P>
              Sign up at <a href="https://uptimerobot.com" target="_blank" rel="noreferrer noopener" style={{ color: colors.cyan }}>uptimerobot.com</a>.
              New monitor &gt; HTTP(s) &gt; URL{' '}
              <C>https://yourdomain.com/api/health</C> &gt; 5 minute
              interval &gt; alert contact is your email. That is the
              whole setup.
            </P>
            <P>
              <strong>Point it at <C>/api/health</C>, not the
              homepage.</strong> Your static frontend will keep loading
              even when the backend is dead, because nginx serves the
              HTML directly. The whole point of the health endpoint is
              that it exercises the live application path including
              the database round-trip. UptimeRobot must hit that path,
              not the static file.
            </P>

            <H3>PM2 log rotation</H3>
            <P>
              Without this, PM2&apos;s log files grow without bound and
              eventually fill the disk. One-time install:
            </P>
            <CodeBlock>
{`pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'`}
            </CodeBlock>

            <H3>Recovery checklist</H3>
            <P>
              Tape this somewhere. The middle of an incident is not when
              you want to be reading documentation.
            </P>
            <UL>
              <li>
                <strong>Backend crashed</strong>:{' '}
                <C>pm2 logs hello-backend --lines 100</C> → fix env or
                code → <C>pm2 restart hello-backend</C>.
              </li>
              <li>
                <strong>Site returns 502 from nginx</strong>: backend is
                down (see above) or stopped responding (PM2 says
                online but the process is wedged — restart it).
              </li>
              <li>
                <strong>Site returns 503 with{' '}
                <C>{`{ maintenance: true }`}</C></strong>: somebody (you)
                flipped maintenance mode. Toggle back via your admin
                panel.
              </li>
              <li>
                <strong><C>/api/health</C> returns 503{' '}
                <C>db_unreachable</C></strong>: MySQL is down.{' '}
                <C>sudo systemctl status mysql</C>.
              </li>
              <li>
                <strong>Bad migration corrupted data</strong>: restore
                last night&apos;s SQL dump into a scratch database,
                copy the affected table back.
              </li>
              <li>
                <strong>Whole instance lost</strong>: launch new EC2
                from your latest EBS snapshot (if you set that up),
                restore last night&apos;s SQL dump on top to catch
                the day&apos;s writes, repoint Elastic IP.
              </li>
            </UL>

            <Gotcha>
              <P>
                Two things will catch you. First, the UptimeRobot
                mistake above — pointing at the static homepage means
                you never get paged about backend failures. Second,
                the backup that runs every night but has never been
                <em> restored</em>. Pick a weekend and actually
                restore one of the dumps into a scratch database.
                Verify it has your data. An untested backup is just a
                file.
              </P>
            </Gotcha>
          </section>

          {/* =========================== Chapter 13 — Honest chapter =========================== */}
          <section className="guide-chapter">
            <ChapterTitle num="13" id="honest" title="The honest chapter" />
            <P>
              You did it. Or, if you are reading the PDF and have not
              done it yet, you are about to. Either way, here is the
              part the rest of the internet does not tell you.
            </P>

            <H3>What this actually took</H3>
            <P>
              For somebody new to all of it, this is a forty-to-eighty
              hour project the first time. Not eighty hours of typing.
              Eighty hours of typing, waiting for things, reading
              error messages, googling those error messages, trying a
              fix, watching it not work, trying a different fix,
              eventually getting the right one. Most of that time is
              not skill acquisition you can keep — it is one-time
              friction with this specific stack on this specific day.
            </P>
            <P>
              The second time, with the same stack, it is more like
              ten to fifteen hours. The fifth time it is closer to
              four. That is normal. It is also why people who do this
              for a living are not slow even when the work looks
              identical to you.
            </P>

            <H3>What it keeps costing</H3>
            <P>
              The hosting bill stays flat at about $15/month. Your
              own time is the line that compounds. Every two weeks
              or so, a Node-side library publishes a CVE that you
              should upgrade past. Every couple of months, a
              dependency&apos;s major version bump breaks something
              non-obvious. Every six months or so, Ubuntu&apos;s
              unattended-upgrades will install a kernel update that
              requires a reboot, which will surface a thing you forgot
              to make persistent. Once a year, your TLS cert renews
              automatically — usually. The one time it does not,
              you find out from UptimeRobot at midnight.
            </P>
            <P>
              None of this is a reason to be afraid of the work. It
              is the work. The reason to know about it is so you can
              budget your time honestly: this is a few hours a month
              of background-process maintenance once it&apos;s built.
              If you do not have a few hours a month, the maintenance
              piles up, and the day you actually need to ship a
              feature you spend the first three of those hours
              catching back up.
            </P>

            <H3>When the AI helps and when it does not</H3>
            <P>
              Every step in this guide can be done with an LLM at your
              side. Claude, ChatGPT, Gemini, whichever. They are
              excellent at writing the nginx config, generating the
              backup script, explaining what an error message means,
              and remembering syntax you forgot. Use them.
            </P>
            <P>
              What they are not good at, and what I have seen burn
              days of beginner time, is anything that needs you to
              actually <em>look at the real running thing</em>: the
              page in your browser, the live log file, the actual
              network request. An LLM will tell you confidently that
              your config is correct because the config it can see is
              correct; meanwhile, you have a typo in a totally
              different file that nobody looked at. The verification
              that matters is you, with your hands on the system. The
              model is leverage, but you are the part that knows
              what &ldquo;done&rdquo; means.
            </P>
            <P>
              There is a longer version of this argument on the{' '}
              <Link to="/judgment" style={{ color: colors.cyan }}>judgement page</Link>{' '}
              of this site with concrete examples. Worth reading if
              you are about to spend a weekend in the deep end with
              an LLM.
            </P>

            <H3>When to hire someone instead</H3>
            <P>
              Honest math, no marketing: if your time is worth more
              than fifty dollars an hour and software infrastructure
              is not your craft, paying somebody whose full-time job
              is this is cheaper than your own time. A typical small
              build engagement is between ten and twenty-five
              thousand dollars, four to six weeks, plus an AWS bill
              you own. Compared to forty to eighty hours of your own
              learning curve plus the ongoing maintenance burden,
              the trade gets favourable quickly.
            </P>
            <P>
              The other reason to hire someone is that on day one of
              an outage at 2am, the question you want to ask yourself
              is not &ldquo;okay where did I save my SSH key?&rdquo;{' '}
              The whole point of paying for expertise is that there is
              somebody on the other end of an email who already knows
              your stack and can be useful in five minutes instead of
              two hours.
            </P>
            <P>
              If you have read this far and decided it is worth it
              regardless: go build it. The guide is yours. Come back
              if you ever want to skip the maintenance tax. If you
              have read this far and decided you want help, the
              calendar link below is the next step.
            </P>
          </section>

          {/* =========================== Closing CTA =========================== */}
          <section
            className="guide-no-print"
            style={{
              marginTop: space['3xl'],
              padding: `${space['2xl']} ${space.xl}`,
              borderRadius: 16,
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              textAlign: 'center'
            }}
          >
            <HudLabel tone="magenta">If you got this far</HudLabel>
            <h2
              style={{
                fontFamily: fonts.heading,
                fontSize: fontSizes['2xl'],
                fontWeight: fontWeights.bold,
                color: colors.text,
                margin: `${space.md} 0 ${space.md}`,
                letterSpacing: '-0.015em'
              }}
            >
              Whether you build it or hire it, you understand the work now.
            </h2>
            <p
              style={{
                margin: `0 auto ${space.xl}`,
                maxWidth: '60ch',
                fontSize: fontSizes.md,
                color: colors.textSecondary,
                lineHeight: 1.65
              }}
            >
              If you want a 30-minute conversation about either path —
              building it yourself with sanity-saving advice, or having
              me build it for you on a fixed-scope sprint — book a slot.
              The call is genuinely free of pitch.
            </p>
            <div
              style={{
                display: 'flex',
                gap: space.md,
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              <Button
                as="a"
                href={CAL_BOOKING_URL}
                target="_blank"
                rel="noreferrer noopener"
                size="lg"
              >
                Book a 30-min intro →
              </Button>
              <Button
                onClick={() => window.print()}
                variant="secondary"
                size="lg"
              >
                Save this as PDF
              </Button>
            </div>
          </section>
        </article>
      </div>

      {/* Responsive: collapse the TOC to top-of-page on narrow viewports */}
      <style>{`
        @media (max-width: 900px) {
          .guide-shell {
            grid-template-columns: 1fr !important;
          }
          .guide-toc {
            position: static !important;
            max-height: none !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(94, 234, 212, 0.10) !important;
            padding-right: 0 !important;
            padding-bottom: 1rem !important;
            margin-bottom: 2rem !important;
          }
          .guide-content {
            max-width: none !important;
          }
        }
      `}</style>
    </>
  );
}
