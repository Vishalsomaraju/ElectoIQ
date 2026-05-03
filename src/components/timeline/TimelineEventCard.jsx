import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  Megaphone,
  ClipboardList,
  FileEdit,
  FolderOpen,
  Speaker,
  Vote,
  Monitor,
  Hash,
  Landmark,
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { cn } from '../../utils/helpers'
import { AskBotButton } from './AskBotButton'

const iconMap = {
  Megaphone,
  ClipboardList,
  FileEdit,
  FolderOpen,
  Speaker,
  Vote,
  Monitor,
  Hash,
  Landmark,
}

const phaseColors = {
  'Pre-Election': 'saffron',
  'Election Day': 'primary',
  'Post-Election': 'green',
}

export const TimelineEventCard = React.memo(function TimelineEventCard({
  stage,
  idx,
  isExpanded,
  onToggle,
  onAskBot,
}) {
  const isLeft = idx % 2 === 0
  const Icon = iconMap[stage.icon] ?? Megaphone

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: idx * 0.05 }}
      className={cn(
        'relative flex items-start gap-6 md:gap-0',
        'md:flex-row',
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse',
      )}
    >
      <div
        className={cn(
          'flex-1 ml-14 md:ml-0',
          isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12',
        )}
      >
        <div
          className="bg-white dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
          onClick={() => onToggle(stage)}
        >
          <div
            className={cn(
              'flex items-start gap-3 mb-2',
              isLeft ? 'md:flex-row-reverse' : '',
            )}
          >
            <Badge variant={phaseColors[stage.phase]}>{stage.phase}</Badge>
            <span className="text-slate-400 dark:text-white/40 text-xs mt-0.5">
              {stage.duration}
            </span>
          </div>

          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Icon size={20} className="text-slate-600 dark:text-white/80" />{' '}
            {stage.title}
          </h3>
          <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
            {stage.description}
          </p>

          <button
            aria-expanded={isExpanded}
            aria-controls={`stage-details-${stage.id}`}
            className="mt-3 flex items-center gap-1 text-xs text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 transition-colors"
          >
            {isExpanded ? (
              <><ChevronUp size={14} /> Less</>
            ) : (
              <><ChevronDown size={14} /> Details</>
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.ul
                id={`stage-details-${stage.id}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-2 overflow-hidden"
              >
                {stage.details.map((d, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-600 dark:text-white/70"
                  >
                    <span
                      className="size-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    {d}
                  </li>
                ))}
                <li className="pt-2">
                  <AskBotButton stage={stage} onAskBot={onAskBot} />
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
        <div
          className="size-10 rounded-full border-2 border-current bg-white dark:bg-[#0f1524] flex items-center justify-center z-10"
          style={{ borderColor: stage.color, color: stage.color }}
        >
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  )
})
