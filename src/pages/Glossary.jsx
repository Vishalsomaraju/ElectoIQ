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

const INITIAL_COUNT = 24

export default function Glossary() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [expanded, setExpanded] = useState(null)
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)
  const [loading, setLoading] = useState(true)

  const handleSearch = useCallback((e) => setSearch(e.target.value), [])
  const handleClear = useCallback(() => setSearch(''), [])
  const handleCategoryChange = useCallback((cat) => setCategory(cat), [])
  const handleExpand = useCallback((term) => {
    setExpanded((prev) => {
      const isExpanding = prev !== term.id
      if (isExpanding) {
        logAnalyticsEvent('glossary_term_viewed', { term: term.term, category: term.category })
      }
      return isExpanding ? term.id : null
    })
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setVisibleCount(INITIAL_COUNT)
  }, [debouncedSearch, category])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    return glossaryTerms.filter((t) => {
      const matchCat = category === 'All' || t.category === category
      const matchSearch = !q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [debouncedSearch, category])

  const visibleTerms = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])
  const hasMore = visibleCount < filtered.length

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

        <p role="status" aria-live="polite" aria-atomic="true"
          className="text-slate-500 dark:text-white/40 text-sm text-center mb-8">
          Showing{' '}
          <span className="text-slate-900 dark:text-white font-medium">
            {Math.min(visibleCount, filtered.length)}
          </span>{' '}
          of{' '}
          <span className="text-slate-900 dark:text-white font-medium">
            {filtered.length}
          </span>{' '}
          terms
        </p>

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
          <div role="status" className="text-center py-20 text-slate-500 dark:text-white/40">
            <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
            <p>No terms found for &ldquo;{search}&rdquo;</p>
          </div>
        ) : (
          <>
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleTerms.map((term, idx) => (
                <GlossaryTermCard
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
  )
}
