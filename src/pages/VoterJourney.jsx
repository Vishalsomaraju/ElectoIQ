import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { AnimatedPage } from "../components/shared/AnimatedPage";
import { PageWrapper } from "../components/layout/PageWrapper";
import { SectionHeader } from "../components/shared/SectionHeader";
import { useAuthContext } from "../context/AuthContext";
import { useFirestore } from "../hooks/useFirestore";
import { trackAnalyticsEvent, logAnalyticsEvent } from "../services/firebase";
import { cn } from "../utils/helpers";
import { StepProgressBar } from "../components/voter-journey/StepProgressBar";
import { WizardNavigation } from "../components/voter-journey/WizardNavigation";
import { WIZARD_STEPS } from "../data/wizardSteps";

export default function VoterJourney() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const previousStepRef = useRef(currentStep);
  const { currentUser } = useAuthContext();
  const { setDocument } = useFirestore("users");

  const handleNext = useCallback(() => {
    if (currentStep < WIZARD_STEPS.length) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Effects per step
  useEffect(() => {
    const previousStep = previousStepRef.current;
    previousStepRef.current = currentStep;

    if (
      currentStep === WIZARD_STEPS.length &&
      previousStep !== WIZARD_STEPS.length
    ) {
      logAnalyticsEvent("voter_journey_completed", { stepsViewed: 6 });
      trackAnalyticsEvent("voter_journey_completed", {
        steps_viewed: WIZARD_STEPS.length,
      });
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#FF9933", "#ffffff", "#138808"],
      });

      if (currentUser) {
        setDocument(currentUser.uid, {
          progress: {
            voterJourney: {
              completed: true,
              completedAt: new Date(),
              stepsViewed: 6,
            },
          },
          updatedAt: new Date(),
        });
      }
    }
  }, [currentStep, currentUser, setDocument]);

  const ActiveStepData = WIZARD_STEPS[currentStep - 1];

  return (
    <AnimatedPage>
      <PageWrapper>
        <SectionHeader
          eyebrow="Interactive Guide"
          title="The Voter Journey Wizard"
          description="A step-by-step interactive guide from checking eligibility to casting your vote."
          center
        />

        <div className="max-w-2xl mx-auto mb-20">
          {/* Progress Bar Header */}
          <StepProgressBar currentStep={currentStep} steps={WIZARD_STEPS} />

          {!currentUser && currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center text-sm text-blue-300"
            >
              Sign in with Google to save your progress automatically.
            </motion.div>
          )}

          {/* Main Wizard Card */}
          <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl relative min-h-[400px] flex flex-col">
            <div className="flex-1 p-6 md:p-10 relative overflow-hidden">
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -50 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full h-full"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        ActiveStepData.bgColor,
                        ActiveStepData.color,
                      )}
                    >
                      <ActiveStepData.icon size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-mono text-slate-500 dark:text-white/40">
                        Step {currentStep} of {WIZARD_STEPS.length}
                      </p>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {ActiveStepData.title}
                      </h2>
                    </div>
                  </div>

                  <ActiveStepData.Content />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <WizardNavigation
              currentStep={currentStep}
              totalSteps={WIZARD_STEPS.length}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </div>
        </div>
      </PageWrapper>
    </AnimatedPage>
  );
}
