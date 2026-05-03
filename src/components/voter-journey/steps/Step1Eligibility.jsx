import { useState } from "react";
import { motion } from "framer-motion";

export function Step1Eligibility() {
  const [checks, setChecks] = useState([false, false, false, false]);
  const allChecked = checks.every((c) => c);

  const toggleCheck = (idx) => {
    const newChecks = [...checks];
    newChecks[idx] = !newChecks[idx];
    setChecks(newChecks);
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-600 dark:text-white/70 mb-6 text-sm">
        Please verify your eligibility to vote in India:
      </p>
      {[
        "I am 18 years or older",
        "I am a citizen of India",
        "I am ordinarily resident in the constituency",
        "I am not disqualified under any law",
      ].map((text, idx) => (
        <label
          key={idx}
          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition shadow-sm"
        >
          <input
            type="checkbox"
            checked={checks[idx]}
            onChange={() => toggleCheck(idx)}
            className="w-5 h-5 rounded border-slate-300 dark:border-gray-600 bg-transparent focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-slate-900 dark:text-white text-sm">{text}</span>
        </label>
      ))}
      {allChecked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl mt-6 text-center"
        >
          <p className="text-green-700 dark:text-green-400 font-semibold">
            You are eligible! Let's register.
          </p>
        </motion.div>
      )}
    </div>
  );
}
