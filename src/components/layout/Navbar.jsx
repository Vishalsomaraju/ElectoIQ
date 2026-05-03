// src/components/layout/Navbar.jsx
import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '../../utils/helpers'

import { ChakraLogo } from "./ChakraLogo";
import { DarkModeToggle } from "./DarkModeToggle";
import { AuthButton } from "./AuthButton";

import { NavbarDesktopLinks } from "./NavbarDesktopLinks";
import { NavbarMobileMenu } from "./NavbarMobileMenu";

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
        <NavbarDesktopLinks isActive={isActive} />

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
      <NavbarMobileMenu open={open} isActive={isActive} />
    </header>
  );
}
