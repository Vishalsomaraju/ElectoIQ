// src/components/voter-journey/StepProgressBar.jsx
import { memo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "../../utils/helpers";

/**
 * Horizontal step-progress indicator for the Voter Journey wizard.
 * Renders a connected series of step circles with animated progress fill.
 *
 * @param {Object} props
 * @param {number} props.currentStep - The 1-based index of the active step
 * @param {Array<{id: number, title: string}>} props.steps - Ordered list of wizard steps
 * @returns {JSX.Element}
 */
export const StepProgressBar = memo(function StepProgressBar({
  currentStep,
  steps,
}) {
  return (
    <div className="relative flex justify-between items-center mb-12">
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 dark:bg-white/10 -z-10 -translate-y-1/2"
      ></div>
      <motion.div
        aria-hidden="true"
        className="absolute top-1/2 left-0 h-[2px] bg-linear-to-rrom-[#FF9933] to-india-green -z-10 -translate-y-1/2"
        initial={{ width: 0 }}
        animate={{
          width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
        }}
        transition={{ duration: 0.4 }}
      />

      {steps.map((step) => {
        const isPast = currentStep > step.id;
        const isActive = currentStep === step.id;

        return (
          <div
            key={step.id}
            className="relative flex flex-col items-center group"
          >
            <div
              aria-label={`Step ${step.id}: ${step.title}${isPast ? " - completed" : isActive ? " - current" : ""}`}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 border-2",
                isPast
                  ? "bg-green-500 border-green-500 text-white shadow-md"
                  : isActive
                    ? "bg-india-saffron border-india-saffron text-white shadow-lg shadow-india-saffron/30"
                    : "bg-white dark:bg-[#0f172a] border-slate-200 dark:border-white/20 text-slate-400 dark:text-white/40 shadow-sm",
              )}
            >
              {isPast ? <CheckCircle2 size={18} /> : step.id}
            </div>
            <span
              className={cn(
                "absolute top-12 text-xs w-20 text-center font-medium transition-colors opacity-0 md:opacity-100",
                isActive
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-white/40",
              )}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
});
