import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { cn } from '../../utils/helpers'

const categoryBadgeMap = {
  Institution: 'primary',
  Regulation: 'warning',
  Voter: 'success',
  Technology: 'accent',
  Legislature: 'navy',
  Structure: 'default',
  Candidate: 'saffron',
  'Political Party': 'green',
  Process: 'primary',
  Finance: 'warning',
  Campaign: 'danger',
  Governance: 'navy',
  Statistics: 'success',
}

export const GlossaryTermCard = React.memo(function GlossaryTermCard({
  term,
  idx,
  isOpen,
  onToggle,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
    >
      <Card
        hover
        aria-expanded={isOpen}
        className={cn('h-full cursor-pointer', isOpen && 'border-blue-500/30')}
        onClick={() => onToggle(term)}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant={categoryBadgeMap[term.category] || 'default'}>
            {term.category}
          </Badge>
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-snug mb-2">
          {term.term}
        </h3>
        <p
          className={cn(
            'text-sm text-slate-600 dark:text-white/60 leading-relaxed',
            !isOpen && 'line-clamp-3',
          )}
        >
          {term.definition}
        </p>
        {term.example && isOpen && (
          <div className="mt-3 rounded-lg bg-slate-50 dark:bg-white/5 p-3 border border-slate-100 dark:border-white/5">
            <p className="text-xs text-slate-500 dark:text-white/40 uppercase font-semibold mb-1">
              Example
            </p>
            <p className="text-xs text-slate-700 dark:text-white/70 italic">
              {term.example}
            </p>
          </div>
        )}
        <p className="mt-2 text-xs text-blue-400" aria-hidden="true">
          {isOpen ? '▲ Show less' : '▼ Show more'}
        </p>
      </Card>
    </motion.div>
  )
})
