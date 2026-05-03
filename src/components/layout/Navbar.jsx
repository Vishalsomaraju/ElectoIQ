// src/components/layout/Navbar.jsx
import { useState, useEffect, useCallback } from "react";
import { logger } from "../../utils/logger";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, LogOut, Loader2 } from "lucide-react";
import { cn } from "../../utils/helpers";
import { useAuthContext } from "../../context/AuthContext";

const navLinks = [
  { to: "/", label: "Home", exact: true },
  { to: "/timeline", label: "Timeline" },
  { to: "/voter-journey", label: "Voter Journey" },
  { to: "/quiz", label: "Quiz" },
  { to: "/glossary", label: "Glossary" },
];

// ── Ashoka Chakra mini SVG for logo ────────────────────────────────
function ChakraLogo() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      className="drop-shadow-[0_0_8px_rgba(26,86,219,0.6)]"
      aria-hidden="true"
      focusable="false"
    >
      {/* Outer ring */}
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="none"
        stroke="#1a56db"
        strokeWidth="1.8"
      />
      <circle
        cx="18"
        cy="18"
        r="10"
        fill="none"
        stroke="#1a56db"
        strokeWidth="1"
      />
      <circle cx="18" cy="18" r="3" fill="#1a56db" />
      {/* 24 spokes */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        const rad = (angle * Math.PI) / 180;
        const x1 = 18 + 10 * Math.sin(rad);
        const y1 = 18 - 10 * Math.cos(rad);
        const x2 = 18 + 16 * Math.sin(rad);
        const y2 = 18 - 16 * Math.cos(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#1a56db"
            strokeWidth="1"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

// ── Dark mode toggle ────────────────────────────────────────────────
function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      // Whitelist: only accept known values to prevent stored-value injection
      if (saved === "dark" || saved === "light") return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  return (
    <button
      onClick={() => setDark((d) => !d)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="p-2 rounded-lg text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200"
    >
      <AnimatePresence mode="wait" initial={false}>
        {dark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={18} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={18} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ── Auth button (sign-in / avatar) ─────────────────────────────────
function AuthButton({ compact = false }) {
  const { user, loading, signInWithGoogle, logout } = useAuthContext();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = useCallback(async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      logger.warn("[Navbar] Google login error:", err);
    } finally {
      setSigningIn(false);
    }
  }, [signInWithGoogle]);

  if (loading)
    return (
      <div
        className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse"
        aria-label="Loading auth state"
      />
    );

  if (user) {
    const isAnon = user.isAnonymous;
    return (
      <div
        className={cn(
          "flex items-center gap-2",
          compact && "flex-row-reverse justify-end",
        )}
      >
        {/* Avatar */}
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? "User avatar"}
            className="w-8 h-8 rounded-full ring-2 ring-india-saffronfron object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-india-saffron to-india-green flex items-center justify-center text-white text-xs font-bold">
            {isAnon ? "?" : (user.displayName?.charAt(0) ?? "?")}
          </div>
        )}
        {!isAnon && !compact && (
          <span className="text-sm text-slate-700 dark:text-white/70 max-w-[100px] truncate">
            {user.displayName}
          </span>
        )}
        <button
          onClick={logout}
          aria-label="Sign out"
          className="p-1.5 rounded-lg text-slate-500 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={signingIn}
      className={cn(
        "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        "bg-india-saffron hover:bg-[#e8891f] text-white shadow-lg shadow-orange-900/30",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        compact && "w-full justify-center",
      )}
      aria-label="Sign in with Google"
    >
      {signingIn ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      {compact ? "Sign in with Google" : "Sign In"}
    </button>
  );
}

// ── Main Navbar ─────────────────────────────────────────────────────
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  const onScroll = useCallback(() => setScrolled(window.scrollY > 20), []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = useCallback(
    (to, exact) =>
      exact
        ? pathname === to
        : pathname === to || pathname.startsWith(to + "/"),
    [pathname],
  );

  const toggleMenu = useCallback(() => setOpen((o) => !o), []);

  return (
    <header
      role="banner"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "backdrop-blur-md bg-white/80 dark:bg-[#0f172a]/80 border-b border-slate-200 dark:border-white/10 py-3 shadow-lg shadow-slate-200/50 dark:shadow-black/20"
          : "py-5",
      )}
    >
      {/* Skip to content */}
      <a
        href="#main-content"
        className="absolute -top-full left-4 z-9999 px-4 py-2 bg-india-saffronfron text-white text-sm font-semibold rounded-br-xl focus:top-0 focus:outline-none transition-[top] duration-100"
      >
        Skip to main content
      </a>

      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* ── Logo ── */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group shrink-0"
          aria-label="ElectoIQ home"
        >
          <div className="group-hover:scale-105 transition-transform duration-200">
            <ChakraLogo />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight">
            <span className="text-slate-900 dark:text-white">Electo</span>
            <span className="text-gradient-india">IQ</span>
          </span>
        </Link>

        {/* ── Desktop links ── */}
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

        {/* ── Right side: dark toggle + auth ── */}
        <div className="hidden md:flex items-center gap-2">
          <DarkModeToggle />
          <div
            className="w-px h-5 bg-slate-200 dark:bg-white/15 mx-1"
            aria-hidden="true"
          />
          <AuthButton />
        </div>

        {/* ── Hamburger ── */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          onClick={toggleMenu}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X size={22} />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu size={22} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* ── Mobile drawer ── */}
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
    </header>
  );
}
