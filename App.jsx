const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "oklch(0.78 0.14 75)",
  "darkBg": "oklch(0.14 0.018 260)",
  "lightBg": "oklch(0.975 0.006 85)",
  "density": 1,
  "borderRadius": "6px"
}/*EDITMODE-END*/;

const { useState, useEffect, useRef } = React;

/* ─── Data ─── */

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const METRICS = [
  { value: "38%", label: "fewer status meetings" },
  { value: "2.4×", label: "faster spec-to-ship" },
  { value: "1,200+", label: "teams onboarded" },
];

const PROBLEMS = [
  {
    title: "Context lives everywhere",
    body: "Design specs in Notion, tasks in Jira, decisions buried in Slack threads. By the time a ticket reaches engineering, half the context is lost.",
  },
  {
    title: "Meetings replace alignment",
    body: "Without a shared source of truth, teams default to sync calls. Thirty-minute standups become sixty because nobody knows what changed overnight.",
  },
  {
    title: "Handoffs break momentum",
    body: "Passing work between design, product, and engineering requires copy-pasting links, re-explaining requirements, and hunting for the latest version.",
  },
];

const FEATURES = [
  {
    title: "Living specs",
    desc: "Write requirements once and keep them current. Linked tasks update in real time, so engineers always build against the latest intent — not a PDF from two sprints ago.",
    icon: "spec",
  },
  {
    title: "Unified task board",
    desc: "Every task connects to its spec, its discussion thread, and its deployment status. Drag across stages without losing a single decision or rationale.",
    icon: "board",
  },
  {
    title: "Async decisions",
    desc: "Replace Slack debates with structured, time-stamped threads tied to specific requirements. Resolve ambiguity once and reference it forever.",
    icon: "thread",
  },
  {
    title: "Ship readiness",
    desc: "A single dashboard surfaces what's blocked, what's spec-complete, and what's ready for QA. Stop asking 'are we there yet?' in every standup.",
    icon: "dashboard",
  },
  {
    title: "Version history",
    desc: "Every spec change is diffed, attributed, and reversible. Roll back a requirement the same way you roll back code — with full context.",
    icon: "history",
  },
  {
    title: "Integrations",
    desc: "Two-way sync with Linear, GitHub, Jira, and Figma keeps Tandem connected to the tools your team already trusts. No rip-and-replace required.",
    icon: "integration",
  },
];

const TESTIMONIALS = [
  {
    quote: "We cut our planning cycle from three weeks to five days. Tandem gave us a single place to argue, decide, and ship — in that order.",
    name: "Maren Kasper",
    role: "VP Product, Relay Commerce",
  },
  {
    quote: "The moment we stopped using Notion for specs and Jira for tasks separately, everything clicked. Engineers actually read the spec now.",
    name: "Tomás Rivera",
    role: "Engineering Lead, Caravel",
  },
  {
    quote: "Onboarding a new PM used to take a week of doc tours. With Tandem, they're productive on day two because everything is connected.",
    name: "Priya Nair",
    role: "COO, Bloom Health",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "For small teams getting organized.",
    features: [
      "Up to 5 members",
      "10 active specs",
      "Basic task board",
      "Community support",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/seat/mo",
    desc: "For teams shipping every week.",
    features: [
      "Unlimited members",
      "Unlimited specs",
      "Async decisions",
      "Integrations (Linear, GitHub, Figma)",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    desc: "For organizations with multiple teams.",
    features: [
      "Everything in Pro",
      "SSO & SAML",
      "Advanced permissions",
      "Dedicated success manager",
      "Uptime SLA",
    ],
    cta: "Talk to sales",
    highlighted: false,
  },
];

const FAQ_DATA = [
  {
    q: "How is Tandem different from Notion or Linear?",
    a: "Notion is a blank canvas. Linear is a task tracker. Tandem is purpose-built for the spec-to-ship workflow — requirements, tasks, and decisions stay linked as a single thread. You can still sync both directions with tools your team already uses.",
  },
  {
    q: "Can I import existing specs and tasks?",
    a: "Yes. Tandem has one-click importers for Notion, Confluence, Jira, and Linear. Historical comments and attachments carry over so you don't lose context.",
  },
  {
    q: "What happens when my team grows beyond five people?",
    a: "Your workspace stays intact. Add seats on the Pro plan at any time and every member inherits the same specs, boards, and decision history.",
  },
  {
    q: "Is my data secure?",
    a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Tandem is SOC 2 Type II certified. Scale plan customers get SSO/SAML and an uptime SLA.",
  },
  {
    q: "Do you offer a free trial for Pro?",
    a: "Every Pro workspace starts with a 14-day free trial. No credit card required. If you decide not to continue, your workspace reverts to the Starter plan with all data intact.",
  },
];

/* ─── SVG Icons ─── */

function FeatureIcon({ kind }) {
  const icons = {
    spec: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="20" height="22" rx="3" />
        <line x1="9" y1="9" x2="19" y2="9" />
        <line x1="9" y1="14" x2="19" y2="14" />
        <line x1="9" y1="19" x2="15" y2="19" />
      </svg>
    ),
    board: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="22" rx="2" />
        <rect x="12.5" y="3" width="7" height="15" rx="2" />
        <rect x="22" y="3" width="3" height="8" rx="1" />
      </svg>
    ),
    thread: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H10l-4 4v-4H4a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z" transform="translate(2,2)" />
        <circle cx="10" cy="12" r="1" fill="currentColor" />
        <circle cx="14" cy="12" r="1" fill="currentColor" />
        <circle cx="18" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
    dashboard: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="22" height="22" rx="3" />
        <line x1="3" y1="11" x2="25" y2="11" />
        <line x1="11" y1="11" x2="11" y2="25" />
        <circle cx="7" cy="7" r="1" fill="currentColor" />
        <circle cx="10" cy="7" r="1" fill="currentColor" />
      </svg>
    ),
    history: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 14a11 11 0 1 0 3-7.5" />
        <polyline points="3 4 3 9 8 9" />
        <line x1="14" y1="9" x2="14" y2="15" />
        <line x1="11" y1="12" x2="17" y2="12" />
      </svg>
    ),
    integration: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="4" />
        <circle cx="20" cy="8" r="4" />
        <circle cx="14" cy="20" r="4" />
        <line x1="11" y1="10" x2="17" y2="10" />
        <line x1="9.5" y1="12" x2="12.5" y2="17" />
        <line x1="18.5" y1="12" x2="15.5" y2="17" />
      </svg>
    ),
  };
  return <span style={{ display: "inline-flex", color: "var(--accent)" }}>{icons[kind]}</span>;
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
      <polyline points="3 8 6.5 11.5 13 5" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
        transition: "transform 200ms cubic-bezier(0.4,0,0.2,1)",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="4.5 6.75 9 11.25 13.5 6.75" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="8" x2="13" y2="8" />
      <polyline points="9 4 13 8 9 12" />
    </svg>
  );
}

/* ─── Main App ─── */

function App() {
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap');

        :root {
          --accent: ${TWEAK_DEFAULTS.accentColor};
          --dark-bg: ${TWEAK_DEFAULTS.darkBg};
          --dark-surface: oklch(0.18 0.015 260);
          --dark-border: oklch(0.26 0.015 260);
          --text-on-dark: oklch(0.95 0.008 80);
          --text-on-dark-muted: oklch(0.62 0.015 260);
          --light-bg: ${TWEAK_DEFAULTS.lightBg};
          --light-surface: oklch(0.99 0.004 85);
          --light-border: oklch(0.90 0.01 85);
          --text-on-light: oklch(0.16 0.02 260);
          --text-on-light-muted: oklch(0.48 0.018 260);
          --radius: ${TWEAK_DEFAULTS.borderRadius};
          --font-display: 'Fraunces', 'Georgia', serif;
          --font-body: 'Outfit', 'Segoe UI', sans-serif;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body {
          font-family: var(--font-body);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-x: hidden;
          background: var(--dark-bg);
          color: var(--text-on-dark);
        }

        /* ─── Animations ─── */

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }

        .anim-fade-up {
          opacity: 0;
          animation: fadeInUp 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-fade {
          opacity: 0;
          animation: fadeIn 600ms ease forwards;
        }
        .anim-slide-right {
          opacity: 0;
          animation: slideInRight 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .delay-1 { animation-delay: 100ms; }
        .delay-2 { animation-delay: 200ms; }
        .delay-3 { animation-delay: 300ms; }
        .delay-4 { animation-delay: 400ms; }
        .delay-5 { animation-delay: 500ms; }
        .delay-6 { animation-delay: 600ms; }
        .delay-7 { animation-delay: 700ms; }
        .delay-8 { animation-delay: 800ms; }

        /* ─── Noise overlay ─── */

        .noise::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        /* ─── Focus rings ─── */

        a:focus-visible, button:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
          border-radius: 3px;
        }

        /* ─── Mobile nav overlay ─── */

        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 250ms ease;
        }
        .mobile-overlay.open {
          opacity: 1;
          pointer-events: all;
        }

        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
        }
        @media (min-width: 641px) {
          .show-mobile-only { display: none !important; }
        }
      `}</style>

      {/* ─── Navigation ─── */}
      <nav
        className="anim-fade delay-1"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: scrolled ? "0.75rem 0" : "1.25rem 0",
          background: scrolled ? "rgba(20,21,28,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
          borderBottom: scrolled ? "1px solid var(--dark-border)" : "1px solid transparent",
          transition: "padding 250ms ease, background 250ms ease, border-color 250ms ease",
        }}
      >
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.3rem",
              fontWeight: 600,
              color: "var(--text-on-dark)",
              letterSpacing: "-0.02em",
              cursor: "default",
              userSelect: "none",
            }}
          >
            Tandem
          </span>

          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 400,
                color: "var(--text-on-dark-muted)",
                textDecoration: "none",
                transition: "color 150ms ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-on-dark)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-on-dark-muted)")}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.55rem 1.3rem",
                fontSize: "0.85rem",
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                color: "var(--dark-bg)",
                background: "var(--accent)",
                borderRadius: "var(--radius)",
                textDecoration: "none",
                transition: "transform 150ms ease, box-shadow 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 20px oklch(0.78 0.14 75 / 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Start free trial
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="show-mobile-only"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label={mobileNav ? "Close menu" : "Open menu"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.5rem",
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            <span style={{ display: "block", width: 22, height: 2, background: "var(--text-on-dark)", borderRadius: 1, transition: "transform 200ms", transform: mobileNav ? "rotate(45deg) translate(3px,3px)" : "none" }} />
            <span style={{ display: "block", width: 22, height: 2, background: "var(--text-on-dark)", borderRadius: 1, opacity: mobileNav ? 0 : 1, transition: "opacity 150ms" }} />
            <span style={{ display: "block", width: 22, height: 2, background: "var(--text-on-dark)", borderRadius: 1, transition: "transform 200ms", transform: mobileNav ? "rotate(-45deg) translate(3px,-3px)" : "none" }} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileNav && (
          <div className="show-mobile-only" style={{
            padding: "1rem 2rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            borderTop: "1px solid var(--dark-border)",
            marginTop: "0.75rem",
          }}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileNav(false)}
                style={{
                  fontSize: "1rem",
                  color: "var(--text-on-dark)",
                  textDecoration: "none",
                  padding: "0.5rem 0",
                  fontWeight: 400,
                }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#pricing"
              onClick={() => setMobileNav(false)}
              style={{
                display: "inline-flex",
                justifyContent: "center",
                padding: "0.65rem 1.3rem",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "var(--dark-bg)",
                background: "var(--accent)",
                borderRadius: "var(--radius)",
                textDecoration: "none",
                marginTop: "0.25rem",
              }}
            >
              Start free trial
            </a>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="noise" style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: `
          radial-gradient(ellipse 80% 60% at 15% 50%, oklch(0.22 0.06 260 / 0.6) 0%, transparent 60%),
          radial-gradient(ellipse 50% 80% at 85% 30%, oklch(0.78 0.14 75 / 0.06) 0%, transparent 50%),
          var(--dark-bg)
        `,
        overflow: "hidden",
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "7rem 2rem 5rem",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
          gap: "4rem",
          alignItems: "center",
          width: "100%",
        }}>
          {/* Left: copy */}
          <div style={{ maxWidth: 560 }}>
            <p className="anim-fade-up delay-1" style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(0.8rem, 1.1vw, 0.9rem)",
              fontWeight: 500,
              color: "var(--accent)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}>
              For product teams of 3 – 50
            </p>

            <h1 className="anim-fade-up delay-2" style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)",
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: "-0.035em",
              color: "var(--text-on-dark)",
              marginBottom: "1.5rem",
              fontVariationSettings: "'opsz' 144",
            }}>
              Build products,<br />not process.
            </h1>

            <p className="anim-fade-up delay-3" style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(1.05rem, 1.5vw, 1.2rem)",
              fontWeight: 300,
              lineHeight: 1.65,
              color: "var(--text-on-dark-muted)",
              marginBottom: "2.5rem",
              maxWidth: 480,
            }}>
              Tandem unifies your specs, tasks, and team decisions in one workspace. Stop juggling six tools — start shipping features.
            </p>

            <div className="anim-fade-up delay-4" style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", alignItems: "center" }}>
              <a
                href="#pricing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.85rem 2rem",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  fontFamily: "var(--font-body)",
                  color: "var(--dark-bg)",
                  background: "var(--accent)",
                  borderRadius: "var(--radius)",
                  textDecoration: "none",
                  transition: "transform 150ms ease, box-shadow 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 24px oklch(0.78 0.14 75 / 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Start building free
              </a>
              <a
                href="#features"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.85rem 1.6rem",
                  fontSize: "0.95rem",
                  fontWeight: 400,
                  fontFamily: "var(--font-body)",
                  color: "var(--text-on-dark-muted)",
                  background: "transparent",
                  border: "1px solid var(--dark-border)",
                  borderRadius: "var(--radius)",
                  textDecoration: "none",
                  transition: "color 150ms ease, border-color 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-on-dark)";
                  e.currentTarget.style.borderColor = "var(--text-on-dark-muted)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-on-dark-muted)";
                  e.currentTarget.style.borderColor = "var(--dark-border)";
                }}
              >
                See how it works
              </a>
            </div>

            <p className="anim-fade-up delay-5" style={{
              marginTop: "1.75rem",
              fontSize: "0.8rem",
              color: "var(--text-on-dark-muted)",
              fontWeight: 400,
              opacity: 0.7,
            }}>
              Free for teams up to 5 — no credit card required
            </p>
          </div>

          {/* Right: product preview */}
          <div className="anim-slide-right delay-5 hide-mobile" style={{
            background: "var(--dark-surface)",
            border: "1px solid var(--dark-border)",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 24px 80px oklch(0 0 0 / 0.35), 0 0 0 1px oklch(1 0 0 / 0.03)",
          }}>
            {/* Titlebar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "0.75rem 1rem",
              borderBottom: "1px solid var(--dark-border)",
            }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "oklch(0.65 0.15 25)" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "oklch(0.75 0.14 75)" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "oklch(0.6 0.12 155)" }} />
              <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-on-dark-muted)", fontWeight: 400 }}>
                Tandem — Sprint 14
              </span>
            </div>

            {/* Toolbar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "0.6rem 1rem",
              borderBottom: "1px solid var(--dark-border)",
              fontSize: "0.72rem",
              color: "var(--text-on-dark-muted)",
              fontWeight: 400,
            }}>
              <span style={{ color: "var(--text-on-dark)", fontWeight: 500 }}>Board</span>
              <span>Specs</span>
              <span>Decisions</span>
              <span>Timeline</span>
              <span style={{ marginLeft: "auto", padding: "0.2rem 0.6rem", background: "oklch(0.22 0.015 260)", borderRadius: 4, fontSize: "0.68rem" }}>
                ⌘K
              </span>
            </div>

            {/* Columns */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 0,
              minHeight: 220,
            }}>
              {["To Do", "In Progress", "Done"].map((col, ci) => (
                <div key={col} style={{
                  padding: "0.75rem",
                  borderRight: ci < 2 ? "1px solid var(--dark-border)" : "none",
                }}>
                  <div style={{
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    color: ci === 2 ? "var(--accent)" : "var(--text-on-dark-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: ci === 0 ? "oklch(0.62 0.15 260)" : ci === 1 ? "var(--accent)" : "oklch(0.65 0.15 155)",
                    }} />
                    {col}
                    <span style={{
                      marginLeft: "auto",
                      fontSize: "0.62rem",
                      color: "var(--text-on-dark-muted)",
                      opacity: 0.6,
                    }}>
                      {ci === 0 ? "4" : ci === 1 ? "2" : "3"}
                    </span>
                  </div>

                  {(ci === 0 ? [
                    { tag: "Spec", color: "oklch(0.55 0.12 260)" },
                    { tag: "Spec", color: "oklch(0.55 0.12 260)" },
                    { tag: "Bug", color: "oklch(0.6 0.15 25)" },
                    { tag: "Task", color: "oklch(0.45 0.02 260)" },
                  ] : ci === 1 ? [
                    { tag: "Spec", color: "oklch(0.55 0.12 260)" },
                    { tag: "Task", color: "oklch(0.45 0.02 260)" },
                  ] : [
                    { tag: "Spec", color: "oklch(0.55 0.12 260)" },
                    { tag: "Task", color: "oklch(0.45 0.02 260)" },
                    { tag: "Bug", color: "oklch(0.6 0.15 25)" },
                  ]).map((card, i) => (
                    <div key={i} style={{
                      background: "oklch(0.22 0.012 260)",
                      borderRadius: 5,
                      padding: "0.55rem 0.65rem",
                      marginBottom: i < (ci === 0 ? 3 : ci === 1 ? 1 : 2) ? "0.4rem" : 0,
                    }}>
                      <div style={{
                        display: "inline-block",
                        fontSize: "0.58rem",
                        fontWeight: 600,
                        padding: "0.1rem 0.4rem",
                        borderRadius: 3,
                        background: card.color.replace(")", " / 0.18)"),
                        color: card.color,
                        marginBottom: "0.3rem",
                      }}>
                        {card.tag}
                      </div>
                      <div style={{
                        width: ci === 0 && i === 0 ? "75%" : ci === 0 && i === 1 ? "88%" : "65%",
                        height: 6,
                        borderRadius: 3,
                        background: "oklch(0.3 0.01 260)",
                      }} />
                      {ci === 1 && i === 0 && (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          marginTop: 6,
                        }}>
                          <div style={{
                            width: 18,
                            height: 3,
                            borderRadius: 2,
                            background: "oklch(0.3 0.01 260)",
                            position: "relative",
                            overflow: "hidden",
                          }}>
                            <div style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              bottom: 0,
                              width: "60%",
                              background: "var(--accent)",
                              borderRadius: 2,
                            }} />
                          </div>
                          <span style={{ fontSize: "0.56rem", color: "var(--accent)", fontWeight: 500 }}>60%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gradient fade at bottom */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: "linear-gradient(to bottom, transparent, var(--dark-bg))",
          pointerEvents: "none",
        }} />
      </section>

      {/* ─── Metrics bar ─── */}
      <section style={{
        background: "var(--dark-bg)",
        padding: "0 2rem 4rem",
      }}>
        <div style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "2rem",
          textAlign: "center",
        }}>
          {METRICS.map((m, i) => (
            <div key={m.label} className={`anim-fade-up delay-${i + 5}`}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                fontWeight: 600,
                color: "var(--accent)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: "0.4rem",
              }}>
                {m.value}
              </div>
              <div style={{
                fontSize: "0.85rem",
                fontWeight: 400,
                color: "var(--text-on-dark-muted)",
              }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Problem section ─── */}
      <section style={{
        background: "var(--light-bg)",
        padding: "clamp(4rem, 8vw, 7rem) 2rem",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "0.75rem",
          }}>
            The problem
          </p>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            color: "var(--text-on-light)",
            marginBottom: "3.5rem",
            maxWidth: 580,
          }}>
            Scattered tools slow teams down
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2.5rem",
          }}>
            {PROBLEMS.map((p, i) => (
              <div key={i} style={{
                paddingTop: "1.5rem",
                borderTop: "1px solid var(--light-border)",
              }}>
                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.15rem",
                  fontWeight: 500,
                  color: "var(--text-on-light)",
                  marginBottom: "0.65rem",
                  letterSpacing: "-0.01em",
                }}>
                  {p.title}
                </h3>
                <p style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.65,
                  color: "var(--text-on-light-muted)",
                  fontWeight: 300,
                }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" style={{
        background: "var(--light-surface)",
        padding: "clamp(4rem, 8vw, 7rem) 2rem",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "0.75rem",
          }}>
            Features
          </p>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            color: "var(--text-on-light)",
            marginBottom: "1rem",
            maxWidth: 520,
          }}>
            Everything your team needs to ship together
          </h2>
          <p style={{
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "var(--text-on-light-muted)",
            maxWidth: 520,
            marginBottom: "3.5rem",
            fontWeight: 300,
          }}>
            Specs, tasks, and decisions stay linked from first draft to deployment. No more copy-pasting between tools.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                style={{
                  padding: "2rem",
                  background: "var(--light-bg)",
                  border: "1px solid var(--light-border)",
                  borderRadius: "calc(var(--radius) + 2px)",
                  transition: "border-color 200ms ease, box-shadow 200ms ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "oklch(0.78 0.14 75 / 0.4)";
                  e.currentTarget.style.boxShadow = "0 2px 20px oklch(0.78 0.14 75 / 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--light-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "oklch(0.78 0.14 75 / 0.1)",
                  borderRadius: "var(--radius)",
                  marginBottom: "1.25rem",
                }}>
                  <FeatureIcon kind={f.icon} />
                </div>
                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  color: "var(--text-on-light)",
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.01em",
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontSize: "0.875rem",
                  lineHeight: 1.65,
                  color: "var(--text-on-light-muted)",
                  fontWeight: 300,
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Social proof ─── */}
      <section className="noise" style={{
        background: "var(--dark-bg)",
        padding: "clamp(4rem, 8vw, 6rem) 2rem",
        position: "relative",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "0.75rem",
          }}>
            Trusted by product teams
          </p>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            color: "var(--text-on-dark)",
            marginBottom: "3.5rem",
            maxWidth: 480,
          }}>
            Hear from teams that stopped switching tools
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}>
            {TESTIMONIALS.map((t, i) => (
              <blockquote key={i} style={{
                padding: "2rem",
                background: "var(--dark-surface)",
                border: "1px solid var(--dark-border)",
                borderRadius: "calc(var(--radius) + 2px)",
                margin: 0,
              }}>
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.05rem",
                  fontWeight: 400,
                  fontStyle: "italic",
                  lineHeight: 1.55,
                  color: "var(--text-on-dark)",
                  marginBottom: "1.5rem",
                  fontVariationSettings: "'opsz' 24",
                }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer style={{ display: "flex", flexDirection: "column" }}>
                  <cite style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--text-on-dark)",
                    fontStyle: "normal",
                  }}>
                    {t.name}
                  </cite>
                  <span style={{
                    fontSize: "0.78rem",
                    color: "var(--text-on-dark-muted)",
                    fontWeight: 400,
                  }}>
                    {t.role}
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>

          {/* Company logos as wordmarks */}
          <div style={{
            marginTop: "3.5rem",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "2.5rem",
            alignItems: "center",
          }}>
            {["Relay Commerce", "Caravel", "Bloom Health", "Arc Design", "Nimbus AI"].map((name) => (
              <span key={name} style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.82rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--text-on-dark-muted)",
                opacity: 0.5,
              }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" style={{
        background: "var(--light-bg)",
        padding: "clamp(4rem, 8vw, 7rem) 2rem",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "0.75rem",
          }}>
            Pricing
          </p>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            color: "var(--text-on-light)",
            marginBottom: "1rem",
            maxWidth: 480,
          }}>
            Start free, scale when you're ready
          </h2>
          <p style={{
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "var(--text-on-light-muted)",
            maxWidth: 480,
            marginBottom: "3.5rem",
            fontWeight: 300,
          }}>
            No credit card for the Starter plan. Upgrade to Pro for a 14-day free trial.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            alignItems: "start",
          }}>
            {PRICING.map((tier, i) => (
              <div key={i} style={{
                padding: "2.25rem 2rem",
                background: tier.highlighted ? "var(--text-on-light)" : "var(--light-surface)",
                border: `1px solid ${tier.highlighted ? "transparent" : "var(--light-border)"}`,
                borderRadius: "calc(var(--radius) + 2px)",
                position: "relative",
                transition: "box-shadow 200ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = tier.highlighted
                  ? "0 12px 40px oklch(0.16 0.02 260 / 0.2)"
                  : "0 4px 24px oklch(0.16 0.02 260 / 0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
              >
                {tier.highlighted && (
                  <div style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "0.25rem 0.85rem",
                    background: "var(--accent)",
                    borderRadius: 99,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "oklch(0.18 0.01 80)",
                    letterSpacing: "0.03em",
                    whiteSpace: "nowrap",
                  }}>
                    Most popular
                  </div>
                )}

                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  color: tier.highlighted ? "var(--light-bg)" : "var(--text-on-light)",
                  marginBottom: "0.35rem",
                }}>
                  {tier.name}
                </h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem", marginBottom: "0.35rem" }}>
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2rem, 3vw, 2.5rem)",
                    fontWeight: 600,
                    color: tier.highlighted ? "var(--light-bg)" : "var(--text-on-light)",
                    letterSpacing: "-0.03em",
                  }}>
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span style={{
                      fontSize: "0.85rem",
                      color: tier.highlighted ? "oklch(0.7 0.01 260)" : "var(--text-on-light-muted)",
                      fontWeight: 400,
                    }}>
                      {tier.period}
                    </span>
                  )}
                </div>
                <p style={{
                  fontSize: "0.85rem",
                  color: tier.highlighted ? "oklch(0.7 0.01 260)" : "var(--text-on-light-muted)",
                  marginBottom: "1.75rem",
                  fontWeight: 400,
                }}>
                  {tier.desc}
                </p>

                <button
                  type="button"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    padding: "0.7rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    fontFamily: "var(--font-body)",
                    color: tier.highlighted ? "oklch(0.18 0.01 80)" : "var(--text-on-light)",
                    background: tier.highlighted ? "var(--accent)" : "transparent",
                    border: tier.highlighted ? "none" : "1px solid var(--light-border)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    marginBottom: "1.75rem",
                    transition: "transform 150ms ease, box-shadow 150ms ease, background 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (tier.highlighted) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 16px oklch(0.78 0.14 75 / 0.3)";
                    } else {
                      e.currentTarget.style.background = "oklch(0.93 0.01 85)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                    if (!tier.highlighted) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {tier.cta}
                </button>

                <ul style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.7rem",
                }}>
                  {tier.features.map((feat) => (
                    <li key={feat} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.6rem",
                      fontSize: "0.85rem",
                      color: tier.highlighted ? "oklch(0.85 0.005 260)" : "var(--text-on-light-muted)",
                      fontWeight: 400,
                    }}>
                      <CheckIcon />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" style={{
        background: "var(--light-surface)",
        padding: "clamp(4rem, 8vw, 7rem) 2rem",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "0.75rem",
          }}>
            FAQ
          </p>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            color: "var(--text-on-light)",
            marginBottom: "3rem",
          }}>
            Common questions
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {FAQ_DATA.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} style={{ borderBottom: "1px solid var(--light-border)" }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                      padding: "1.25rem 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "var(--font-body)",
                      fontSize: "1rem",
                      fontWeight: 500,
                      color: isOpen ? "var(--text-on-light)" : "var(--text-on-light-muted)",
                      transition: "color 150ms ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-on-light)")}
                    onMouseLeave={(e) => {
                      if (!isOpen) e.currentTarget.style.color = "var(--text-on-light-muted)";
                    }}
                  >
                    {item.q}
                    <ChevronIcon open={isOpen} />
                  </button>
                  <div style={{
                    maxHeight: isOpen ? 200 : 0,
                    overflow: "hidden",
                    transition: "max-height 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }}>
                    <p style={{
                      fontSize: "0.9rem",
                      lineHeight: 1.65,
                      color: "var(--text-on-light-muted)",
                      fontWeight: 300,
                      paddingBottom: isOpen ? "1.25rem" : 0,
                      maxWidth: 600,
                    }}>
                      {item.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA banner ─── */}
      <section className="noise" style={{
        background: "var(--dark-bg)",
        padding: "clamp(4rem, 8vw, 6rem) 2rem",
        position: "relative",
      }}>
        <div style={{
          maxWidth: 640,
          margin: "0 auto",
          textAlign: "center",
        }}>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "var(--text-on-dark)",
            marginBottom: "1rem",
          }}>
            Ready to build without friction?
          </h2>
          <p style={{
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "var(--text-on-dark-muted)",
            marginBottom: "2.5rem",
            fontWeight: 300,
          }}>
            Join 1,200+ teams that replaced their tool sprawl with a single, connected workspace.
          </p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0.85rem" }}>
            <a
              href="#pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.85rem 2.2rem",
                fontSize: "0.95rem",
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                color: "var(--dark-bg)",
                background: "var(--accent)",
                borderRadius: "var(--radius)",
                textDecoration: "none",
                transition: "transform 150ms ease, box-shadow 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 24px oklch(0.78 0.14 75 / 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Start free trial <ArrowIcon />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{
        background: "var(--dark-bg)",
        borderTop: "1px solid var(--dark-border)",
        padding: "3rem 2rem",
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.5rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "var(--text-on-dark)",
              letterSpacing: "-0.02em",
            }}>
              Tandem
            </span>
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} style={{
                fontSize: "0.8rem",
                color: "var(--text-on-dark-muted)",
                textDecoration: "none",
                fontWeight: 400,
                transition: "color 150ms ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-on-dark)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-on-dark-muted)")}
              >
                {link.label}
              </a>
            ))}
          </div>
          <span style={{
            fontSize: "0.78rem",
            color: "var(--text-on-dark-muted)",
            opacity: 0.6,
          }}>
            © {new Date().getFullYear()} Tandem, Inc. All rights reserved.
          </span>
        </div>
      </footer>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
