import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { Badge } from "../ui/Badge";
import { BarChart3, Zap } from "lucide-react";

export function DashboardLearningProgress({
  progress,
  electionStages,
  glossaryTerms,
  milestones,
}) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-400" /> Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ProgressBar
            label="Timeline"
            value={progress.timelineViewed.length}
            max={electionStages.length}
            showPercent
            color="saffron"
          />
          <ProgressBar
            label="Glossary"
            value={progress.glossaryViewed.length}
            max={glossaryTerms.length}
            showPercent
            color="green"
          />
          <ProgressBar
            label="Quizzes"
            value={Math.min(progress.quizzesCompleted, 5)}
            max={5}
            showPercent
            color="primary"
          />
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={18} className="text-yellow-400" /> Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {milestones.map((m) => {
            const val =
              m.key === "quizzesCompleted"
                ? progress.quizzesCompleted
                : progress[m.key]?.length || 0;
            const achieved = val >= m.threshold;

            return (
              <div key={m.label} className="flex items-center gap-3">
                <span
                  className={`text-xl ${achieved ? "" : "opacity-30 grayscale"}`}
                >
                  {m.icon}
                </span>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${achieved ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-white/40"}`}
                  >
                    {m.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-white/30">
                    {Math.min(val, m.threshold)}/{m.threshold}
                  </p>
                </div>
                {achieved ? (
                  <Badge variant="success">Earned</Badge>
                ) : (
                  <Badge variant="default">Locked</Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
