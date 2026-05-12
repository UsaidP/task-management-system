const fs = require('fs');

let code = `import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../theme/ThemeToggle';
import Logo from '../components/common/Logo';

const T = {
  bg: "var(--bg)",
  bgAlt: "var(--bgAlt)",
  neutral: "var(--neutral)",
  surface: "var(--surface)",
  surfaceHi: "var(--surfaceHi)",
  text: "var(--text)",
  textMuted: "var(--textMuted)",
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  accent: "var(--accent)",
  radius: "14px",
};

const globalCSS = \`
:root {
  --bg: #ffffff;
  --bgAlt: #f8fafc;
  --neutral: #cbd5e1;
  --surface: #ffffff;
  --surfaceHi: #f1f5f9;
  --text: #0f172a;
  --textMuted: #64748b;
  --primary: #4f46e5;
  --secondary: #8b5cf6;
  --accent: #0ea5e9;
  
  --primary-rgb: 79, 70, 229;
  --secondary-rgb: 139, 92, 246;
  --accent-rgb: 14, 165, 233;
  
  --border-light: rgba(0,0,0,0.06);
  --border-med: rgba(0,0,0,0.12);
  --border-heavy: rgba(0,0,0,0.2);
  
  --cardGrad1: #f8fafc;
  --cardGrad2: #f1f5f9;
  --cardGrad3: #ffffff;
  --cardGrad4: #f8fafc;
}

.dark {
  --bg: #0f1219;
  --bgAlt: #131922;
  --neutral: #2a3140;
  --surface: #1a2030;
  --surfaceHi: #222b3d;
  --text: #f1f4f8;
  --textMuted: #8a93a6;
  --primary: #ff3b71;
  --secondary: #8588b5;
  --accent: #66c7f4;

  --primary-rgb: 255, 59, 113;
  --secondary-rgb: 133, 136, 181;
  --accent-rgb: 102, 199, 244;
  
  --border-light: rgba(255,255,255,0.06);
  --border-med: rgba(255,255,255,0.1);
  --border-heavy: rgba(255,255,255,0.15);
  
  --cardGrad1: #1e2738;
  --cardGrad2: #151c28;
  --cardGrad3: #263045;
  --cardGrad4: #1f2839;
}
\` + [
  "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap');",
  "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}",
  "html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}",
  "body{background:var(--bg);color:var(--text);font-family:'DM Sans',system-ui,sans-serif;line-height:1.6;overflow-x:hidden}",
  "h1,h2,h3,h4,h5,h6{font-family:'Space Grotesk',system-ui,sans-serif;line-height:1.15;letter-spacing:-0.02em}",
  "a{color:inherit;text-decoration:none}",
  "button{font-family:inherit;cursor:pointer}",
  "img{max-width:100%;display:block}",
  "::selection{background:rgba(var(--primary-rgb),0.3)}",
  "@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}",
  "@keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}",
  "@keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}",
  "@keyframes fadeLeft{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}",
  "@keyframes orbit{from{transform:rotate(0deg) translateX(140px) rotate(0deg)}to{transform:rotate(360deg) translateX(140px) rotate(-360deg)}}",
  "@keyframes spin3d{0%{transform:perspective(800px) rotateY(0deg) rotateX(12deg)}100%{transform:perspective(800px) rotateY(360deg) rotateX(12deg)}}"
].join("\\n");

function KanbanBoard3D() {
  const colW = 200, colGap = 20, cardH = 52, cardGap = 12, boardPad = 28;
  const columns = [
    { title: "Backlog", color: T.textMuted, cards: [
      { label: "User research interviews", tag: "Design", tagColor: "var(--accent)" },
      { label: "API rate limiting", tag: "Backend", tagColor: "var(--secondary)" },
      { label: "Mobile nav redesign", tag: "Design", tagColor: "var(--accent)" },
    ]},
    { title: "In Progress", color: T.primary, cards: [
      { label: "Kanban 3D views", tag: "Frontend", tagColor: "var(--primary)" },
      { label: "Stripe integration", tag: "Backend", tagColor: "var(--secondary)" },
    ]},
    { title: "Review", color: "#f5a623", cards: [
      { label: "Dark mode tokens", tag: "Design", tagColor: "var(--accent)" },
      { label: "Onboarding flow", tag: "Product", tagColor: "#4ecdc4" },
    ]},
    { title: "Done", color: "#4ecdc4", cards: [
      { label: "Landing page v2", tag: "Marketing", tagColor: "#f5a623" },
      { label: "Auth overhaul", tag: "Backend", tagColor: "var(--secondary)" },
      { label: "Brand refresh", tag: "Design", tagColor: "var(--accent)" },
    ]},
  ];

  const totalW = columns.length * colW + (columns.length - 1) * colGap + boardPad * 2;

  return (
    <svg viewBox={"0 0 " + totalW + " 400"} width="100%" style={{ maxWidth: 920, filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))" }}>
      <defs>
        <linearGradient id="boardGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--cardGrad1)" }} />
          <stop offset="100%" style={{ stopColor: "var(--cardGrad2)" }} />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--cardGrad3)" }} />
          <stop offset="100%" style={{ stopColor: "var(--cardGrad4)" }} />
        </linearGradient>
        <linearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "rgba(var(--primary-rgb),0.15)" }} />
          <stop offset="100%" style={{ stopColor: "rgba(var(--accent-rgb),0.08)" }} />
        </linearGradient>
      </defs>

      <g transform="translate(20, 30)">
        <rect x="8" y="8" width={totalW} height="360" rx="16" fill="rgba(0,0,0,0.4)" />
        <rect width={totalW} height="360" rx="16" fill="url(#boardGrad)" stroke="var(--border-light)" strokeWidth="1" />
        <rect width={totalW} height="360" rx="16" fill="url(#glowGrad)" opacity="0.4" />
        <line x1={boardPad} y1="52" x2={totalW - boardPad} y2="52" stroke="var(--border-light)" strokeWidth="1" />

        {columns.map(function(col, ci) {
          var x = boardPad + ci * (colW + colGap);
          return (
            <g key={ci}>
              <circle cx={x + 6} cy={36} r="4" fill={col.color} />
              <text x={x + 16} y="40" fill="var(--text)" fontSize="13" fontWeight="600" fontFamily="Space Grotesk, system-ui">{col.title}</text>
              <text x={x + colW - 8} y="40" fill="var(--textMuted)" fontSize="11" textAnchor="end" fontFamily="DM Sans, system-ui">{col.cards.length}</text>
              {col.cards.map(function(card, ki) {
                var y = 68 + ki * (cardH + cardGap);
                return (
                  <g key={ki}>
                    <rect x={x} y={y} width={colW} height={cardH} rx="8" fill="url(#cardGrad)" stroke="var(--border-light)" strokeWidth="1" />
                    <rect x={x} y={y} width={colW} height="1" rx="0.5" fill="var(--border-med)" />
                    <text x={x + 12} y={y + 24} fill="var(--text)" fontSize="12" fontWeight="500" fontFamily="DM Sans, system-ui">{card.label}</text>
                    <rect x={x + 12} y={y + 34} width={card.tag.length * 6.5 + 14} height="14" rx="7" fill={card.tagColor} opacity="0.15" />
                    <text x={x + 19} y={y + 44} fill={card.tagColor} fontSize="9" fontWeight="600" fontFamily="DM Sans, system-ui">{card.tag}</text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function FloatingCube(props) {
  var size = props.size || 80;
  var color = props.color || "var(--primary)";
  var customStyle = props.style || {};
  return (
    <div style={{
      width: size, height: size,
      perspective: 600,
      position: "absolute",
      animation: "float 6s ease-in-out infinite",
      ...customStyle
    }}>
      <div style={{
        width: "100%", height: "100%",
        transformStyle: "preserve-3d",
        transform: "rotateX(-20deg) rotateY(35deg)",
        animation: "spin3d 20s linear infinite"
      }}>
        <div style={{ position: "absolute", width: size, height: size, background: "linear-gradient(135deg, " + color + ", " + color + "88)", border: "1px solid var(--border-med)", borderRadius: 4, transform: "translateZ(" + (size/2) + "px)" }} />
        <div style={{ position: "absolute", width: size, height: size, background: color, opacity: 0.2, border: "1px solid var(--border-light)", borderRadius: 4, transform: "rotateY(180deg) translateZ(" + (size/2) + "px)" }} />
        <div style={{ position: "absolute", width: size, height: size, background: color, opacity: 0.3, border: "1px solid var(--border-med)", borderRadius: 4, transform: "rotateY(90deg) translateZ(" + (size/2) + "px)" }} />
        <div style={{ position: "absolute", width: size, height: size, background: color, opacity: 0.2, border: "1px solid var(--border-light)", borderRadius: 4, transform: "rotateY(-90deg) translateZ(" + (size/2) + "px)" }} />
        <div style={{ position: "absolute", width: size, height: size, background: "linear-gradient(135deg, " + color + "99, " + color + "55)", border: "1px solid var(--border-heavy)", borderRadius: 4, transform: "rotateX(90deg) translateZ(" + (size/2) + "px)" }} />
        <div style={{ position: "absolute", width: size, height: size, background: color, opacity: 0.15, border: "1px solid var(--border-light)", borderRadius: 4, transform: "rotateX(-90deg) translateZ(" + (size/2) + "px)" }} />
      </div>
    </div>
  );
}

function FloatingSphere(props) {
  var size = props.size || 60;
  var color = props.color || "var(--accent)";
  var customStyle = props.style || {};
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      background: "radial-gradient(circle at 35% 30%, " + color + "cc, " + color + "44 50%, " + color + "11 80%, transparent)",
      boxShadow: "0 0 " + size + "px " + color + "33, inset 0 -" + (size/6) + "px " + (size/3) + "px " + color + "22",
      border: "1px solid var(--border-med)",
      position: "absolute",
      animation: "float 5s ease-in-out infinite",
      ...customStyle
    }} />
  );
}

function OrbitDots() {
  var dots = [0,1,2,3,4,5];
  return (
    <div style={{ position: "absolute", width: 280, height: 280, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
      {dots.map(function(i) {
        var c = i % 2 === 0 ? "var(--primary)" : "var(--accent)";
        var glow = i % 2 === 0 ? "rgba(var(--primary-rgb),0.5)" : "rgba(var(--accent-rgb),0.5)";
        return (
          <div key={i} style={{
            position: "absolute", width: 8, height: 8, borderRadius: "50%",
            background: c,
            animation: "orbit " + (8 + i * 2) + "s linear infinite",
            animationDelay: (i * -1.3) + "s",
            boxShadow: "0 0 12px " + glow,
            top: "50%", left: "50%",
          }} />
        );
      })}
    </div>
  );
}

function Nav() {
  var links = ["Features", "Workflow", "Pricing", "Testimonials"];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(var(--bg-rgb),0.85)", backdropFilter: "blur(20px) saturate(1.4)",
      borderBottom: "1px solid var(--border-light)",
      padding: "0 clamp(1rem, 4vw, 3rem)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <Logo size="sm" iconOnly={false} />
        </Link>
        
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <ThemeToggle />

          {links.map(function(l) {
            return (
              <a key={l} href={"#" + l.toLowerCase()} style={{
                fontSize: 14, fontWeight: 500, color: "var(--textMuted)", transition: "color 0.2s", textDecoration: "none"
              }}
              onMouseEnter={function(e) { e.target.style.color = "var(--text)"; }}
              onMouseLeave={function(e) { e.target.style.color = "var(--textMuted)"; }}
              >{l}</a>
            );
          })}
          <Link to="/register" style={{
            padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
            background: "var(--primary)", color: "#fff", border: "none",
            boxShadow: "0 4px 16px rgba(var(--primary-rgb),0.3)",
            transition: "transform 0.15s, box-shadow 0.15s", textDecoration: "none", display: "inline-block"
          }}
          onMouseEnter={function(e) { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 6px 24px rgba(var(--primary-rgb),0.45)"; }}
          onMouseLeave={function(e) { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 16px rgba(var(--primary-rgb),0.3)"; }}
          >Start Free Trial</Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{
      position: "relative", minHeight: "100vh", display: "flex", alignItems: "center",
      padding: "120px clamp(1rem, 4vw, 3rem) 80px",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 800px 600px at 20% 40%, rgba(var(--primary-rgb),0.08), transparent), radial-gradient(ellipse 600px 500px at 80% 30%, rgba(var(--accent-rgb),0.06), transparent), radial-gradient(ellipse 400px 400px at 50% 80%, rgba(var(--secondary-rgb),0.05), transparent)",
      }} />

      <FloatingCube size={70} color="var(--primary)" style={{ top: "15%", right: "12%", animationDelay: "0s" }} />
      <FloatingCube size={45} color="var(--accent)" style={{ top: "60%", right: "8%", animationDelay: "-2s" }} />
      <FloatingSphere size={50} color="var(--secondary)" style={{ top: "25%", right: "25%", animationDelay: "-1s" }} />
      <FloatingSphere size={30} color="var(--primary)" style={{ top: "70%", right: "20%", animationDelay: "-3s" }} />
      <OrbitDots />

      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", position: "relative", zIndex: 2 }}>
        <div style={{ animation: "fadeLeft 0.8s ease-out" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 999,
            background: "rgba(var(--primary-rgb),0.1)", border: "1px solid rgba(var(--primary-rgb),0.2)",
            color: "var(--primary)", fontSize: 13, fontWeight: 600, marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", animation: "pulse 2s infinite" }} />
            Now in public beta — v2.0
          </div>

          <h1 style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700,
            letterSpacing: "-0.035em", lineHeight: 1.08, marginBottom: 24,
          }}>
            Ship projects<br />
            <span style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              10× faster
            </span>
          </h1>

          <p style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)", color: "var(--textMuted)", lineHeight: 1.65, maxWidth: 480, marginBottom: 40 }}>
            FlowBoard combines visual kanban boards, real-time collaboration, and AI-powered planning into one seamless workspace your team will actually love.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
            <Link to="/register" style={{
              padding: "16px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600,
              background: "var(--primary)", color: "#fff", border: "none",
              boxShadow: "0 8px 32px rgba(var(--primary-rgb),0.35)",
              transition: "transform 0.15s, box-shadow 0.15s", textDecoration: "none", display: "inline-block"
            }}
            onMouseEnter={function(e) { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 40px rgba(var(--primary-rgb),0.5)"; }}
            onMouseLeave={function(e) { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 8px 32px rgba(var(--primary-rgb),0.35)"; }}
            >
              Get Started Free →
            </Link>
            <Link to="/login" style={{
              padding: "16px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600,
              background: "var(--surface)", color: "var(--text)",
              border: "1px solid var(--border-med)",
              transition: "background 0.15s, border-color 0.15s", textDecoration: "none", display: "inline-block"
            }}
            onMouseEnter={function(e) { e.target.style.background = "var(--surfaceHi)"; e.target.style.borderColor = "var(--border-heavy)"; }}
            onMouseLeave={function(e) { e.target.style.background = "var(--surface)"; e.target.style.borderColor = "var(--border-med)"; }}
            >
              Log In
            </Link>
          </div>

          <div style={{ display: "flex", gap: 32, color: "var(--textMuted)", fontSize: 13 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.333A6.667 6.667 0 1 0 14.667 8 6.674 6.674 0 0 0 8 1.333zm3.12 4.787L7.453 9.787a.667.667 0 0 1-.94 0L4.88 8.12a.667.667 0 0 1 .94-.94L7.02 8.38l3.12-3.12a.667.667 0 1 1 .94.94z" fill="var(--accent)"/></svg>
              Free 14-day trial
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.333A6.667 6.667 0 1 0 14.667 8 6.674 6.674 0 0 0 8 1.333zm3.12 4.787L7.453 9.787a.667.667 0 0 1-.94 0L4.88 8.12a.667.667 0 0 1 .94-.94L7.02 8.38l3.12-3.12a.667.667 0 1 1 .94.94z" fill="var(--accent)"/></svg>
              No credit card needed
            </span>
          </div>
        </div>

        <div style={{ 
          animation: "scaleIn 1s ease-out 0.2s both", 
          transform: "perspective(1200px) rotateY(-12deg) rotateX(8deg) rotateZ(-2deg)", 
          transformStyle: "preserve-3d" 
        }}>
          <KanbanBoard3D />
        </div>
      </div>
    </section>
  );
}

function LogoBar() {
  var logos = ["Vercel", "Linear", "Stripe", "Notion", "Figma", "Supabase", "Raycast"];
  return (
    <section style={{ padding: "40px clamp(1rem, 4vw, 3rem)", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--textMuted)", fontWeight: 500, marginBottom: 28, textTransform: "uppercase", letterSpacing: "0.1em" }}>Trusted by teams at</p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 48, flexWrap: "wrap" }}>
          {logos.map(function(l) {
            return (
              <span key={l} style={{
                fontSize: 18, fontWeight: 700, color: "var(--textMuted)",
                fontFamily: "Space Grotesk, system-ui", letterSpacing: "-0.02em",
                transition: "color 0.3s", opacity: 0.6
              }}
              onMouseEnter={function(e) { e.target.style.color = "var(--text)"; e.target.style.opacity = 1; }}
              onMouseLeave={function(e) { e.target.style.color = "var(--textMuted)"; e.target.style.opacity = 0.6; }}
              >{l}</span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeatureCard(props) {
  var accent = props.accent || "var(--primary)";
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border-light)",
      borderRadius: 16,
      padding: 32,
      transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
      cursor: "default",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={function(e) {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.borderColor = "rgba(var(--primary-rgb),0.3)";
      e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.1), inset 0 1px 0 var(--border-light)";
    }}
    onMouseLeave={function(e) {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.borderColor = "var(--border-light)";
      e.currentTarget.style.boxShadow = "none";
    }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "var(--border-light)" }} />
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: "rgba(var(--primary-rgb), 0.1)", border: "1px solid rgba(var(--primary-rgb), 0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20, fontSize: 22,
      }}>
        {props.icon}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>{props.title}</h3>
      <p style={{ fontSize: 14, color: "var(--textMuted)", lineHeight: 1.6 }}>{props.desc}</p>
    </div>
  );
}

function Features() {
  var features = [
    { icon: "\u{1F4CB}", title: "Visual Kanban Boards", desc: "Drag-and-drop cards across customizable columns. See your entire project at a glance with color-coded labels and priority filters.", accent: "var(--primary)" },
    { icon: "\u{1F916}", title: "AI Sprint Planning", desc: "Let AI analyze your backlog and suggest sprint plans based on team velocity, dependencies, and priority scores.", accent: "var(--accent)" },
    { icon: "\u{1F465}", title: "Real-time Collaboration", desc: "See cursors, edits, and comments live. No more 'who's working on what?' — everyone sees the same board.", accent: "var(--secondary)" },
    { icon: "\u{1F4CA}", title: "Advanced Analytics", desc: "Track velocity trends, cycle times, and burndown charts. Identify bottlenecks before they become blockers.", accent: "var(--primary)" },
    { icon: "\u{1F517}", title: "200+ Integrations", desc: "Connect GitHub, Slack, Figma, Linear, and more. Automate workflows with bi-directional sync and webhooks.", accent: "var(--accent)" },
    { icon: "\u{1F512}", title: "Enterprise Security", desc: "SOC 2 Type II certified. SSO, RBAC, audit logs, and data residency controls for compliance-ready teams.", accent: "var(--secondary)" },
  ];

  return (
    <section id="features" style={{ padding: "120px clamp(1rem, 4vw, 3rem)", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <span style={{
            display: "inline-block", padding: "6px 14px", borderRadius: 999,
            background: "rgba(var(--accent-rgb),0.1)", border: "1px solid rgba(var(--accent-rgb),0.2)",
            color: "var(--accent)", fontSize: 13, fontWeight: 600, marginBottom: 20,
          }}>Features</span>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, marginBottom: 16, letterSpacing: "-0.03em" }}>
            Everything you need to<br />
            <span style={{ color: "var(--accent)" }}>manage work</span>
          </h2>
          <p style={{ fontSize: 17, color: "var(--textMuted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
            Built for teams that ship fast. Every feature is designed to reduce friction and keep your projects moving forward.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {features.map(function(f, i) { return <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} accent={f.accent} />; })}
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  var steps = [
    { num: "01", title: "Plan", desc: "Import your backlog, set priorities, and let AI suggest sprint goals.", color: "var(--primary)" },
    { num: "02", title: "Build", desc: "Drag cards across columns, assign teammates, and track real-time progress.", color: "var(--accent)" },
    { num: "03", title: "Ship", desc: "Review analytics, close sprints, and deploy with confidence.", color: "var(--secondary)" },
  ];

  return (
    <section id="workflow" style={{
      padding: "120px clamp(1rem, 4vw, 3rem)",
      background: "var(--bgAlt)",
      borderTop: "1px solid var(--border-light)",
      borderBottom: "1px solid var(--border-light)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(var(--primary-rgb),0.06), transparent 70%)",
        top: "-200px", left: "50%", transform: "translateX(-50%)",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <span style={{
            display: "inline-block", padding: "6px 14px", borderRadius: 999,
            background: "rgba(var(--secondary-rgb),0.1)", border: "1px solid rgba(var(--secondary-rgb),0.2)",
            color: "var(--secondary)", fontSize: 13, fontWeight: 600, marginBottom: 20,
          }}>How it works</span>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, marginBottom: 16, letterSpacing: "-0.03em" }}>
            From idea to <span style={{ color: "var(--primary)" }}>deployment</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {steps.map(function(s, i) {
            return (
              <div key={i} style={{
                position: "relative",
                background: "linear-gradient(135deg, var(--surface), var(--surfaceHi))",
                border: "1px solid var(--border-light)",
                borderRadius: 20,
                padding: 40,
                textAlign: "center",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={function(e) {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(var(--primary-rgb),0.2)";
              }}
              onMouseLeave={function(e) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(var(--primary-rgb),0.2), transparent)" }} />
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: "rgba(var(--primary-rgb),0.1)", border: "1px solid rgba(var(--primary-rgb),0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 24px", fontFamily: "Space Grotesk, system-ui",
                  fontSize: 24, fontWeight: 700, color: s.color,
                }}>
                  {s.num}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: "var(--textMuted)", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section style={{ padding: "80px clamp(1rem, 4vw, 3rem)", position: "relative" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative" }}>
        <div style={{
          position: "absolute", inset: -60,
          background: "radial-gradient(ellipse at center, rgba(var(--primary-rgb),0.08), transparent 70%)",
          filter: "blur(40px)",
        }} />

        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border-med)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 40px 80px rgba(0,0,0,0.15), inset 0 1px 0 var(--border-light)",
          position: "relative",
          zIndex: 2,
          transform: "perspective(1200px) rotateX(3deg)",
          transition: "transform 0.4s",
        }}
        onMouseEnter={function(e) { e.currentTarget.style.transform = "perspective(1200px) rotateX(0deg)"; }}
        onMouseLeave={function(e) { e.currentTarget.style.transform = "perspective(1200px) rotateX(3deg)"; }}
        >
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
            <div style={{ flex: 1, maxWidth: 400, margin: "0 auto", padding: "6px 16px", borderRadius: 8, background: "var(--border-light)", fontSize: 12, color: "var(--textMuted)", textAlign: "center" }}>
              app.taskflow.io/dashboard
            </div>
          </div>

          <div style={{ padding: 24, display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, minHeight: 380 }}>
            <div style={{ background: "var(--bg)", borderRadius: 12, padding: 16, border: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "8px 0" }}>
                <Logo size="sm" iconOnly={true} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>TaskFlow</span>
              </div>
              {["Dashboard", "Boards", "Analytics", "Team", "Settings"].map(function(item, i) {
                return (
                  <div key={item} style={{
                    padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                    color: i === 0 ? "var(--text)" : "var(--textMuted)",
                    background: i === 0 ? "rgba(var(--primary-rgb),0.1)" : "transparent",
                    marginBottom: 4,
                  }}>
                    {item}
                  </div>
                );
              })}
            </div>

            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Active Sprints", value: "3", change: "+1", color: "var(--primary)" },
                  { label: "Tasks Done", value: "142", change: "+28", color: "var(--accent)" },
                  { label: "Team Velocity", value: "87", change: "+12%", color: "var(--secondary)" },
                  { label: "Blockers", value: "2", change: "-3", color: "var(--primary)" },
                ].map(function(kpi, i) {
                  return (
                    <div key={i} style={{
                      background: "var(--bg)", borderRadius: 10, padding: "14px 16px",
                      border: "1px solid var(--border-light)",
                    }}>
                      <div style={{ fontSize: 11, color: "var(--textMuted)", marginBottom: 6, fontWeight: 500 }}>{kpi.label}</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "Space Grotesk, system-ui" }}>{kpi.value}</span>
                        <span style={{ fontSize: 11, color: kpi.color, fontWeight: 600 }}>{kpi.change}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: "var(--bg)", borderRadius: 12, padding: 20, height: 180, position: "relative", overflow: "hidden", border: "1px solid var(--border-light)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Sprint Velocity — Last 8 Weeks</div>
                <svg viewBox="0 0 600 120" width="100%" height="100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  {[30, 60, 90].map(function(y) {
                    return <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="var(--border-light)" strokeWidth="1" />;
                  })}
                  <path d="M0,100 L75,85 L150,70 L225,75 L300,50 L375,45 L450,30 L525,20 L600,10 L600,120 L0,120Z" fill="url(#chartFill)" />
                  <path d="M0,100 L75,85 L150,70 L225,75 L300,50 L375,45 L450,30 L525,20 L600,10" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {[[0,100],[75,85],[150,70],[225,75],[300,50],[375,45],[450,30],[525,20],[600,10]].map(function(pt, i) {
                    return <circle key={i} cx={pt[0]} cy={pt[1]} r="3.5" fill="var(--primary)" stroke="var(--bg)" strokeWidth="2" />;
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  var plans = [
    {
      name: "Starter", price: "Free", period: "",
      desc: "For individuals and small experiments",
      features: ["Up to 3 boards", "5 team members", "Basic analytics", "Community support", "1 GB storage"],
      cta: "Get Started", featured: false, color: "var(--textMuted)", link: "/register"
    },
    {
      name: "Pro", price: "$12", period: "/user/mo",
      desc: "For growing teams that need more power",
      features: ["Unlimited boards", "25 team members", "AI sprint planning", "Priority support", "50 GB storage", "Custom fields", "API access"],
      cta: "Start Free Trial", featured: true, color: "var(--primary)", link: "/register"
    },
    {
      name: "Enterprise", price: "Custom", period: "",
      desc: "For organizations with advanced needs",
      features: ["Everything in Pro", "Unlimited members", "SSO & SAML", "Audit logs", "Custom SLA", "Dedicated CSM", "Data residency"],
      cta: "Contact Sales", featured: false, color: "var(--accent)", link: "/login"
    },
  ];

  return (
    <section id="pricing" style={{ padding: "120px clamp(1rem, 4vw, 3rem)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <span style={{
            display: "inline-block", padding: "6px 14px", borderRadius: 999,
            background: "rgba(var(--primary-rgb),0.1)", border: "1px solid rgba(var(--primary-rgb),0.2)",
            color: "var(--primary)", fontSize: 13, fontWeight: 600, marginBottom: 20,
          }}>Pricing</span>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, marginBottom: 16, letterSpacing: "-0.03em" }}>
            Simple, <span style={{ color: "var(--primary)" }}>transparent</span> pricing
          </h2>
          <p style={{ fontSize: 17, color: "var(--textMuted)", maxWidth: 480, margin: "0 auto" }}>
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, alignItems: "start" }}>
          {plans.map(function(plan, i) {
            return (
              <div key={i} style={{
                background: plan.featured ? "linear-gradient(135deg, var(--surface), var(--surfaceHi))" : "var(--surface)",
                border: "1px solid " + (plan.featured ? "rgba(var(--primary-rgb),0.3)" : "var(--border-light)"),
                borderRadius: 20,
                padding: 40,
                position: "relative",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={function(e) {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 24px 60px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={function(e) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              >
                {plan.featured && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    padding: "5px 16px", borderRadius: 999,
                    background: "var(--primary)", color: "#fff",
                    fontSize: 12, fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(var(--primary-rgb),0.4)",
                  }}>Most Popular</div>
                )}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: plan.featured ? "linear-gradient(90deg, transparent, rgba(var(--primary-rgb),0.27), transparent)" : "var(--border-light)" }} />

                <h3 style={{ fontSize: 18, fontWeight: 600, color: plan.color, marginBottom: 8 }}>{plan.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 44, fontWeight: 700, fontFamily: "Space Grotesk, system-ui", letterSpacing: "-0.03em" }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 15, color: "var(--textMuted)" }}>{plan.period}</span>}
                </div>
                <p style={{ fontSize: 14, color: "var(--textMuted)", marginBottom: 28, lineHeight: 1.5 }}>{plan.desc}</p>

                <Link to={plan.link} style={{
                  display: "block", textAlign: "center", textDecoration: "none",
                  width: "100%", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                  background: plan.featured ? "var(--primary)" : "var(--surfaceHi)",
                  color: plan.featured ? "#fff" : "var(--text)",
                  border: plan.featured ? "none" : "1px solid var(--border-med)",
                  boxShadow: plan.featured ? "0 8px 24px rgba(var(--primary-rgb),0.3)" : "none",
                  transition: "transform 0.15s",
                  marginBottom: 28,
                  boxSizing: "border-box"
                }}
                onMouseEnter={function(e) { e.target.style.transform = "translateY(-1px)"; }}
                onMouseLeave={function(e) { e.target.style.transform = "translateY(0)"; }}
                >{plan.cta}</Link>

                <ul style={{ listStyle: "none", padding: 0 }}>
                  {plan.features.map(function(f, j) {
                    return (
                      <li key={j} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", fontSize: 14, color: "var(--textMuted)" }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 1.333A6.667 6.667 0 1 0 14.667 8 6.674 6.674 0 0 0 8 1.333zm3.12 4.787L7.453 9.787a.667.667 0 0 1-.94 0L4.88 8.12a.667.667 0 0 1 .94-.94L7.02 8.38l3.12-3.12a.667.667 0 1 1 .94.94z" fill={plan.featured ? "var(--primary)" : "var(--accent)"} />
                        </svg>
                        {f}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  var quotes = [
    { text: "TaskFlow transformed how our engineering team operates. Sprint velocity increased 40% in the first month. The AI planning alone saved us hours per week.", name: "Sarah Chen", role: "VP of Engineering, Meridian Labs", avatar: "var(--primary)" },
    { text: "We tried every project tool out there. TaskFlow is the only one where the entire team voluntarily adopted it within a week. That never happens.", name: "Marcus Williams", role: "CTO, NovaBridge", avatar: "var(--accent)" },
    { text: "The 3D board view gives our design team a spatial understanding of our backlog that flat lists simply can't. It's genuinely innovative.", name: "Aisha Patel", role: "Design Lead, Artisan Digital", avatar: "var(--secondary)" },
  ];

  return (
    <section id="testimonials" style={{ padding: "120px clamp(1rem, 4vw, 3rem)", background: "var(--bgAlt)", borderTop: "1px solid var(--border-light)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <span style={{
            display: "inline-block", padding: "6px 14px", borderRadius: 999,
            background: "rgba(var(--secondary-rgb),0.1)", border: "1px solid rgba(var(--secondary-rgb),0.2)",
            color: "var(--secondary)", fontSize: 13, fontWeight: 600, marginBottom: 20,
          }}>Testimonials</span>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, letterSpacing: "-0.03em" }}>
            Loved by <span style={{ color: "var(--secondary)" }}>ambitious teams</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {quotes.map(function(q, i) {
            return (
              <div key={i} style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                borderRadius: 20,
                padding: 32,
              }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                  {[1,2,3,4,5].map(function(star) {
                    return (
                      <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill="#febc2e">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    );
                  })}
                </div>
                <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.6, marginBottom: 24, fontStyle: "italic" }}>
                  "{q.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(var(--secondary-rgb),0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: q.avatar, fontWeight: 700 }}>
                    {q.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{q.name}</div>
                    <div style={{ fontSize: 12, color: "var(--textMuted)" }}>{q.role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section style={{
      padding: "120px clamp(1rem, 4vw, 3rem)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 800px 400px at 50% 50%, rgba(var(--primary-rgb),0.1), transparent)",
      }} />

      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
        <h2 style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", fontWeight: 700, marginBottom: 20, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Ready to <span style={{
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>transform</span> your workflow?
        </h2>
        <p style={{ fontSize: 18, color: "var(--textMuted)", marginBottom: 40, lineHeight: 1.6 }}>
          Join 12,000+ teams shipping faster with TaskFlow. Start your free 14-day trial today.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/register" style={{
            padding: "18px 40px", borderRadius: 14, fontSize: 16, fontWeight: 700,
            background: "var(--primary)", color: "#fff", border: "none",
            boxShadow: "0 12px 40px rgba(var(--primary-rgb),0.4)",
            transition: "transform 0.2s, box-shadow 0.2s", textDecoration: "none"
          }}
          onMouseEnter={function(e) { e.target.style.transform = "translateY(-2px) scale(1.02)"; e.target.style.boxShadow = "0 16px 48px rgba(var(--primary-rgb),0.55)"; }}
          onMouseLeave={function(e) { e.target.style.transform = "translateY(0) scale(1)"; e.target.style.boxShadow = "0 12px 40px rgba(var(--primary-rgb),0.4)"; }}
          >Start Free Trial →</Link>
          <Link to="/login" style={{
            padding: "18px 40px", borderRadius: 14, fontSize: 16, fontWeight: 700,
            background: "var(--surface)", color: "var(--text)",
            border: "1px solid var(--border-heavy)",
            transition: "background 0.2s, border-color 0.2s", textDecoration: "none"
          }}
          onMouseEnter={function(e) { e.target.style.background = "var(--surfaceHi)"; }}
          onMouseLeave={function(e) { e.target.style.background = "var(--surface)"; }}
          >Talk to Sales</Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  var cols = [
    { heading: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap", "Integrations"] },
    { heading: "Company", links: ["About", "Blog", "Careers", "Press Kit", "Contact"] },
    { heading: "Resources", links: ["Documentation", "API Reference", "Community", "Status Page", "Security"] },
    { heading: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "SOC 2"] },
  ];

  return (
    <footer style={{
      padding: "80px clamp(1rem, 4vw, 3rem) 40px",
      borderTop: "1px solid var(--border-light)",
      background: "var(--bgAlt)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(4, 1fr)", gap: 48, marginBottom: 60 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Logo size="md" iconOnly={false} />
            </div>
            <p style={{ fontSize: 14, color: "var(--textMuted)", lineHeight: 1.6, maxWidth: 260, marginBottom: 20 }}>
              The modern project management platform for teams that ship fast.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {["X", "GH", "LI", "YT"].map(function(s) {
                return (
                  <button key={s} type="button" aria-label={s} style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "var(--surface)", border: "1px solid var(--border-light)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "var(--textMuted)",
                    transition: "background 0.2s, color 0.2s", cursor: "pointer",
                  }}
                  onMouseEnter={function(e) { e.target.style.background = "var(--surfaceHi)"; e.target.style.color = "var(--text)"; }}
                  onMouseLeave={function(e) { e.target.style.background = "var(--surface)"; e.target.style.color = "var(--textMuted)"; }}
                  >{s}</button>
                );
              })}
            </div>
          </div>

          {cols.map(function(col) {
            return (
              <div key={col.heading}>
                <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text)", marginBottom: 20 }}>{col.heading}</h4>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {col.links.map(function(link) {
                    return (
                      <li key={link} style={{ marginBottom: 12 }}>
                        <button type="button" style={{
                          fontSize: 14, color: "var(--textMuted)", transition: "color 0.2s",
                          background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
                        }}
                        onMouseEnter={function(e) { e.target.style.color = "var(--primary)"; }}
                        onMouseLeave={function(e) { e.target.style.color = "var(--textMuted)"; }}
                        >{link}</button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <div style={{
          borderTop: "1px solid var(--border-light)",
          paddingTop: 28,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 16,
        }}>
          <p style={{ fontSize: 13, color: "var(--textMuted)" }}>{"\\u00A9"} 2026 TaskFlow, Inc. All rights reserved.</p>
          <p style={{ fontSize: 13, color: "var(--textMuted)" }}>
            Built with <span style={{ color: "var(--primary)" }}>{"\\u2665"}</span> for teams that move fast
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function HomeMasterpiece() {
  return (
    <>
      <style>{globalCSS}</style>
      <Nav />
      <main>
        <Hero />
        <LogoBar />
        <Features />
        <Workflow />
        <DashboardPreview />
        <Pricing />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
`;

fs.writeFileSync('/Volumes/E/Projects/task-management-system/frontend/src/pages/HomeMasterpiece.jsx', code);
