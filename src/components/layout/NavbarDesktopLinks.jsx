import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../utils/helpers";
import { navLinks } from "./navLinks";

export function NavbarDesktopLinks({ isActive }) {
  return (
    <div className="hidden md:flex items-center gap-0.5" role="list">
      {navLinks.map((link) => {
        const active = isActive(link.to, link.exact);
        return (
          <div key={link.to} className="relative" role="listitem">
            <Link
              to={link.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8",
              )}
            >
              {link.label}
              {/* Saffron active underline */}
              {active && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-5 rounded-full bg-india-saffron"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 35,
                  }}
                />
              )}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
