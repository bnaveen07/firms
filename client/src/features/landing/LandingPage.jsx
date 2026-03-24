import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ──────────────────────────────────────────────────────────────────────────────
   LandingPage.jsx
   Public-facing landing page for BLAZE.
   Accessible at the "/" route without any authentication.
   Showcases the system features, tech stack, workflow and user roles.
────────────────────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Real-Time Incident Map',
    desc: 'Live fire incident tracking with severity levels visualised on an interactive Leaflet map. Updates in real time via Socket.IO.',
    color: '#c0392b',
  },
  {
    icon: '📋',
    title: 'Digital NOC Pipeline',
    desc: 'End-to-end digital workflow: Application → Review → Inspection → Approval → PDF Certificate with QR verification.',
    color: '#2980b9',
  },
  {
    icon: '🔍',
    title: 'Inspector Mobile Module',
    desc: 'PWA-ready inspector interface with GPS check-in, photo upload, offline support, and structured inspection checklists.',
    color: '#27ae60',
  },
  {
    icon: '📊',
    title: 'Analytics Engine',
    desc: 'Throughput metrics, inspection pass rates, application trends, and interactive heatmaps for risk scoring.',
    color: '#8e44ad',
  },
  {
    icon: '🏅',
    title: 'QR-Verified Certificates',
    desc: 'Tamper-evident PDF certificates with a public /verify-noc/:token endpoint for instant third-party verification.',
    color: '#f39c12',
  },
  {
    icon: '🔐',
    title: 'Role-Based Access Control',
    desc: 'Three distinct roles — Admin, Applicant, and Inspector — each with precisely scoped capabilities and dashboards.',
    color: '#16a085',
  },
];

const STEPS = [
  {
    num: '01',
    icon: '📝',
    title: 'Submit Application',
    desc: 'Property owner fills the digital NOC application form with all required details about the premises.',
  },
  {
    num: '02',
    icon: '🔍',
    title: 'Review & Inspection',
    desc: 'Admin reviews the submission and assigns an inspector who performs a GPS-verified on-site visit.',
  },
  {
    num: '03',
    icon: '🏅',
    title: 'Certificate Issued',
    desc: 'Approved properties receive a QR-embedded PDF certificate verifiable online by anyone, any time.',
  },
];

const ROLES = [
  {
    icon: '👨‍💼',
    role: 'Admin',
    color: '#c0392b',
    capabilities: [
      'Review & approve NOC applications',
      'Assign inspectors to cases',
      'Issue QR-verified certificates',
      'View analytics & heatmaps',
      'Manage users and teams',
    ],
  },
  {
    icon: '🏢',
    role: 'Applicant',
    color: '#2980b9',
    capabilities: [
      'Submit digital NOC applications',
      'Track application status in real time',
      'View inspector visit schedules',
      'Download PDF certificates',
      'Monitor active fire incidents',
    ],
  },
  {
    icon: '🔍',
    role: 'Inspector',
    color: '#27ae60',
    capabilities: [
      'View assigned inspection tasks',
      'GPS check-in at the premises',
      'Submit photo evidence & checklists',
      'Offline-capable mobile interface',
      'Report new fire incidents',
    ],
  },
];

/* ── Animated counter using IntersectionObserver ── */
const useCounter = (target, duration = 1800) => {
  const [count, setCount] = React.useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = Math.max(1, Math.ceil(target / (duration / 16)));
        const timer = setInterval(() => {
          start += step;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(start);
          }
        }, 16);
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
};

const StatItem = ({ value, label, suffix = '' }) => {
  const [count, ref] = useCounter(value);
  return (
    <div ref={ref} style={statStyles.item}>
      <span style={statStyles.value}>{count}{suffix}</span>
      <span style={statStyles.label}>{label}</span>
    </div>
  );
};

const statStyles = {
  item: { textAlign: 'center' },
  value: {
    display: 'block',
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: '900',
    color: '#c0392b',
    lineHeight: 1,
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.55)',
    marginTop: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
};

/* ── Main component ── */
const LandingPage = () => {
  return (
    <div style={styles.root}>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <span style={styles.navLogoIcon}>🔥</span>
          <div>
            <span style={styles.navLogoText}>BLAZE</span>
            <span style={styles.navLogoTagline}> Fire Safety Platform</span>
          </div>
        </div>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#how-it-works" style={styles.navLink}>How it works</a>
          <a href="#roles" style={styles.navLink}>Roles</a>
          <Link to="/login" style={styles.navCta}>Sign In</Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section style={styles.hero}>
        {/* decorative glows */}
        <div style={styles.glow1} aria-hidden="true" />
        <div style={styles.glow2} aria-hidden="true" />

        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>🚒 Built for Fire Departments &amp; Property Owners</div>
          <h1 style={styles.heroTitle}>
            Next-gen{' '}
            <span style={styles.heroAccent}>Fire Safety</span>
            {' '}Management
          </h1>
          <p style={styles.heroSub}>
            BLAZE is a production-ready full-stack platform to manage NOC
            applications, track live fire incidents on an interactive map, and
            issue tamper-evident QR-verified safety certificates — all in one
            unified workspace.
          </p>
          <div style={styles.heroCtas}>
            <Link to="/register" style={styles.ctaPrimary}>
              Get Started Free →
            </Link>
            <Link to="/login" style={styles.ctaGhost}>
              Sign In
            </Link>
          </div>
          <div style={styles.heroMeta}>
            <span style={styles.heroMetaItem}>✓ No setup fee</span>
            <span style={styles.heroMetaItem}>✓ PWA-ready</span>
            <span style={styles.heroMetaItem}>✓ Real-time updates</span>
          </div>
        </div>

        {/* Mock dashboard card */}
        <div style={styles.heroVisual} aria-hidden="true">
          <div style={styles.mockCard}>
            <div style={styles.mockHeader}>
              <span style={{ color: '#c0392b', fontWeight: '800', fontSize: '0.95rem' }}>
                🔥 BLAZE Dashboard
              </span>
              <span style={styles.liveDot}>
                <span style={styles.livePulse} />
                LIVE
              </span>
            </div>
            {[
              { label: 'Active Incidents', value: '12', color: '#c0392b', icon: '🚨' },
              { label: 'Pending NOCs', value: '47', color: '#f39c12', icon: '⏳' },
              { label: 'Certs Issued', value: '234', color: '#27ae60', icon: '✅' },
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={mockStyles.row}>
                <span style={mockStyles.label}>{icon} {label}</span>
                <span style={{ ...mockStyles.value, color }}>{value}</span>
              </div>
            ))}
            <div style={mockStyles.mapBox}>
              <span style={{ fontSize: '1.8rem' }}>🗺️</span>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: '600' }}>
                  Live Incident Map
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginTop: '2px' }}>
                  Real-time updates via Socket.IO
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────── */}
      <section style={styles.statsStrip}>
        <StatItem value={500} label="Applications Processed" suffix="+" />
        <div style={styles.statDivider} aria-hidden="true" />
        <StatItem value={99} label="Uptime SLA" suffix="%" />
        <div style={styles.statDivider} aria-hidden="true" />
        <StatItem value={3} label="User Roles" />
        <div style={styles.statDivider} aria-hidden="true" />
        <StatItem value={12} label="API Endpoints" suffix="+" />
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section id="features" style={styles.lightSection}>
        <div style={styles.sectionHead}>
          <span style={styles.sectionTag}>CAPABILITIES</span>
          <h2 style={styles.sectionTitle}>Everything you need, nothing you don't</h2>
          <p style={styles.sectionSub}>
            A comprehensive suite of tools purpose-built for fire safety administration.
          </p>
        </div>
        <div style={styles.featuresGrid}>
          {FEATURES.map(({ icon, title, desc, color }) => (
            <div key={title} style={styles.featureCard}>
              <div style={{ ...styles.featureIconWrap, background: color + '18', color }}>
                {icon}
              </div>
              <h3 style={styles.featureTitle}>{title}</h3>
              <p style={styles.featureDesc}>{desc}</p>
              <div style={{ ...styles.featureAccentBar, background: color }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section id="how-it-works" style={styles.darkSection}>
        <div style={styles.sectionHead}>
          <span style={{ ...styles.sectionTag, color: 'rgba(255,255,255,0.5)' }}>WORKFLOW</span>
          <h2 style={{ ...styles.sectionTitle, color: '#fff' }}>From application to certificate</h2>
          <p style={{ ...styles.sectionSub, color: 'rgba(255,255,255,0.55)' }}>
            Three clear steps, zero paperwork.
          </p>
        </div>
        <div style={styles.stepsGrid}>
          {STEPS.map(({ num, icon, title, desc }, i) => (
            <React.Fragment key={num}>
              <div style={styles.stepCard}>
                <div style={styles.stepIconWrap}>{icon}</div>
                <div style={styles.stepNum}>{num}</div>
                <h3 style={styles.stepTitle}>{title}</h3>
                <p style={styles.stepDesc}>{desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div style={styles.stepArrow} aria-hidden="true">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── Roles ─────────────────────────────────────────────────── */}
      <section id="roles" style={styles.lightSection}>
        <div style={styles.sectionHead}>
          <span style={styles.sectionTag}>USER ROLES</span>
          <h2 style={styles.sectionTitle}>Built for every stakeholder</h2>
          <p style={styles.sectionSub}>
            Role-based access ensures each user sees exactly what matters to them.
          </p>
        </div>
        <div style={styles.rolesGrid}>
          {ROLES.map(({ icon, role, color, capabilities }) => (
            <div key={role} style={{ ...styles.roleCard, borderTop: `4px solid ${color}` }}>
              <div style={{ ...styles.roleIconWrap, background: color + '18', color }}>
                {icon}
              </div>
              <h3 style={{ ...styles.roleTitle, color }}>{role}</h3>
              <ul style={styles.roleList}>
                {capabilities.map((cap) => (
                  <li key={cap} style={styles.roleItem}>
                    <span style={{ color, marginRight: '8px', flexShrink: 0 }}>✓</span>
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section style={styles.ctaBanner}>
        <div style={styles.ctaGlowLeft} aria-hidden="true" />
        <div style={styles.ctaGlowRight} aria-hidden="true" />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h2 style={styles.ctaTitle}>Ready to modernise your fire department?</h2>
          <p style={styles.ctaSub}>
            Set up in minutes. No vendor lock-in. 100% open source.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={styles.ctaPrimary}>Create Free Account →</Link>
            <Link to="/login" style={styles.ctaGhost}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={styles.footer}>
        <div style={styles.footerBrand}>
          <span style={{ color: '#c0392b', fontSize: '1.3rem' }}>🔥</span>
          <span style={{ fontWeight: '800', color: '#fff', marginLeft: '8px' }}>BLAZE</span>
          <span style={styles.footerDot}>·</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            Building &amp; Location Alert Zone Engine
          </span>
        </div>
        <p style={styles.footerCopy}>
          © {new Date().getFullYear()} BLAZE — NOC &amp; Fire Safety Management Platform. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

/* ── Local styles ──────────────────────────────────────────────────────────── */

const mockStyles = {
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '11px 0',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  label: { color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' },
  value: { fontSize: '1.4rem', fontWeight: '800' },
  mapBox: {
    marginTop: '16px',
    height: '72px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '0 16px',
  },
};

const styles = {
  root: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    overflowX: 'hidden',
  },

  /* Navbar */
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 clamp(16px, 6vw, 88px)',
    height: '64px',
    background: 'rgba(15,15,30,0.92)',
    backdropFilter: 'blur(14px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: '10px' },
  navLogoIcon: { fontSize: '1.5rem' },
  navLogoText: {
    fontSize: '1.15rem',
    fontWeight: '900',
    color: '#fff',
    letterSpacing: '1.5px',
  },
  navLogoTagline: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '400',
    letterSpacing: '0.3px',
  },
  navLinks: { display: 'flex', alignItems: 'center', gap: '28px' },
  navLink: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '0.88rem',
    fontWeight: '500',
    textDecoration: 'none',
  },
  navCta: {
    background: '#c0392b',
    color: '#fff',
    padding: '8px 20px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.875rem',
    textDecoration: 'none',
    boxShadow: '0 2px 12px rgba(192,57,43,0.35)',
  },

  /* Hero */
  hero: {
    position: 'relative',
    minHeight: '92vh',
    display: 'flex',
    alignItems: 'center',
    gap: '56px',
    padding: 'clamp(60px, 10vh, 100px) clamp(16px, 8vw, 88px)',
    background: 'linear-gradient(135deg, #0d0d1a 0%, #16213e 55%, #0f3460 100%)',
    overflow: 'hidden',
    flexWrap: 'wrap',
  },
  glow1: {
    position: 'absolute',
    width: '700px',
    height: '700px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(192,57,43,0.12) 0%, transparent 70%)',
    top: '-200px',
    right: '-100px',
    pointerEvents: 'none',
  },
  glow2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(41,128,185,0.1) 0%, transparent 70%)',
    bottom: '-150px',
    left: '10%',
    pointerEvents: 'none',
  },
  heroContent: { flex: '1 1 460px', position: 'relative', zIndex: 1 },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(192,57,43,0.15)',
    border: '1px solid rgba(192,57,43,0.3)',
    color: '#e74c3c',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontWeight: '600',
    letterSpacing: '0.3px',
    marginBottom: '22px',
  },
  heroTitle: {
    fontSize: 'clamp(2.1rem, 5vw, 3.6rem)',
    fontWeight: '900',
    color: '#fff',
    lineHeight: 1.18,
    marginBottom: '22px',
    letterSpacing: '-0.5px',
  },
  heroAccent: {
    color: '#c0392b',
    background: 'linear-gradient(90deg, #c0392b, #e74c3c)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 'clamp(0.95rem, 1.5vw, 1.08rem)',
    lineHeight: 1.8,
    maxWidth: '560px',
    marginBottom: '36px',
  },
  heroCtas: { display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '24px' },
  ctaPrimary: {
    background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
    color: '#fff',
    padding: '14px 30px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.95rem',
    textDecoration: 'none',
    boxShadow: '0 4px 24px rgba(192,57,43,0.45)',
    letterSpacing: '0.2px',
  },
  ctaGhost: {
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    padding: '14px 30px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.95rem',
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.18)',
  },
  heroMeta: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  heroMetaItem: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  heroVisual: { flex: '0 1 380px', position: 'relative', zIndex: 1 },
  mockCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 48px rgba(0,0,0,0.4)',
  },
  mockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
    paddingBottom: '14px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  liveDot: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(39,174,96,0.15)',
    color: '#27ae60',
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  livePulse: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#27ae60',
    display: 'inline-block',
    boxShadow: '0 0 0 3px rgba(39,174,96,0.25)',
  },

  /* Stats strip */
  statsStrip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0',
    padding: '52px clamp(16px, 8vw, 88px)',
    background: '#16213e',
    flexWrap: 'wrap',
  },
  statDivider: {
    width: '1px',
    height: '48px',
    background: 'rgba(255,255,255,0.1)',
    margin: '0 clamp(24px, 4vw, 56px)',
  },

  /* Sections */
  lightSection: {
    padding: 'clamp(64px, 8vw, 104px) clamp(16px, 8vw, 88px)',
    background: '#f8f9fb',
  },
  darkSection: {
    padding: 'clamp(64px, 8vw, 104px) clamp(16px, 8vw, 88px)',
    background: '#0d0d1a',
  },
  sectionHead: { textAlign: 'center', marginBottom: '60px' },
  sectionTag: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '1.5px',
    color: '#c0392b',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
    fontWeight: '800',
    color: '#0d0d1a',
    marginBottom: '14px',
    letterSpacing: '-0.3px',
  },
  sectionSub: {
    color: '#6c757d',
    fontSize: '1rem',
    maxWidth: '580px',
    margin: '0 auto',
    lineHeight: 1.75,
  },

  /* Features */
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  featureCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '28px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    border: '1px solid #f0f0f0',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  featureIconWrap: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    marginBottom: '18px',
  },
  featureTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '10px',
  },
  featureDesc: {
    color: '#6c757d',
    fontSize: '0.875rem',
    lineHeight: 1.75,
    marginBottom: '16px',
  },
  featureAccentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
    borderRadius: '0 0 14px 14px',
    opacity: 0.6,
  },

  /* Steps */
  stepsGrid: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  stepCard: {
    flex: '1 1 240px',
    maxWidth: '300px',
    textAlign: 'center',
    padding: '32px 24px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
  },
  stepIconWrap: {
    fontSize: '2rem',
    marginBottom: '12px',
  },
  stepNum: {
    fontSize: '0.7rem',
    fontWeight: '800',
    color: '#c0392b',
    letterSpacing: '1px',
    marginBottom: '12px',
    textTransform: 'uppercase',
  },
  stepTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '10px',
  },
  stepDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.875rem',
    lineHeight: 1.7,
  },
  stepArrow: {
    fontSize: '1.5rem',
    color: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    flexShrink: 0,
  },

  /* Roles */
  rolesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  roleCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '28px',
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    border: '1px solid #f0f0f0',
  },
  roleIconWrap: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    marginBottom: '16px',
  },
  roleTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    marginBottom: '18px',
  },
  roleList: { listStyle: 'none', padding: 0, margin: 0 },
  roleItem: {
    color: '#4a4a4a',
    fontSize: '0.875rem',
    padding: '7px 0',
    borderBottom: '1px solid #f5f5f5',
    display: 'flex',
    alignItems: 'flex-start',
    lineHeight: 1.5,
  },

  /* CTA Banner */
  ctaBanner: {
    position: 'relative',
    padding: 'clamp(64px, 8vw, 104px) clamp(16px, 8vw, 88px)',
    background: 'linear-gradient(135deg, #b02318 0%, #96281b 100%)',
    overflow: 'hidden',
    textAlign: 'center',
  },
  ctaGlowLeft: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)',
    top: '-200px',
    left: '-100px',
    pointerEvents: 'none',
  },
  ctaGlowRight: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, transparent 70%)',
    bottom: '-100px',
    right: '0',
    pointerEvents: 'none',
  },
  ctaTitle: {
    fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '14px',
    letterSpacing: '-0.3px',
  },
  ctaSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '1.05rem',
    marginBottom: '36px',
  },

  /* Footer */
  footer: {
    background: '#07070f',
    padding: '28px clamp(16px, 8vw, 88px)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  footerBrand: { display: 'flex', alignItems: 'center' },
  footerDot: {
    color: 'rgba(255,255,255,0.2)',
    margin: '0 12px',
  },
  footerCopy: { color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' },
};

export default LandingPage;
