export function Step5PollingDay() {
  return (
    <div className="space-y-6 text-sm text-slate-700 dark:text-white/80">
      <div className="relative pl-6 border-l border-slate-200 dark:border-white/10 space-y-6">
        <div className="relative">
          <div className="absolute w-3 h-3 bg-red-400 rounded-full left-[-29px] top-1"></div>
          <h4 className="font-bold text-slate-900 dark:text-white">
            Before leaving home
          </h4>
          <p className="text-xs mt-1">
            Check polling booth location, carry your Voter ID, and verify
            polling time (usually 7AM–6PM).
          </p>
        </div>
        <div className="relative">
          <div className="absolute w-3 h-3 bg-red-400 rounded-full left-[-29px] top-1"></div>
          <h4 className="font-bold text-slate-900 dark:text-white">
            At the polling station
          </h4>
          <p className="text-xs mt-1">
            Join the queue. Show ID to polling officer. Ink will be applied to
            your left index finger.
          </p>
        </div>
        <div className="relative">
          <div className="absolute w-3 h-3 bg-red-400 rounded-full left-[-29px] top-1"></div>
          <h4 className="font-bold text-slate-900 dark:text-white">
            At the EVM
          </h4>
          <p className="text-xs mt-1">
            Press the button next to your candidate. Wait for the beep and check
            the VVPAT paper slip for 7 seconds to confirm your vote.
          </p>
        </div>
      </div>
    </div>
  );
}
