// src/pages/Glossary.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, X } from "lucide-react";
import { AnimatedPage } from "../components/shared/AnimatedPage";
import { PageWrapper } from "../components/layout/PageWrapper";
import { SectionHeader } from "../components/shared/SectionHeader";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { glossaryTerms, glossaryCategories } from "../data/glossaryTerms";
import { cn } from "../utils/helpers";
import { Skeleton } from "../components/ui/Skeleton";
import { logAnalyticsEvent } from "../services/firebase";

const categoryBadgeMap = {
  Institution: "primary",
  Regulation: "warning",
  Voter: "success",
  Technology: "accent",
  Legislature: "navy",
  Structure: "default",
  Candidate: "saffron",
  "Political Party": "green",
  Process: "primary",
  Finance: "warning",
  Campaign: "danger",
  Governance: "navy",
  Statistics: "success",
};

const GlossaryCard = React.memo(function GlossaryCard({
  term,
  idx,
  isOpen,
  onToggle,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
    >
      <Card
        hover
        aria-expanded={isOpen}
        className={cn("h-full cursor-pointer", isOpen && "border-blue-500/30")}
        onClick={() => onToggle(term)}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant={categoryBadgeMap[term.category] || "default"}>
            {term.category}
          </Badge>
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-snug mb-2">
          {term.term}
        </h3>
        <p
          className={cn(
            "text-sm text-slate-600 dark:text-white/60 leading-relaxed",
            !isOpen && "line-clamp-3",
          )}
        >
          {term.definition}
        </p>
        {term.example && isOpen && (
          <div className="mt-3 rounded-lg bg-slate-50 dark:bg-white/5 p-3 border border-slate-100 dark:border-white/5">
            <p className="text-xs text-slate-500 dark:text-white/40 uppercase font-semibold mb-1">
              Example
            </p>
            <p className="text-xs text-slate-700 dark:text-white/70 italic">
              {term.example}
            </p>
          </div>
        )}
        <p className="mt-2 text-xs text-blue-400" aria-hidden="true">
          {isOpen ? "▲ Show less" : "▼ Show more"}
        </p>
      </Card>
    </motion.div>
  );
});

const INITIAL_COUNT = 24;

export default function Glossary() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [loading, setLoading] = useState(true);

  const handleSearch = useCallback((e) => setSearch(e.target.value), []);
  const handleClear = useCallback(() => setSearch(""), []);
  const handleCategoryChange = useCallback((cat) => setCategory(cat), []);
  const handleExpand = useCallback((term) => {
    setExpanded((prev) => {
      const isExpanding = prev !== term.id;
      if (isExpanding) {
        logAnalyticsEvent("glossary_term_viewed", {
          term: term.term,
          category: term.category,
        });
      }
      return isExpanding ? term.id : null;
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // Reset pagination when filters change — intentional setState in effect
  // Reset pagination when filters change — intentional setState in effect
  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [debouncedSearch, category]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return glossaryTerms.filter((t) => {
      const matchCat = category === "All" || t.category === category;
      const matchSearch =
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [debouncedSearch, category]);

  const visibleTerms = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );
  const hasMore = visibleCount < filtered.length;

  return (
    <AnimatedPage>
      <PageWrapper>
        <SectionHeader
          eyebrow="Election Vocabulary"
          title="Glossary of Terms"
          description={`${glossaryTerms.length} election terms explained in plain language — from EPIC to VVPAT.`}
          center
        />

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40"
            />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search terms or definitions…"
              aria-label="Search election terms and definitions"
              className="w-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
            {search && (
              <button
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {glossaryCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                aria-pressed={category === cat}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                  category === cat
                    ? "bg-primary border-primary text-white"
                    : "border-slate-200 dark:border-white/15 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-slate-500 dark:text-white/40 text-sm text-center mb-8"
        >
          Showing{" "}
          <span className="text-slate-900 dark:text-white font-medium">
            {Math.min(visibleCount, filtered.length)}
          </span>{" "}
          of{" "}
          <span className="text-slate-900 dark:text-white font-medium">
            {filtered.length}
          </span>{" "}
          terms
        </p>

        {/* Terms */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="h-full">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-5 w-2/3 mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-4/5" />
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            role="status"
            className="text-center py-20 text-slate-500 dark:text-white/40"
          >
            <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
            <p>No terms found for &ldquo;{search}&rdquo;</p>
          </div>
        ) : (
          <>
            <motion.div
              layout
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {visibleTerms.map((term, idx) => (
                <GlossaryCard
                  key={term.id}
                  idx={idx}
                  term={term}
                  isOpen={expanded === term.id}
                  onToggle={handleExpand}
                />
              ))}
            </motion.div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setVisibleCount((c) => c + INITIAL_COUNT)}
                  aria-label={`Load more terms. Showing ${visibleCount} of ${filtered.length}`}
                  className="px-6 py-3 rounded-xl border border-slate-200 dark:border-white/15 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30 transition-all text-sm font-medium"
                >
                  Load more ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </PageWrapper>
    </AnimatedPage>
  );
}
