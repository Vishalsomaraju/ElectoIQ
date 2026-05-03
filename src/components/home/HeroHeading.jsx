import { motion } from "framer-motion";

const wordVariants = {
  hidden: { opacity: 0, y: 44 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function HeroHeading() {
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
