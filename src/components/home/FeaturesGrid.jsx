import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  UserCheck,
  BotMessageSquare,
  ClipboardList,
  BookOpenText,
  BarChart3,
} from "lucide-react";
import { FeatureCard } from "./FeatureCard";

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
          <FeatureCard key={f.title} feature={f} />
        ))}
      </motion.div>
    </section>
  );
}
