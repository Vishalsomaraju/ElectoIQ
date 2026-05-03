import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/helpers";
import { navLinks } from "./navLinks";
import { DarkModeToggle } from "./DarkModeToggle";
import { AuthButton } from "./AuthButton";

export function NavbarMobileMenu({ open, isActive }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="md:hidden backdrop-blur-md bg-white/95 dark:bg-[#0f172a]/95 border-t border-slate-200 dark:border-white/10 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 pt-3 pb-5 flex flex-col gap-1">
            {navLinks.map((link, i) => {
              const active = isActive(link.to, link.exact);
              return (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                >
                  <Link
                    to={link.to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-india-saffron/10n/10 dark:bg-india-saffron/15 text-india-saffron border border-india-saffron/20"
                        : "text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8",
                    )}
                  >
                    {active && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-india-saffron"
                        aria-hidden="true"
                      />
                    )}
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}

            {/* Mobile auth + dark toggle */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
              <DarkModeToggle />
              <div className="flex-1">
                <AuthButton compact />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
