import { motion } from "framer-motion";
import { Trophy, RotateCcw, Brain } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { cn } from "../../utils/helpers";

export function QuizResults({
  score,
  correctCount,
  totalQuestions,
  grade,
  onRestart,
  onGenerateAI,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="text-center py-10">
        <Trophy size={52} className="mx-auto mb-4 text-yellow-400" />
        <div role="status" aria-live="polite" aria-atomic="true">
          <h2 className="font-display font-extrabold text-4xl text-slate-900 dark:text-white mb-1">
            {score}%
          </h2>
          <p className={cn("font-semibold text-lg mb-1", grade.color)}>
            {grade.emoji} {grade.label}
          </p>
          <p className="text-slate-600 dark:text-white/50 text-sm mb-6">
            {correctCount} out of {totalQuestions} correct
          </p>
        </div>
        <ProgressBar
          value={score}
          max={100}
          color="green"
          size="lg"
          showPercent
          className="mb-8 max-w-xs mx-auto"
        />

        <div className="grid grid-cols-3 gap-3 mb-8 max-w-sm mx-auto">
          <div className="bg-slate-50 dark:bg-surface-dark/70 backdrop-blur-md rounded-xl py-4">
            <p className="text-2xl font-bold text-green-400">
              {correctCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-white/50">Correct</p>
          </div>
          <div className="bg-slate-50 dark:bg-surface-dark/70 backdrop-blur-md rounded-xl py-4">
            <p className="text-2xl font-bold text-red-400">
              {totalQuestions - correctCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-white/50">Wrong</p>
          </div>
          <div className="bg-slate-50 dark:bg-surface-dark/70 backdrop-blur-md rounded-xl py-4">
            <p className="text-2xl font-bold text-blue-400">{score}%</p>
            <p className="text-xs text-slate-500 dark:text-white/50">Score</p>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button
            onClick={onRestart}
            variant="outline"
            icon={<RotateCcw size={16} />}
          >
            Retry Default
          </Button>
          <Button onClick={onGenerateAI} icon={<Brain size={16} />}>
            Generate AI Quiz
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
