import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";

const stats = [
  { value: 543, suffix: "", label: "Constituencies", color: "#FF9933" },
  { value: 96, suffix: " Cr+", label: "Registered Voters", color: "#138808" },
  { value: 7, suffix: "", label: "Election Phases", color: "#1a56db" },
  { value: 18, suffix: "+", label: "Age to Vote", color: "#0ea5e9" },
];

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

export function StatsRow() {
  return (
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
  );
}
