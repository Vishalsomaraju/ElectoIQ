// src/pages/Timeline.jsx
import { useState, useMemo, useCallback } from 'react'
import { AnimatedPage } from '../components/shared/AnimatedPage'
import { PageWrapper } from '../components/layout/PageWrapper'
import { SectionHeader } from '../components/shared/SectionHeader'
import { electionStages, electionPhases } from '../data/electionStages'
import { cn } from '../utils/helpers'
import { useAppContext } from '../context/AppContext'
import { trackAnalyticsEvent, logAnalyticsEvent } from '../services/firebase'
import { TimelineEventCard } from '../components/timeline/TimelineEventCard'

export default function Timeline() {
  const [activePhase, setActivePhase] = useState('All')
  const [expanded, setExpanded] = useState(null)
  const { dispatch } = useAppContext()

  const handleToggle = useCallback((stage) => {
    setExpanded((prev) => {
      const isExpanding = prev !== stage.id
      if (isExpanding) {
        logAnalyticsEvent('timeline_stage_viewed', { stage: stage.title, phase: stage.phase })
      }
      return isExpanding ? stage.id : null
    })
  }, [])

  const handleAskBot = useCallback((stage) => {
    trackAnalyticsEvent('timeline_stage_ask_bot', { stage: stage.title })
    dispatch({ type: 'SET_CHAT_CONTEXT', payload: { stageName: stage.title } })
    dispatch({
      type: 'SET_SUGGESTED_QUESTIONS',
      payload: [
        `Explain ${stage.title} in detail`,
        `What is the role of ECI during ${stage.title}?`,
        `Can you summarize ${stage.title}?`,
      ],
    })
    dispatch({ type: 'TOGGLE_CHAT', payload: true })
  }, [dispatch])

  const phases = useMemo(() => ['All', ...electionPhases], [])
  const filtered = useMemo(
    () => activePhase === 'All' ? electionStages : electionStages.filter((s) => s.phase === activePhase),
    [activePhase],
  )

  return (
    <AnimatedPage>
      <PageWrapper>
        <SectionHeader
          eyebrow="India's Democratic Process"
          title="Election Timeline"
          description="A complete, stage-by-stage walkthrough of how India conducts the world's largest democratic exercise — from the first announcement to the formation of government."
          center
        />

        {/* Phase filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {phases.map((p) => (
            <button
              key={p}
              onClick={() => setActivePhase(p)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                activePhase === p
                  ? 'bg-primary border-primary text-white shadow-lg shadow-blue-900/30'
                  : 'border-slate-200 dark:border-white/15 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30',
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-india-saffron via-primary to-india-green opacity-40 dark:opacity-30"
          />
          <div className="space-y-8">
            {filtered.map((stage, idx) => (
              <TimelineEventCard
                key={stage.id}
                idx={idx}
                stage={stage}
                isExpanded={expanded === stage.id}
                onToggle={handleToggle}
                onAskBot={handleAskBot}
              />
            ))}
          </div>
        </div>
      </PageWrapper>
    </AnimatedPage>
  )
}
