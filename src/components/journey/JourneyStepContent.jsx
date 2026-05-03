import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../utils/helpers'

export function JourneyStepContent({ currentStep, totalSteps, direction, ActiveStepData }) {
  return (
    <AnimatePresence mode="popLayout" custom={direction}>
      <motion.div
        key={currentStep}
        custom={direction}
        initial={{ opacity: 0, x: direction * 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -50 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-full h-full"
      >
        <div className="flex items-center gap-4 mb-8">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              ActiveStepData.bgColor,
              ActiveStepData.color,
            )}
          >
            <ActiveStepData.icon size={24} />
          </div>
          <div>
            <p className="text-sm font-mono text-slate-500 dark:text-white/40">
              Step {currentStep} of {totalSteps}
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {ActiveStepData.title}
            </h2>
          </div>
        </div>

        <ActiveStepData.Content />
      </motion.div>
    </AnimatePresence>
  )
}
