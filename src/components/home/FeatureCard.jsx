import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const cardVariant = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export function FeatureCard({ feature }) {
  const { Icon, title, desc, to, accent, bg, ring } = feature
  return (
    <motion.div variants={cardVariant}>
      <Link
        to={to}
        className="group relative block h-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/8 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-300 dark:hover:border-white/20 shadow-sm hover:shadow-xl hover:shadow-slate-200 dark:hover:shadow-black/40 overflow-hidden"
      >
        {/* Subtle accent glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top left, ${bg} 0%, transparent 70%)` }}
          aria-hidden="true"
        />
        {/* Icon container */}
        <div
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
          style={{ background: bg, boxShadow: `0 0 0 1px ${ring}` }}
          aria-hidden="true"
        >
          <Icon size={26} strokeWidth={1.8} style={{ color: accent }} />
        </div>
        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-white/45 text-sm leading-relaxed mb-5">{desc}</p>
        <div className="flex items-center gap-1.5 text-sm font-semibold transition-all duration-200" style={{ color: accent }}>
          Explore
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
          style={{ background: accent }}
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  )
}
