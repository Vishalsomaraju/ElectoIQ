import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AshokaChakra } from "./AshokaChakra";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export function BottomCTA() {
  return (
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
  );
}
