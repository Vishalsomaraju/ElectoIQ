// src/pages/Home.jsx
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useMotionValueEvent,
} from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  CalendarDays,
  UserCheck,
  BotMessageSquare,
  ClipboardList,
  BookOpenText,
  BarChart3,
} from "lucide-react";
import { AnimatedPage } from "../components/shared/AnimatedPage";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const stats = [
  { value: 543, suffix: "", label: "Constituencies", color: "#FF9933" },
  { value: 96, suffix: " Cr+", label: "Registered Voters", color: "#138808" },
  { value: 7, suffix: "", label: "Election Phases", color: "#1a56db" },
  { value: 18, suffix: "+", label: "Age to Vote", color: "#0ea5e9" },
];

const features = [
  {
    Icon: CalendarDays,
    title: "Election Timeline",
    desc: "Learn the complete election cycle from announcement to results — every stage explained.",
    to: "/timeline",
    accent: "#FF9933",
    bg: "rgba(255,153,51,0.08)",
    ring: "rgba(255,153,51,0.25)",
  },
  {
    Icon: UserCheck,
    title: "Voter Journey",
    desc: "Step-by-step guide from registration to casting your vote on polling day.",
    to: "/voter-journey",
    accent: "#138808",
    bg: "rgba(19,136,8,0.08)",
    ring: "rgba(19,136,8,0.25)",
  },
  {
    Icon: BotMessageSquare,
    title: "AI Assistant",
    desc: "Ask any question about elections in plain language — powered by Gemini AI.",
    to: "/quiz",
    accent: "#1a56db",
    bg: "rgba(26,86,219,0.08)",
    ring: "rgba(26,86,219,0.25)",
  },
  {
    Icon: ClipboardList,
    title: "Civic Quiz",
    desc: "Test your election knowledge with AI-generated adaptive questions.",
    to: "/quiz",
    accent: "#0ea5e9",
    bg: "rgba(14,165,233,0.08)",
    ring: "rgba(14,165,233,0.25)",
  },
  {
    Icon: BookOpenText,
    title: "Glossary",
    desc: "50+ election terms explained simply — EVM, MCC, EPIC and more.",
    to: "/glossary",
    accent: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
    ring: "rgba(124,58,237,0.25)",
  },
  {
    Icon: BarChart3,
    title: "Progress Tracker",
    desc: "Track your learning journey, quiz scores, and civic readiness score.",
    to: "/dashboard",
    accent: "#ec4899",
    bg: "rgba(236,72,153,0.08)",
    ring: "rgba(236,72,153,0.25)",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedCounter({ to, suffix, color }) {
  const ref = useRef(null);
  const prevValueRef = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 55, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    if (prevValueRef.current === to) return;
    prevValueRef.current = to;
    motionVal.set(to);
  }, [inView, to, motionVal]);

  useMotionValueEvent(spring, "change", (v) => {
    setDisplay(Math.round(v).toString());
  });

  return (
    <span
      ref={ref}
      className="font-display font-extrabold text-4xl md:text-5xl tabular-nums mb-1 block"
      style={{ color }}
      aria-hidden="true"
    >
      {display}
      {suffix}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING PARTICLES
// ─────────────────────────────────────────────────────────────────────────────

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  duration: 6 + Math.random() * 8,
  delay: Math.random() * 5,
  color: ["#FF9933", "#138808", "#1a56db", "#0ea5e9"][i % 4],
}));

function FloatingParticles() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full opacity-20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
          }}
          animate={{ y: [0, -24, 0], opacity: [0.12, 0.28, 0.12] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ASHOKA CHAKRA SVG
// ─────────────────────────────────────────────────────────────────────────────

function AshokaChakra({ size = 220 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 220 220"
      className="chakra-spin opacity-[0.06] dark:opacity-[0.07]"
      aria-hidden="true"
      focusable="false"
    >
      {/* Outer ring */}
      <circle
        cx="110"
        cy="110"
        r="104"
        fill="none"
        stroke="#000080"
        strokeWidth="6"
      />
      <circle
        cx="110"
        cy="110"
        r="60"
        fill="none"
        stroke="#000080"
        strokeWidth="3"
      />
      {/* Hub */}
      <circle cx="110" cy="110" r="14" fill="#000080" />
      {/* 24 spokes */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        const rad = (angle * Math.PI) / 180;
        const x1 = 110 + 60 * Math.sin(rad);
        const y1 = 110 - 60 * Math.cos(rad);
        const x2 = 110 + 104 * Math.sin(rad);
        const y2 = 110 - 104 * Math.cos(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#000080"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      {/* 24 teardrop spokes (every other one slightly wider) */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24 + 7.5;
        const rad = (angle * Math.PI) / 180;
        const x1 = 110 + 14 * Math.sin(rad);
        const y1 = 110 - 14 * Math.cos(rad);
        const x2 = 110 + 60 * Math.sin(rad);
        const y2 = 110 - 60 * Math.cos(rad);
        return (
          <line
            key={`t${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#000080"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO HEADING (word-by-word animation)
// ─────────────────────────────────────────────────────────────────────────────

const wordVariants = {
  hidden: { opacity: 0, y: 44 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

function HeroHeading() {
  const line1 = ["Understand", "India's"];
  const line2 = ["Election", "Process"];

  return (
    <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl xl:text-8xl leading-[1.08] tracking-tight text-center mb-8">
      {/* Line 1 — white words */}
      <span className="block overflow-hidden">
        {line1.map((word, i) => (
          <motion.span
            key={word}
            custom={i}
            variants={wordVariants}
            initial="hidden"
            animate="show"
            className="inline-block mr-3 text-slate-900 dark:text-white last:mr-0"
          >
            {word}
          </motion.span>
        ))}
      </span>
      {/* Line 2 — saffron-to-green gradient */}
      <span className="block overflow-hidden">
        {line2.map((word, i) => (
          <motion.span
            key={word}
            custom={i + 2}
            variants={wordVariants}
            initial="hidden"
            animate="show"
            className="inline-block mr-3 text-gradient-india last:mr-0"
          >
            {word}
          </motion.span>
        ))}
      </span>
    </h1>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <AnimatedPage>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#0b1120] pt-24 pb-20 px-4 transition-colors duration-500"
        aria-labelledby="hero-heading"
      >
        {/* Animated background particles */}
        <FloatingParticles />

        {/* Radial glow blobs */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-india-saffron/8 blur-[80px]" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-india-green/8 blur-[80px]" />
        </div>

        {/* Ashoka Chakra — top right, decorative */}
        <div
          className="absolute top-20 right-0 md:right-8 translate-x-1/3 md:translate-x-0 pointer-events-none"
          aria-hidden="true"
        >
          <AshokaChakra size={260} />
        </div>
        {/* Second chakra — bottom left mirror */}
        <div
          className="absolute bottom-8 left-0 -translate-x-1/3 md:translate-x-0 pointer-events-none"
          aria-hidden="true"
        >
          <AshokaChakra size={180} />
        </div>

        {/* ── Badge ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-white/70 mb-8 shadow-sm"
        >
          <span
            className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
            aria-hidden="true"
          />
          India's AI-Powered Civic Education Platform
        </motion.div>

        {/* ── Heading ── */}
        <div id="hero-heading">
          <HeroHeading />
        </div>

        {/* ── Subheading ── */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.55, delay: 0.5 }}
          className="text-slate-600 dark:text-white/55 text-lg md:text-xl max-w-2xl text-center mx-auto mb-10 leading-relaxed"
        >
          Interactive, AI-powered civic education for every Indian voter — from
          registration to results, demystified.
        </motion.p>

        {/* ── CTAs ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, delay: 0.65 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {/* Primary — saffron filled */}
          <Link
            to="/timeline"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base bg-india-saffron hover:bg-[#e8891f] text-white shadow-xl shadow-orange-900/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-orange-900/50"
          >
            Explore Timeline
            <ArrowRight
              size={17}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>

          {/* Secondary — outlined */}
          <Link
            to="/quiz"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 hover:border-slate-400 dark:hover:border-white/35 transition-all duration-200 hover:-translate-y-0.5"
          >
            <Sparkles size={16} className="text-accent" aria-hidden="true" />
            Ask ElectoBot
          </Link>
        </motion.div>

        {/* ── Tricolor stripe ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-16 flex justify-center"
          aria-hidden="true"
        >
          <div className="flex h-[3px] w-36 rounded-full overflow-hidden">
            <div className="flex-1 bg-india-saffron" />
            <div className="flex-1 bg-slate-300 dark:bg-white/70" />
            <div className="flex-1 bg-india-green" />
          </div>
        </motion.div>
      </section>

      {/* ── STATS ROW ─────────────────────────────────────────────── */}
      <section
        className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-10 mb-20"
        aria-label="Key election statistics"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={cardVariant}
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-label={`${s.label}: ${s.value}${s.suffix}`}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-lg"
            >
              <AnimatedCounter to={s.value} suffix={s.suffix} color={s.color} />
              <p
                className="text-slate-500 dark:text-white/50 text-sm font-medium"
                aria-hidden="true"
              >
                {s.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────── */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 mb-28"
        aria-labelledby="features-heading"
      >
        {/* Section header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-india-saffron mb-3">
            Everything You Need
          </p>
          <h2
            id="features-heading"
            className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 dark:text-white"
          >
            Your Complete Election Companion
          </h2>
          <p className="mt-3 text-slate-600 dark:text-white/45 max-w-xl mx-auto text-base">
            Six powerful tools to help every Indian voter understand, prepare,
            and participate confidently.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={cardVariant}>
              <Link
                to={f.to}
                className="group relative block h-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/8 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-300 dark:hover:border-white/20 shadow-sm hover:shadow-xl hover:shadow-slate-200 dark:hover:shadow-black/40 overflow-hidden"
              >
                {/* Subtle accent glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at top left, ${f.bg} 0%, transparent 70%)`,
                  }}
                  aria-hidden="true"
                />

                {/* Icon container */}
                <div
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{
                    background: f.bg,
                    boxShadow: `0 0 0 1px ${f.ring}`,
                  }}
                  aria-hidden="true"
                >
                  <f.Icon
                    size={26}
                    strokeWidth={1.8}
                    style={{ color: f.accent }}
                  />
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {f.title}
                </h3>

                {/* Desc */}
                <p className="text-slate-600 dark:text-white/45 text-sm leading-relaxed mb-5">
                  {f.desc}
                </p>

                {/* CTA link */}
                <div
                  className="flex items-center gap-1.5 text-sm font-semibold transition-all duration-200"
                  style={{ color: f.accent }}
                >
                  Explore
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                    aria-hidden="true"
                  />
                </div>

                {/* Bottom accent bar on hover */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ background: f.accent }}
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-india-saffron/20 bg-white dark:bg-linear-to-br dark:from-[#0f172a] dark:via-[#111827] dark:to-[#0f172a] shadow-lg dark:shadow-none p-10 md:p-16 text-center"
          aria-labelledby="cta-heading"
        >
          {/* Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-india-saffron/8 blur-[80px]" />
          </div>

          {/* Chakra watermark */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 pointer-events-none"
            aria-hidden="true"
          >
            <AshokaChakra size={260} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-india-saffron mb-4">
            Your Civic Duty Starts Here
          </p>
          <h2
            id="cta-heading"
            className="font-display font-extrabold text-3xl md:text-5xl text-slate-900 dark:text-white mb-4 relative z-10"
          >
            Ready to Become an{" "}
            <span className="text-gradient-india">Informed Voter</span>?
          </h2>
          <p className="text-slate-600 dark:text-white/50 max-w-lg mx-auto mb-10 leading-relaxed relative z-10">
            Start your journey through India's election process and discover how
            your single vote shapes the future of 1.4 billion people.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <Link
              to="/timeline"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold bg-india-saffron hover:bg-[#e8891f] text-white shadow-xl shadow-orange-900/30 transition-all duration-200 hover:-translate-y-0.5"
            >
              Start Learning <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              to="/voter-journey"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 hover:border-slate-400 dark:hover:border-white/35 transition-all duration-200 hover:-translate-y-0.5"
            >
              My Voter Journey
            </Link>
          </div>
        </motion.div>
      </section>
    </AnimatedPage>
  );
}
