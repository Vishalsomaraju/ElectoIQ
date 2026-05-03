import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { FloatingParticles } from "./FloatingParticles";
import { AshokaChakra } from "./AshokaChakra";
import { HeroHeading } from "./HeroHeading";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export function HeroSection() {
  return (
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
  );
}
