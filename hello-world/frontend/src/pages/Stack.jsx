// Under the hood — what penumbra-tech.com runs on and what it costs.
//
// Marketing page that turns the "this looks like a lot, how much does
// it cost?" objection into a credibility play. Itemises every line of
// the live AWS bill, compares to Wix / Squarespace / Shopify total
// cost of ownership for an equivalent feature set, then makes the
// philosophical pitch: opaque managed platforms charge platform tax
// in exchange for vendor lock-in; AWS on-demand lets the client own
// the code and pay infrastructure cost direct.

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
import Stars from '../components/Stars.jsx';
import CornerBrackets from '../components/CornerBrackets.jsx';
import HudLabel from '../components/HudLabel.jsx';
import SectionRail from '../components/SectionRail.jsx';
import useDocumentMeta from '../hooks/useDocumentMeta.js';

const CAL_BOOKING_URL = 'https://cal.com/wesley-weaver-avi7mu/30min';

const SECTIONS = [
  { id: 'hero',       num: '00', label: 'Intro' },
  { id: 'bill',       num: '01', label: 'The bill' },
  { id: 'comparison', num: '02', label: 'Vs platforms' },
  { id: 'opaque',     num: '03', label: 'Why it costs more' },
  { id: 'security',   num: '04', label: 'Security blast' },
  { id: 'ownership',  num: '05', label: 'What you get' },
  { id: 'cta',        num: '06', label: 'Book a Call' }
];

// All numbers in USD, current as of 2026 us-east-2 list pricing.
// Conservative end of the realistic range — actual bill at current
// traffic comes in a few dollars below this every month.
const COST_ROWS = [
  {
    line: 'EC2: t3.micro, on-demand, 24/7',
    note: '2 vCPU burst, 1 GB RAM. Runs nginx + Node + MySQL all in one process group.',
    monthly: '$7.59'
  },
  {
    line: 'EBS: gp3 20 GB root volume',
    note: 'SSD-backed disk. Includes app, database, build cache, ~14 days of nightly SQL dumps.',
    monthly: '$1.60'
  },
  {
    line: 'Route 53: hosted zone',
    note: 'Authoritative DNS for penumbra-tech.com. Includes per-query cost at this volume.',
    monthly: '$0.55'
  },
  {
    line: 'Domain registration',
    note: 'penumbra-tech.com via Route 53 Domains. $13/yr amortised.',
    monthly: '$1.08'
  },
  {
    line: 'TLS certificate: Let’s Encrypt',
    note: 'Auto-renewed via certbot. Covers apex + www + the legacy duckdns subdomain.',
    monthly: '$0.00'
  },
  {
    line: 'Egress / data transfer',
    note: 'First 100 GB free; current traffic stays inside it. Climbs gently if the site goes viral.',
    monthly: '$0–3'
  },
  {
    line: 'Email: SMTP relay for contact-form notifications',
    note: 'Currently routed through a free-tier provider. Easy to swap to SES at fractions of a cent per message.',
    monthly: '$0.00'
  }
];

const COMPARISONS = [
  {
    platform: 'Wix Business (with bookings)',
    monthly: '$32 base + ~$30–80 in app add-ons',
    extra:
      'plus 2.9% + $0.30 per payment if you use Wix Payments; you do not own the database or DNS.'
  },
  {
    platform: 'Squarespace Commerce Basic',
    monthly: '$36 base',
    extra:
      'plus 3% transaction fee on every sale; limited custom code; you cannot self-host.'
  },
  {
    platform: 'Shopify Basic',
    monthly: '$39 base + apps usually $50–250',
    extra:
      'plus 2.9% + $0.30 per payment; apps often have per-order fees that compound; theme work is its own line item.'
  },
  {
    platform: 'WordPress (WP Engine startup)',
    monthly: '$30 base + plugins $10–100+',
    extra:
      'plus paid themes, plus a security plugin you actually trust, plus the maintenance hours when WP autoupdates break a plugin.'
  }
];

const OWNERSHIP = [
  {
    title: 'You pay AWS, not a platform middleman',
    body:
      'The invoice for hosting comes from Amazon directly, in your AWS account. No platform tax, no markup, no opaque tiers. You can audit every line.'
  },
  {
    title: 'You own the source',
    body:
      'Everything that runs your site lives in a Git repository you control. No vendor lock-in. If you ever fire me, you can hand the repo to any other developer and they can keep going.'
  },
  {
    title: 'You own the data',
    body:
      'Your MySQL database lives on disk you control. Nightly automated SQL dumps land in S3 or on the box itself. No "export" tier, no "download CSV" friction, no contract clause that says we own your customer list.'
  },
  {
    title: 'Cost scales with use, not feature flags',
    body:
      'Need more horsepower? Bump the EC2 size and pay the difference. Need less? Bump it down. You are never paying for a feature tier you do not need, and there is no "talk to sales" pricing wall.'
  }
];

const cellStyle = {
  padding: `${space.sm} ${space.md}`,
  borderBottom: `1px solid ${colors.borderSubtle}`,
  fontSize: fontSizes.sm,
  color: colors.textSecondary,
  verticalAlign: 'top',
  lineHeight: 1.55
};

const headerCellStyle = {
  padding: `${space.sm} ${space.md}`,
  borderBottom: `2px solid ${colors.border}`,
  fontFamily: fonts.mono,
  fontSize: fontSizes.xs,
  color: colors.cyan,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  textAlign: 'left'
};

const monoNumberStyle = {
  fontFamily: fonts.mono,
  color: colors.text,
  fontSize: fontSizes.sm,
  whiteSpace: 'nowrap'
};

export default function Stack() {
  useDocumentMeta({
    title: 'What this site runs on — the actual AWS bill | Penumbra Tech',
    description:
      'Cost transparency: the $15/month AWS bill behind this site, what it actually buys, and why a small custom stack on EC2 can be cheaper and more controllable than $30-$300/month SaaS site builders.',
    canonical: 'https://penumbra-tech.com/stack'
  });
  return (
    <>
      <SectionRail sections={SECTIONS} />

      {/* =============================== Hero =============================== */}
      <section
        id="hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: space['3xl'],
          paddingBottom: space['2xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Stars density={120} heroDensity={12} colorTint="corona" />
        <CornerBrackets size={28} inset={24} />
        <Container narrow style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="corona">Under the hood</HudLabel>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: fontWeights.bold,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text,
              maxWidth: '22ch'
            }}
          >
            What this site runs on, and what it costs.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: '62ch',
              fontSize: fontSizes.lg,
              color: colors.textSecondary,
              lineHeight: 1.55
            }}
          >
            Visitors sometimes ask: this looks like a lot, what does it
            cost? The honest answer is{' '}
            <strong style={{ color: colors.text, fontWeight: fontWeights.semibold }}>
              about fifteen dollars a month
            </strong>
            , and the only reason that&apos;s surprising is that the
            managed platforms most people benchmark against are designed
            to make their real cost hard to read.
          </p>
        </Container>
      </section>

      {/* ========================== Itemised bill ========================== */}
      <section
        id="bill"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl']
        }}
      >
        <Container narrow>
          <HudLabel tone="cyan">The actual bill</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              color: colors.text,
              letterSpacing: '-0.015em',
              margin: `${space.md} 0 ${space.lg}`
            }}
          >
            Every line of the AWS invoice that runs penumbra-tech.com.
          </h2>
          <p
            style={{
              margin: `0 0 ${space.xl}`,
              maxWidth: '60ch',
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.65
            }}
          >
            Everything visible on this site (the marketing pages, the
            React SPA, the Node API, the MySQL database, the admin
            portal, the diagnostics dashboard, the Stripe integration,
            the contact form, the load-tested benchmark routes) runs on
            one small AWS server and a handful of supporting services.
            Here&apos;s what each piece costs.
          </p>
          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 14,
              overflow: 'hidden',
              background: colors.bgSoft
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: fonts.body
              }}
            >
              <thead>
                <tr>
                  <th style={headerCellStyle}>Line item</th>
                  <th style={{ ...headerCellStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    Monthly
                  </th>
                </tr>
              </thead>
              <tbody>
                {COST_ROWS.map((row) => (
                  <tr key={row.line}>
                    <td style={cellStyle}>
                      <div style={{ color: colors.text, fontWeight: fontWeights.semibold }}>
                        {row.line}
                      </div>
                      <div style={{ marginTop: 2, color: colors.textMuted }}>{row.note}</div>
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                      <span style={monoNumberStyle}>{row.monthly}</span>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td
                    style={{
                      padding: `${space.md} ${space.md}`,
                      color: colors.text,
                      fontWeight: fontWeights.bold,
                      fontFamily: fonts.heading,
                      fontSize: fontSizes.md
                    }}
                  >
                    Total
                  </td>
                  <td
                    style={{
                      padding: `${space.md} ${space.md}`,
                      textAlign: 'right',
                      color: colors.accent,
                      fontFamily: fonts.mono,
                      fontSize: fontSizes.lg,
                      fontWeight: fontWeights.bold
                    }}
                  >
                    ~$12–15
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p
            style={{
              margin: `${space.md} 0 0`,
              fontSize: fontSizes.xs,
              fontFamily: fonts.mono,
              color: colors.textMuted,
              letterSpacing: '0.04em'
            }}
          >
            Pricing pulled from AWS list (us-east-2), early 2026. Reserved
            EC2 pricing brings the largest line down to ~$5/month if you
            want to pre-commit a year.
          </p>
        </Container>
      </section>

      {/* ==================== Comparison vs managed platforms ==================== */}
      <section
        id="comparison"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        <Container narrow>
          <HudLabel tone="magenta">What you&apos;d pay on a platform</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              color: colors.text,
              letterSpacing: '-0.015em',
              margin: `${space.md} 0 ${space.lg}`
            }}
          >
            The same feature set on Wix, Squarespace, Shopify, or WordPress.
          </h2>
          <p
            style={{
              margin: `0 0 ${space.xl}`,
              maxWidth: '60ch',
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.65
            }}
          >
            Apples to apples is hard because none of these platforms ship a
            single tier that covers "auth + payments + scheduled jobs +
            custom admin dashboard + your own data model + first-party
            tracking" out of the box. The numbers below are the realistic
            running cost once you add the apps an actual small business
            ends up needing.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
            {COMPARISONS.map((c) => (
              <Card key={c.platform} variant="accent" padding={space.lg}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: space.md,
                    flexWrap: 'wrap',
                    alignItems: 'baseline'
                  }}
                >
                  <h3
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: fontSizes.lg,
                      fontWeight: fontWeights.semibold,
                      color: colors.text,
                      margin: 0,
                      letterSpacing: '-0.005em'
                    }}
                  >
                    {c.platform}
                  </h3>
                  <span
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: fontSizes.md,
                      color: colors.magenta,
                      fontWeight: fontWeights.semibold
                    }}
                  >
                    {c.monthly}
                  </span>
                </div>
                <p
                  style={{
                    margin: `${space.sm} 0 0`,
                    fontSize: fontSizes.sm,
                    color: colors.textSecondary,
                    lineHeight: 1.65
                  }}
                >
                  {c.extra}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ==================== Why platforms are opaque ==================== */}
      <section
        id="opaque"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl']
        }}
      >
        <Container narrow>
          <HudLabel tone="corona">Why the gap exists</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              color: colors.text,
              letterSpacing: '-0.015em',
              margin: `${space.md} 0 ${space.lg}`
            }}
          >
            Managed platforms aren&apos;t expensive because the work is hard.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
            <p
              style={{
                margin: 0,
                fontSize: fontSizes.md,
                color: colors.textSecondary,
                lineHeight: 1.7
              }}
            >
              They&apos;re expensive because their pricing has two jobs:
              upsell you onto more of their services, and make it expensive
              for you to leave. Tiered plans, per-transaction fees, app
              marketplaces with their own per-order tax, "talk to sales"
              walls on anything custom, contractual data-export friction.
              It all looks like a discrete monthly subscription on the
              surface, and on the actual invoice it&apos;s a percentage of
              your revenue.
            </p>
            <p
              style={{
                margin: 0,
                fontSize: fontSizes.md,
                color: colors.textSecondary,
                lineHeight: 1.7
              }}
            >
              For most small businesses that&apos;s a fair trade for a
              while. You don&apos;t want to manage a server when you&apos;re
              learning what your product is. But once the product is
              working and the bill is climbing, the same managed platform
              that helped you launch is now the largest fixed cost on your
              books, and the platform tax is being applied to every order
              you take.
            </p>
            <p
              style={{
                margin: 0,
                fontSize: fontSizes.md,
                color: colors.textSecondary,
                lineHeight: 1.7
              }}
            >
              The fork in the road usually shows up around $100/month in
              platform fees. That&apos;s the moment when migrating to a
              setup like this one, that runs at ten percent of the cost
              and gives you the source code, starts paying for itself in
              six to twelve months of savings on top of whatever it
              actually unlocks for the product.
            </p>
          </div>
        </Container>
      </section>

      {/* ==================== The security blast radius ==================== */}
      <section
        id="security"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        <Container narrow>
          <HudLabel tone="magenta">When the platform gets popped</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              color: colors.text,
              letterSpacing: '-0.015em',
              margin: `${space.md} 0 ${space.lg}`
            }}
          >
            Mass platforms are mass targets. Being a small custom site is a security feature.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
            <p
              style={{
                margin: 0,
                fontSize: fontSizes.md,
                color: colors.textSecondary,
                lineHeight: 1.7
              }}
            >
              Big managed platforms run effectively identical software for
              millions of sites. That&apos;s economically efficient for
              them and operationally efficient for you, right until
              somebody finds a way in. Then it isn&apos;t. WordPress and
              its plugin ecosystem alone have had years where a single CVE
              quietly compromised hundreds of thousands of sites over a
              weekend. The pattern is not exotic; it&apos;s the business
              model of mass exploitation. One vulnerability, thousands of
              victims, attacker ROI through the roof.
            </p>
            <p
              style={{
                margin: 0,
                fontSize: fontSizes.md,
                color: colors.textSecondary,
                lineHeight: 1.7
              }}
            >
              When that happens, your site is in the blast radius
              regardless of how careful you have been. The platform&apos;s
              security posture is your ceiling. You can&apos;t patch what
              you don&apos;t control, you usually can&apos;t even verify
              what version of what runtime your tenant is running, and the
              first you hear about the breach is when your bank starts
              declining the cards your customers used last Tuesday.
            </p>
            <p
              style={{
                margin: 0,
                fontSize: fontSizes.md,
                color: colors.textSecondary,
                lineHeight: 1.7
              }}
            >
              A bespoke site running its own stack is a one-off target.
              Exploiting it costs an attacker the same effort as
              exploiting a single WordPress install, but the payoff is one
              site instead of fifty thousand. They go elsewhere. You also
              get to make security choices that aren&apos;t available on a
              shared tenant: rate limiters tuned to your actual traffic,
              CSPs scoped to your actual integrations, secrets managed
              your way, audit logs you can read, and an attack surface
              you can list on one page.
            </p>
            <p
              style={{
                margin: 0,
                paddingTop: space.md,
                borderTop: `1px dashed ${colors.borderSubtle}`,
                fontFamily: fonts.heading,
                fontSize: fontSizes.lg,
                color: colors.text,
                fontWeight: fontWeights.semibold,
                letterSpacing: '-0.005em',
                lineHeight: 1.4
              }}
            >
              Bespoke isn&apos;t an upgrade to your security. It&apos;s a
              downgrade to your value as a target, and that&apos;s often
              the same thing in practice.
            </p>
          </div>
        </Container>
      </section>

      {/* ==================== What you get when I build it ==================== */}
      <section
        id="ownership"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        <Container narrow>
          <HudLabel tone="cyan">What you get when I build it</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              color: colors.text,
              letterSpacing: '-0.015em',
              margin: `${space.md} 0 ${space.xl}`
            }}
          >
            No platform tax. No vendor lock-in. The invoice comes from AWS.
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: space.lg
            }}
          >
            {OWNERSHIP.map((item) => (
              <Card key={item.title} padding={space.lg}>
                <h3
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: fontSizes.md,
                    fontWeight: fontWeights.semibold,
                    color: colors.text,
                    margin: 0,
                    marginBottom: space.sm,
                    letterSpacing: '-0.005em'
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: colors.textSecondary,
                    fontSize: fontSizes.sm,
                    lineHeight: 1.65
                  }}
                >
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================== Closing CTA =========================== */}
      <section
        id="cta"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl']
        }}
      >
        <Container narrow style={{ textAlign: 'center' }}>
          <HudLabel tone="magenta">If your platform bill is over $100/month</HudLabel>
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
            Worth a 30-minute conversation.
          </h2>
          <p
            style={{
              margin: `0 auto`,
              maxWidth: '60ch',
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.65
            }}
          >
            I can usually tell within a call whether moving you off the
            platform is going to pay for itself. If it isn&apos;t, I will
            say so. If it is, the typical shape is a four-to-six-week
            build sprint plus a one-page handover doc and a
            twenty-dollar-a-month AWS bill you own.
          </p>
          <div
            style={{
              marginTop: space.xl,
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
            <Button as={Link} to="/#engagements" variant="secondary" size="lg">
              See the engagement shapes
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
