// src/pages/Quiz.jsx
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ChevronRight,
  RotateCcw,
  Trophy,
  Send,
  Bot,
  X,
  Loader2,
} from "lucide-react";
import { AnimatedPage } from "../components/shared/AnimatedPage";
import { PageWrapper } from "../components/layout/PageWrapper";
import { SectionHeader } from "../components/shared/SectionHeader";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Card } from "../components/ui/Card";
import { useGemini } from "../hooks/useGemini";
import { trackAnalyticsEvent, logAnalyticsEvent } from "../services/firebase";
import { generateQuiz } from "../services/gemini";
import { shuffle, calcScore, getGrade } from "../utils/helpers";
import { cn } from "../utils/helpers";
import { Skeleton } from "../components/ui/Skeleton";

const difficultyColor = { Easy: "success", Medium: "warning", Hard: "danger" };

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [_genError, setGenError] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [phase, setPhase] = useState("quiz"); // quiz | results
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const {
    messages,
    streaming,
    error: aiError,
    sendMessage,
    clearChat,
  } = useGemini();

  const generateQuestions = useCallback(async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const q = await generateQuiz();
      setQuestions(q);
    } catch (err) {
      console.warn("[Quiz] Generation failed, using fallback:", err);
      const { quizQuestions } = await import("../data/quizQuestions");
      setQuestions(shuffle(quizQuestions).slice(0, 10));
      setGenError("Using local questions — AI generation unavailable");
    } finally {
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  const current = questions.at(currentIdx);
  const selectedAnswer = answers[currentIdx];
  const isAnswered = selectedAnswer !== undefined;

  const handleAnswer = useCallback(
    (idx) => {
      if (isAnswered) return;
      setAnswers((prev) => ({ ...prev, [currentIdx]: idx }));
      setRevealed(true);
      trackAnalyticsEvent("quiz_answered", {
        question_index: currentIdx + 1,
        category: current?.category ?? "unknown",
      });
    },
    [current?.category, currentIdx, isAnswered],
  );

  const handleNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setRevealed(false);
    } else {
      const correctCount = Object.values(answers).filter(
        (a, i) => a === questions[i]?.correct,
      ).length;
      const score = calcScore(correctCount, questions.length);

      trackAnalyticsEvent("quiz_completed", { score });
      setPhase("results");
      logAnalyticsEvent("quiz_completed", {
        score,
        correct: correctCount,
        total: questions.length,
      });
    }
  }, [answers, currentIdx, questions]);

  const handleRestart = useCallback(async () => {
    setCurrentIdx(0);
    setAnswers({});
    setRevealed(false);
    setPhase("quiz");
    clearChat();
    const { quizQuestions } = await import("../data/quizQuestions");
    setQuestions(shuffle(quizQuestions).slice(0, 10));
  }, [clearChat]);

  const handleGenerateAI = useCallback(async () => {
    setCurrentIdx(0);
    setAnswers({});
    setRevealed(false);
    setPhase("quiz");
    clearChat();
    setLoadingQuiz(true);
    try {
      const q = await generateQuiz();
      setQuestions(q);
      trackAnalyticsEvent("quiz_generated_ai", { question_count: q.length });
    } catch (_err) {
      const { quizQuestions } = await import("../data/quizQuestions");
      setQuestions(shuffle(quizQuestions).slice(0, 10));
    } finally {
      setLoadingQuiz(false);
    }
  }, [clearChat]);

  const correctCount = Object.values(answers).filter(
    (a, i) => a === questions[i]?.correct,
  ).length;
  const score = calcScore(correctCount, questions.length);
  const grade = getGrade(score);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    await sendMessage(text, {
      currentPage: "quiz",
      currentStage: current
        ? `Question about ${current.category}: ${current.question}`
        : null,
    });
  }, [input, streaming, sendMessage, current]);

  if (generating)
    return (
      <AnimatedPage>
        <PageWrapper>
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-india-saffron animate-spin" />
            <p className="text-slate-500 dark:text-white/60 text-sm">
              ElectoBot is generating your questions...
            </p>
          </div>
        </PageWrapper>
      </AnimatedPage>
    );

  return (
    <AnimatedPage>
      <PageWrapper>
        <SectionHeader
          eyebrow="Test Your Knowledge"
          title="Election Quiz"
          description="10 questions about Indian elections. Get instant explanations and ask the AI for more help."
          center
        />

        {/* AI Chat Floating Button */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-surface-dark/70 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 w-80 sm:w-96 flex flex-col shadow-2xl overflow-hidden"
                style={{ height: "460px" }}
              >
                {/* Chat header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center gap-2">
                    <Bot size={18} className="text-blue-400" />
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      ElectoIQ AI
                    </span>
                    <span className="size-2 rounded-full bg-green-400 animate-pulse" />
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center text-slate-500 dark:text-white/40 text-sm pt-8">
                      <Bot
                        size={32}
                        className="mx-auto mb-2 text-slate-300 dark:text-white/20"
                      />
                      Ask me anything about Indian elections!
                    </div>
                  )}
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex",
                        m.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                          m.role === "user"
                            ? "bg-primary text-white rounded-br-sm"
                            : "bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white/90 rounded-bl-sm",
                        )}
                      >
                        {m.content}
                        {m.streaming && (
                          <span className="inline-block w-1.5 h-4 bg-white/60 animate-pulse ml-0.5 align-middle rounded-sm" />
                        )}
                      </div>
                    </div>
                  ))}
                  {aiError && (
                    <p className="text-red-400 text-xs text-center">
                      {aiError}
                    </p>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2 px-3 pb-3 pt-2 border-t border-slate-100 dark:border-white/10">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask about elections…"
                    className="flex-1 bg-slate-100 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={streaming || !input.trim()}
                    className="size-9 rounded-xl bg-primary flex items-center justify-center text-white disabled:opacity-40 hover:bg-primary-dark transition-colors"
                  >
                    {streaming ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            aria-label={chatOpen ? "Close AI assistant" : "Open AI assistant"}
            onClick={() => setChatOpen((o) => !o)}
            className="size-14 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-blue-900/50 hover:scale-105 transition-transform"
          >
            {chatOpen ? (
              <X size={22} className="text-white" />
            ) : (
              <Bot size={22} className="text-white" />
            )}
          </button>
        </div>

        {/* Quiz / Results */}
        <div className="max-w-2xl mx-auto">
          {loadingQuiz && (
            <div className="space-y-6">
              <div className="mb-6 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-2 w-full" />
              </div>
              <Card className="mb-6 space-y-4">
                <Skeleton className="h-6 w-1/5" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-4/5" />
              </Card>
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            </div>
          )}

          {!loadingQuiz && phase === "quiz" && current && (
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress */}
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 dark:text-white/60 font-medium">
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                    <Badge variant={difficultyColor[current.difficulty]}>
                      {current.difficulty}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateAI}
                    icon={<Brain size={14} className="text-blue-500" />}
                  >
                    Generate AI Quiz
                  </Button>
                </div>
                <ProgressBar
                  value={currentIdx + 1}
                  max={questions.length}
                  color="primary"
                />
              </div>

              {/* Question */}
              <Card className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={20} className="text-blue-400" />
                  <Badge variant="primary">{current.category}</Badge>
                </div>
                <h3
                  id="question-heading"
                  className="font-display font-bold text-xl text-slate-900 dark:text-white leading-snug"
                >
                  {current.question}
                </h3>
              </Card>

              {/* Options */}
              <div
                role="radiogroup"
                aria-labelledby="question-heading"
                className="space-y-3 mb-6"
              >
                {current.options.map((opt, i) => {
                  const isSelected = selectedAnswer === i;
                  const isCorrect = current.correct === i;
                  let style =
                    "border-slate-200 dark:border-white/15 text-slate-700 dark:text-white/80 hover:border-slate-300 dark:hover:border-white/30 hover:bg-slate-50 dark:hover:bg-white/5";
                  if (revealed) {
                    if (isCorrect)
                      style =
                        "border-green-500/70 bg-green-500/15 text-green-600 dark:text-green-300";
                    else if (isSelected)
                      style =
                        "border-red-500/70 bg-red-500/15 text-red-600 dark:text-red-300";
                    else
                      style =
                        "border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40";
                  }

                  return (
                    <button
                      key={i}
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleAnswer(i)}
                      disabled={isAnswered}
                      className={cn(
                        "w-full text-left px-5 py-3.5 rounded-xl border transition-all duration-200 text-sm font-medium",
                        style,
                        !isAnswered && "cursor-pointer active:scale-[0.99]",
                      )}
                    >
                      <span className="inline-flex items-center gap-3">
                        <span className="size-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Screen Reader Feedback */}
              <div role="status" aria-live="polite" className="sr-only">
                {revealed &&
                  isAnswered &&
                  (current.correct === selectedAnswer
                    ? "Correct!"
                    : `Incorrect — the right answer was ${current.options[current.correct]}`)}
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
                      {current.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {isAnswered && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleNext}
                    iconRight={<ChevronRight size={18} />}
                  >
                    {currentIdx < questions.length - 1
                      ? "Next Question"
                      : "See Results"}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {!loadingQuiz && phase === "results" && (
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
                    {correctCount} out of {questions.length} correct
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
                    <p className="text-xs text-slate-500 dark:text-white/50">
                      Correct
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-surface-dark/70 backdrop-blur-md rounded-xl py-4">
                    <p className="text-2xl font-bold text-red-400">
                      {questions.length - correctCount}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-white/50">
                      Wrong
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-surface-dark/70 backdrop-blur-md rounded-xl py-4">
                    <p className="text-2xl font-bold text-blue-400">{score}%</p>
                    <p className="text-xs text-slate-500 dark:text-white/50">
                      Score
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleRestart}
                    variant="outline"
                    icon={<RotateCcw size={16} />}
                  >
                    Retry Default
                  </Button>
                  <Button onClick={handleGenerateAI} icon={<Brain size={16} />}>
                    Generate AI Quiz
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </PageWrapper>
    </AnimatedPage>
  );
}
