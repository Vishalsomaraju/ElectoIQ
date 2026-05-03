import { Card, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { BarChart3 } from "lucide-react";

export function DashboardActivity({ recentQuizResults, isConnected }) {
  return (
    <Card className="mb-8">
      <CardTitle className="mb-4 flex items-center gap-2">
        <BarChart3 size={18} className="text-green-400" />
        Live Quiz Activity
        <Badge variant={isConnected ? "success" : "default"}>
          {isConnected ? "Live" : "Offline"}
        </Badge>
      </CardTitle>
      {recentQuizResults.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {recentQuizResults.map((result) => (
            <div
              key={result.id}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3"
            >
              <p className="text-xs text-slate-500 dark:text-white/40">
                Recent score
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {result.score ?? 0}%
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-white/50">
          Recent quiz attempts will appear here when Firestore is connected.
        </p>
      )}
    </Card>
  );
}
