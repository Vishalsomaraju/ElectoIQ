import { Link } from "react-router-dom";
import { AnimatedPage } from "../components/shared/AnimatedPage";

/**
 * 404 Not Found page — shown for any unmatched route.
 */
export default function NotFound() {
  return (
    <AnimatedPage>
      <div
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24"
      >
        <p
          className="text-7xl font-display font-bold text-slate-200 dark:text-white/10 mb-4"
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-slate-600 dark:text-white/60 max-w-sm mb-8 text-sm leading-relaxed">
          The page you're looking for doesn't exist. It may have moved or the
          URL might be wrong.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-india-saffron text-white font-semibold hover:bg-[#e8891f] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </AnimatedPage>
  );
}
