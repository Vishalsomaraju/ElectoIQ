// src/pages/Glossary.jsx
import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { AnimatedPage } from '../components/shared/AnimatedPage'
import { PageWrapper } from '../components/layout/PageWrapper'
import { SectionHeader } from '../components/shared/SectionHeader'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { glossaryTerms } from '../data/glossaryTerms'
import { logAnalyticsEvent } from '../services/firebase'
import { GlossaryTermCard } from '../components/glossary/GlossaryTermCard'
import { GlossarySearch } from '../components/glossary/GlossarySearch'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of terms shown per page (initial load + each "Load more" click). */
const PAGE_SIZE = 24

/** Debounce delay for the search input. Prevents a Firestore/filter call on
 *  every keystroke — 200 ms is short enough to feel instant. */
const SEARCH_DEBOUNCE_MS = 200

/** Simulated loading delay before the glossary grid appears.
 *  Gives the page skeleton a moment to render and avoids a layout flash. */
const LOAD_SIMULATION_MS = 800

/** Number of skeleton placeholder cards to show during loading. */
const SKELETON_CARD_COUNT = 9

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function Glossary() {
  // Search / filter state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('All')

  // UI state
  const [expandedTermId, setExpandedTermId] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(true)

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  const handleSearch = useCallback((e) => setSearch(e.target.value), [])
  const handleClear  = useCallback(() => setSearch(''), [])
  const handleCategoryChange = useCallback((cat) => setCategory(cat), [])

  const handleExpand = useCallback((term) => {
    setExpandedTermId((previousId) => {
      const isExpanding = previousId !== term.id
      if (isExpanding) {
        logAnalyticsEvent('glossary_term_viewed', {
          term:     term.term,
          category: term.category,
        })
      }
      return isExpanding ? term.id : null
    })
  }, [])

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Debounce the search input so filtering only runs once the user pauses typing
  useEffect(() => {
    const debounceTimer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(debounceTimer)
  }, [search])

  // Simulate an initial load state so the skeleton renders before the grid appears
  useEffect(() => {
    const simulatedLoadTimer = setTimeout(() => setIsLoading(false), LOAD_SIMULATION_MS)
    return () => clearTimeout(simulatedLoadTimer)
  }, [])

  // Reset pagination whenever the filter changes to avoid showing page 2 of
  // results for a different query
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [debouncedSearch, category])

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const filteredTerms = useMemo(() => {
    const searchQuery = debouncedSearch.toLowerCase()
    return glossaryTerms.filter((term) => {
      const matchesCategory = category === 'All' || term.category === category
      const matchesSearch =
        !searchQuery ||
        term.term.toLowerCase().includes(searchQuery) ||
        term.definition.toLowerCase().includes(searchQuery)
      return matchesCategory && matchesSearch
    })
  }, [debouncedSearch, category])

  const visibleTerms = useMemo(
    () => filteredTerms.slice(0, visibleCount),
    [filteredTerms, visibleCount]
  )

  const hasMoreTerms = visibleCount < filteredTerms.length
  const remainingCount = filteredTerms.length - visibleCount

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <AnimatedPage>
      <PageWrapper>
        <SectionHeader
          eyebrow="Election Vocabulary"
          title="Glossary of Terms"
          description={`${glossaryTerms.length} election terms explained in plain language — from EPIC to VVPAT.`}
          center
        />

        <GlossarySearch
          search={search}
          category={category}
          onSearch={handleSearch}
          onClear={handleClear}
          onCategoryChange={handleCategoryChange}
        />

        {/* Live result count for assistive technology */}
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-slate-500 dark:text-white/40 text-sm text-center mb-8"
        >
          Showing{' '}
          <span className="text-slate-900 dark:text-white font-medium">
            {Math.min(visibleCount, filteredTerms.length)}
          </span>{' '}
          of{' '}
          <span className="text-slate-900 dark:text-white font-medium">
            {filteredTerms.length}
          </span>{' '}
          terms
        </p>

        {/* ── Loading skeleton ──────────────────────────────────────── */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
              <Card key={index} className="h-full">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-5 w-2/3 mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-4/5" />
              </Card>
            ))}
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────────── */}
        {!isLoading && filteredTerms.length === 0 && (
          <div role="status" className="text-center py-20 text-slate-500 dark:text-white/40">
            <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
            <p>No terms found for &ldquo;{search}&rdquo;</p>
          </div>
        )}

        {/* ── Term grid with pagination ──────────────────────────────── */}
        {!isLoading && filteredTerms.length > 0 && (
          <>
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleTerms.map((term, idx) => (
                <GlossaryTermCard
                  key={term.id}
                  idx={idx}
                  term={term}
                  isOpen={expandedTermId === term.id}
                  onToggle={handleExpand}
                />
              ))}
            </motion.div>

            {hasMoreTerms && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  aria-label={`Load more terms. Showing ${visibleCount} of ${filteredTerms.length}`}
                  className="px-6 py-3 rounded-xl border border-slate-200 dark:border-white/15 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30 transition-all text-sm font-medium"
                >
                  Load more ({remainingCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </PageWrapper>
    </AnimatedPage>
  )
}
