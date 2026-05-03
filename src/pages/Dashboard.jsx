// src/pages/Dashboard.jsx
import { useMemo } from 'react'
import { Trophy, BookOpen, MapPin, BarChart3, Zap, Star } from 'lucide-react'
import { AnimatedPage } from '../components/shared/AnimatedPage'
import { PageWrapper } from '../components/layout/PageWrapper'
import { SectionHeader } from '../components/shared/SectionHeader'
import { useAppContext } from '../context/AppContext'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection'
import { glossaryTerms } from '../data/glossaryTerms'
import { electionStages } from '../data/electionStages'
import { getGrade } from '../utils/helpers'
import { DashboardStats } from '../components/dashboard/DashboardStats'
import { DashboardWelcome } from '../components/dashboard/DashboardWelcome'
import { DashboardActivity } from '../components/dashboard/DashboardActivity'
import { DashboardLearningProgress } from '../components/dashboard/DashboardLearningProgress'
import { DashboardQuickLinks } from '../components/dashboard/DashboardQuickLinks'

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
        <DashboardWelcome grade={grade} overallProgress={overallProgress} />

        {/* Stat Cards */}
        <DashboardStats stats={stats} />

        {/* Progress breakdown */}
        <DashboardLearningProgress
          progress={progress}
          electionStages={electionStages}
          glossaryTerms={glossaryTerms}
          milestones={milestones}
        />

        {/* Live Firestore activity */}
        <DashboardActivity
          recentQuizResults={recentQuizResults}
          isConnected={isConnected}
        />

        {/* Quick Links */}
        <DashboardQuickLinks />
      </PageWrapper>
    </AnimatedPage>
  )
}
