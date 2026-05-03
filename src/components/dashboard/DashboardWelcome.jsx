import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function DashboardWelcome({ grade, overallProgress }) {
  return (
    <Card className="mb-8 max-w-2xl mx-auto text-center py-8">
      <div className="inline-flex items-center justify-center size-20 rounded-2xl bg-linear-to-br from-blue-600/20 to-sky-500/20 border border-blue-500/20 mb-4 text-4xl">
        {grade.emoji}
      </div>
      <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-1">
        {grade.label}
      </h2>
      <p className={`text-sm ${grade.color} mb-6`}>Civic Readiness Level</p>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Overall civic progress: ${overallProgress} percent`}
      >
        <ProgressBar
          value={overallProgress}
          max={100}
          label="Overall Progress"
          showPercent
          color="primary"
          size="lg"
          className="max-w-xs mx-auto"
        />
      </div>
    </Card>
  );
}
