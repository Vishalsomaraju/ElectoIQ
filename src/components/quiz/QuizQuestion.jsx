import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";
import { Card } from "../ui/Card";
import { QuizOptionsList } from "./QuizOptionsList";

const difficultyColor = { Easy: "success", Medium: "warning", Hard: "danger" };

export function QuizQuestion({
  question,
  currentIdx,
  totalQuestions,
  selectedAnswer,
  revealed,
  onAnswer,
  onNext,
  onGenerateAI,
}) {
  const isAnswered = selectedAnswer !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Progress */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-white/60 font-medium">
              Question {currentIdx + 1} of {totalQuestions}
            </span>
            <Badge variant={difficultyColor[question.difficulty]}>
              {question.difficulty}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerateAI}
            icon={<Brain size={14} className="text-blue-500" />}
          >
            Generate AI Quiz
          </Button>
        </div>
        <ProgressBar
          value={currentIdx + 1}
          max={totalQuestions}
          color="primary"
        />
      </div>

      {/* Question */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={20} className="text-blue-400" />
          <Badge variant="primary">{question.category}</Badge>
        </div>
        <h3
          id="question-heading"
          className="font-display font-bold text-xl text-slate-900 dark:text-white leading-snug"
        >
          {question.question}
        </h3>
      </Card>

      {/* Options */}
      <QuizOptionsList
        options={question.options}
        selectedAnswer={selectedAnswer}
        revealed={revealed}
        correct={question.correct}
        onAnswer={onAnswer}
        isAnswered={isAnswered}
      />

      {/* Screen Reader Feedback */}
      <div role="status" aria-live="polite" className="sr-only">
        {revealed &&
          isAnswered &&
          (question.correct === selectedAnswer
            ? "Correct!"
            : `Incorrect — the right answer was ${
                question.options[question.correct]
              }`)}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 mb-6 overflow-hidden"
          >
            <p className="text-xs uppercase text-blue-400 font-semibold tracking-wider mb-1.5">
              Explanation
            </p>
            <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed">
              {question.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {isAnswered && (
        <div className="flex justify-end">
          <Button onClick={onNext} iconRight={<ChevronRight size={18} />}>
            {currentIdx < totalQuestions - 1
              ? "Next Question"
              : "See Results"}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
