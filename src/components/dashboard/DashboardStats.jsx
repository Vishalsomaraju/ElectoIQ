import { motion } from "framer-motion";
import { Card } from "../ui/Card";

const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const itemV = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function DashboardStats({ stats }) {
  return (
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
  );
}
