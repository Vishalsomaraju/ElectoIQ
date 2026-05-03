// src/pages/Dashboard.jsx
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, BookOpen, MapPin, BarChart3, Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedPage } from "../components/shared/AnimatedPage";
import { PageWrapper } from "../components/layout/PageWrapper";
import { SectionHeader } from "../components/shared/SectionHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAppContext } from "../context/AppContext";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { glossaryTerms } from "../data/glossaryTerms";
import { electionStages } from "../data/electionStages";
import { getGrade } from "../utils/helpers";

const milestones = [
  { label: "First Quiz", icon: "🎯", threshold: 1, key: "quizzesCompleted" },
  { label: "Quiz Master", icon: "🏆", threshold: 5, key: "quizzesCompleted" },
  {
    label: "Timeline Explorer",
    icon: "🗺️",
    threshold: 5,
    key: "timelineViewed",
  },
  { label: "Glossary Guru", icon: "📚", threshold: 20, key: "glossaryViewed" },
];

const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const itemV = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { state } = useAppContext();
  const { progress } = state;
  const { data: recentQuizResults, isConnected } = useFirestoreCollection(
    "quizResults",
    { limitCount: 5, orderByField: "createdAt" },
  );

  const avgScore = useMemo(
    () =>
      progress.quizzesCompleted > 0
        ? Math.round(progress.totalScore / progress.quizzesCompleted)
        : 0,
    [progress.quizzesCompleted, progress.totalScore],
  );
  const grade = useMemo(() => getGrade(avgScore), [avgScore]);

  const overallProgress = useMemo(
    () =>
      Math.round(
        (progress.timelineViewed.length / electionStages.length) * 33 +
          (progress.glossaryViewed.length / glossaryTerms.length) * 33 +
          (Math.min(progress.quizzesCompleted, 5) / 5) * 34,
      ),
    [progress],
  );

  const stats = useMemo(
    () => [
      {
        icon: <Trophy size={22} />,
        label: "Quizzes Done",
        value: progress.quizzesCompleted,
        color: "text-yellow-400",
        bg: "bg-yellow-500/15",
      },
      {
        icon: <Star size={22} />,
        label: "Avg Score",
        value: `${avgScore}%`,
        color: "text-blue-400",
        bg: "bg-blue-500/15",
      },
      {
        icon: <BookOpen size={22} />,
        label: "Terms Viewed",
        value: progress.glossaryViewed.length,
        color: "text-green-400",
        bg: "bg-green-500/15",
      },
      {
        icon: <MapPin size={22} />,
        label: "Timeline Steps",
        value: progress.timelineViewed.length,
        color: "text-orange-400",
        bg: "bg-orange-500/15",
      },
    ],
    [avgScore, progress],
  );

  return (
    <AnimatedPage>
      <PageWrapper>
        <SectionHeader
          eyebrow="Your Learning Hub"
          title="Dashboard"
          description="Track your civic education progress and unlock achievements."
          center
        />

        {/* Overall Progress */}
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

        {/* Stat Cards */}
        <motion.div
          variants={containerV}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={itemV}>
              <Card className="text-center py-6">
                <div
                  className={`size-12 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-3 ${s.color}`}
                >
                  {s.icon}
                </div>
                <p
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={`${s.label}: ${s.value}`}
                  className={`text-2xl font-bold ${s.color} mb-1`}
                >
                  {s.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-white/50">
                  {s.label}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-400" /> Learning
                Progress
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

        {/* Live Firestore activity */}
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

        {/* Quick Links */}
        <Card>
          <CardTitle className="mb-4">Continue Learning</CardTitle>
          <div className="flex flex-wrap gap-3">
            <Link to="/timeline">
              <Button variant="outline" size="sm">
                📅 Timeline
              </Button>
            </Link>
            <Link to="/voter-journey">
              <Button variant="outline" size="sm">
                🗺️ Voter Journey
              </Button>
            </Link>
            <Link to="/quiz">
              <Button size="sm">🧠 Take Quiz</Button>
            </Link>
            <Link to="/glossary">
              <Button variant="outline" size="sm">
                📖 Glossary
              </Button>
            </Link>
          </div>
        </Card>
      </PageWrapper>
    </AnimatedPage>
  );
}
