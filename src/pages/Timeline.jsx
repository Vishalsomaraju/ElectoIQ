// src/pages/Timeline.jsx
import React, { useState, useMemo, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Megaphone,
  ClipboardList,
  FileEdit,
  FolderOpen,
  Speaker,
  Vote,
  Monitor,
  Hash,
  Landmark,
  Bot,
} from "lucide-react";
import { AnimatedPage } from "../components/shared/AnimatedPage";
import { PageWrapper } from "../components/layout/PageWrapper";
import { SectionHeader } from "../components/shared/SectionHeader";
import { Badge } from "../components/ui/Badge";
import { electionStages, electionPhases } from "../data/electionStages";
import { cn } from "../utils/helpers";
import { useAppContext } from "../context/AppContext";
import { trackAnalyticsEvent, logAnalyticsEvent } from "../services/firebase";

const iconMap = {
  Megaphone,
  ClipboardList,
  FileEdit,
  FolderOpen,
  Speaker,
  Vote,
  Monitor,
  Hash,
  Landmark,
};

const phaseColors = {
  "Pre-Election": "saffron",
  "Election Day": "primary",
  "Post-Election": "green",
};

const TimelineStage = React.memo(function TimelineStage({
  stage,
  idx,
  isExpanded,
  onToggle,
  onAskBot,
}) {
  const isLeft = idx % 2 === 0;
  const Icon = iconMap[stage.icon] ?? Megaphone;

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: idx * 0.05 }}
      className={cn(
        "relative flex items-start gap-6 md:gap-0",
        "md:flex-row",
        isLeft ? "md:flex-row" : "md:flex-row-reverse",
      )}
    >
      <div
        className={cn(
          "flex-1 ml-14 md:ml-0",
          isLeft ? "md:pr-12 md:text-right" : "md:pl-12",
        )}
      >
        <div
          className="bg-white dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
          onClick={() => onToggle(stage)}
        >
          <div
            className={cn(
              "flex items-start gap-3 mb-2",
              isLeft ? "md:flex-row-reverse" : "",
            )}
          >
            <Badge variant={phaseColors[stage.phase]}>{stage.phase}</Badge>
            <span className="text-slate-400 dark:text-white/40 text-xs mt-0.5">
              {stage.duration}
            </span>
          </div>

          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Icon size={20} className="text-slate-600 dark:text-white/80" />{" "}
            {stage.title}
          </h3>
          <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
            {stage.description}
          </p>

          <button
            aria-expanded={isExpanded}
            aria-controls={`stage-details-${stage.id}`}
            className="mt-3 flex items-center gap-1 text-xs text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={14} /> Less
              </>
            ) : (
              <>
                <ChevronDown size={14} /> Details
              </>
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.ul
                id={`stage-details-${stage.id}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-2 overflow-hidden"
              >
                {stage.details.map((d, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-600 dark:text-white/70"
                  >
                    <span
                      className="size-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    {d}
                  </li>
                ))}
                <li className="pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAskBot(stage);
                    }}
                    className="w-full mt-2 py-2 px-4 rounded-xl bg-linear-to-rrom-[#FF9933]/10 to-india-green/10 border border-india-saffron/20 dark:border-white/10 hover:border-india-saffron/40 dark:hover:border-white/30 text-slate-800 dark:text-white/90 text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <Bot size={16} className="text-india-saffron" />
                    Ask ElectoBot about this stage
                  </button>
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
        <div
          className="size-10 rounded-full border-2 border-current bg-white dark:bg-[#0f1524] flex items-center justify-center z-10"
          style={{ borderColor: stage.color, color: stage.color }}
        >
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
});

export default function Timeline() {
  const [activePhase, setActivePhase] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const { dispatch } = useAppContext();

  const handleToggle = useCallback((stage) => {
    setExpanded((prev) => {
      const isExpanding = prev !== stage.id;
      if (isExpanding) {
        logAnalyticsEvent("timeline_stage_viewed", {
          stage: stage.title,
          phase: stage.phase,
        });
      }
      return isExpanding ? stage.id : null;
    });
  }, []);

  const handleAskBot = useCallback(
    (stage) => {
      trackAnalyticsEvent("timeline_stage_ask_bot", { stage: stage.title });
      dispatch({
        type: "SET_CHAT_CONTEXT",
        payload: { stageName: stage.title },
      });
      dispatch({
        type: "SET_SUGGESTED_QUESTIONS",
        payload: [
          `Explain ${stage.title} in detail`,
          `What is the role of ECI during ${stage.title}?`,
          `Can you summarize ${stage.title}?`,
        ],
      });
      dispatch({ type: "TOGGLE_CHAT", payload: true });
    },
    [dispatch],
  );

  const phases = useMemo(() => ["All", ...electionPhases], []);
  const filtered = useMemo(
    () =>
      activePhase === "All"
        ? electionStages
        : electionStages.filter((s) => s.phase === activePhase),
    [activePhase],
  );

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
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                activePhase === p
                  ? "bg-primary border-primary text-white shadow-lg shadow-blue-900/30"
                  : "border-slate-200 dark:border-white/15 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30",
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            aria-hidden="true"
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-india-saffron via-primary to-india-green opacity-40 dark:opacity-30"
          />

          <div className="space-y-8">
            {filtered.map((stage, idx) => {
              const isExpanded = expanded === stage.id;

              return (
                <TimelineStage
                  key={stage.id}
                  idx={idx}
                  stage={stage}
                  isExpanded={isExpanded}
                  onToggle={handleToggle}
                  onAskBot={handleAskBot}
                />
              );
            })}
          </div>
        </div>
      </PageWrapper>
    </AnimatedPage>
  );
}
