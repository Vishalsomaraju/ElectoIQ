// src/pages/Quiz.jsx
import { AnimatedPage } from '../components/shared/AnimatedPage'
import { PageWrapper } from '../components/layout/PageWrapper'
import { SectionHeader } from '../components/shared/SectionHeader'
import { QuizQuestion } from '../components/quiz/QuizQuestion'
import { QuizResults } from '../components/quiz/QuizResults'
import { QuizAIChat } from '../components/quiz/QuizAIChat'
import { QuizLoadingSkeleton } from '../components/quiz/QuizLoadingSkeleton'
import { QuizGeneratingView } from '../components/quiz/QuizGeneratingView'
import { useQuiz } from '../hooks/useQuiz'

export default function Quiz() {
  const {
    current, selectedAnswer, generating, genError, loadingQuiz, phase,
    currentIdx, totalQuestions, revealed,
    correctCount, score, grade,
    handleAnswer, handleNext, handleRestart, handleGenerateAI,
  } = useQuiz()

  if (generating) return <QuizGeneratingView genError={genError} />

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
          {loadingQuiz && <QuizLoadingSkeleton />}

          {!loadingQuiz && phase === 'quiz' && current && (
            <QuizQuestion
              question={current}
              currentIdx={currentIdx}
              totalQuestions={totalQuestions}
              selectedAnswer={selectedAnswer}
              revealed={revealed}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onGenerateAI={handleGenerateAI}
            />
          )}

          {!loadingQuiz && phase === 'results' && (
            <QuizResults
              score={score}
              correctCount={correctCount}
              totalQuestions={totalQuestions}
              grade={grade}
              onRestart={handleRestart}
              onGenerateAI={handleGenerateAI}
            />
          )}
        </div>

        <QuizAIChat current={current} />
      </PageWrapper>
    </AnimatedPage>
  )
}
