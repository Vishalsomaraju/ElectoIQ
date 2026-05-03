import { AnimatedPage } from '../shared/AnimatedPage'
import { PageWrapper } from '../layout/PageWrapper'

export function QuizGeneratingView({ genError }) {
  return (
    <AnimatedPage>
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-india-saffron animate-spin" />
          <p className="text-slate-500 dark:text-white/60 text-sm">
            ElectoBot is generating your questions...
          </p>
          {genError && (
            <p role="alert" className="text-amber-500 dark:text-amber-400 text-sm text-center mt-2">
              {genError}
            </p>
          )}
        </div>
      </PageWrapper>
    </AnimatedPage>
  )
}
