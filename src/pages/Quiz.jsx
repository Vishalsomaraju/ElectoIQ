// src/pages/Quiz.jsx
import { useState, useCallback, useEffect } from "react";
import { AnimatedPage } from "../components/shared/AnimatedPage";
import { PageWrapper } from "../components/layout/PageWrapper";
import { SectionHeader } from "../components/shared/SectionHeader";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { trackAnalyticsEvent, logAnalyticsEvent } from "../services/firebase";
import { generateQuiz } from "../services/gemini";
import { shuffle, calcScore, getGrade } from "../utils/helpers";
import { logger } from "../utils/logger";

import { QuizQuestion } from "../components/quiz/QuizQuestion";
import { QuizResults } from "../components/quiz/QuizResults";
import { QuizAIChat } from "../components/quiz/QuizAIChat";

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [phase, setPhase] = useState("quiz"); // quiz | results

  const generateQuestions = useCallback(async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const q = await generateQuiz();
      setQuestions(q);
    } catch (err) {
      logger.warn("[Quiz] Generation failed, using fallback:", err);
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
    [current?.category, currentIdx, isAnswered]
  );

  const handleNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setRevealed(false);
    } else {
      const correctCount = Object.values(answers).filter(
        (a, i) => a === questions[i]?.correct
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
    const { quizQuestions } = await import("../data/quizQuestions");
    setQuestions(shuffle(quizQuestions).slice(0, 10));
  }, []);

  const handleGenerateAI = useCallback(async () => {
    setCurrentIdx(0);
    setAnswers({});
    setRevealed(false);
    setPhase("quiz");
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
  }, []);

  const correctCount = Object.values(answers).filter(
    (a, i) => a === questions[i]?.correct
  ).length;
  const score = calcScore(correctCount, questions.length);
  const grade = getGrade(score);

  if (generating)
    return (
      <AnimatedPage>
        <PageWrapper>
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-india-saffron animate-spin" />
            <p className="text-slate-500 dark:text-white/60 text-sm">
              ElectoBot is generating your questions...
            </p>
            {genError && (
              <p
                role="alert"
                className="text-amber-500 dark:text-amber-400 text-sm text-center mt-2"
              >
                {genError}
              </p>
            )}
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
            <QuizQuestion
              question={current}
              currentIdx={currentIdx}
              totalQuestions={questions.length}
              selectedAnswer={selectedAnswer}
              revealed={revealed}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onGenerateAI={handleGenerateAI}
            />
          )}

          {!loadingQuiz && phase === "results" && (
            <QuizResults
              score={score}
              correctCount={correctCount}
              totalQuestions={questions.length}
              grade={grade}
              onRestart={handleRestart}
              onGenerateAI={handleGenerateAI}
            />
          )}
        </div>

        <QuizAIChat current={current} />
      </PageWrapper>
    </AnimatedPage>
  );
}
