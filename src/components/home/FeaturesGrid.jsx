import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  UserCheck,
  BotMessageSquare,
  ClipboardList,
  BookOpenText,
  BarChart3,
  ArrowRight,
} from "lucide-react";

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

export function FeaturesGrid() {
  return (
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
  );
}
