import { Search, X } from 'lucide-react'
import { glossaryCategories } from '../../data/glossaryTerms'
import { cn } from '../../utils/helpers'

export function GlossarySearch({
  search,
  category,
  onSearch,
  onClear,
  onCategoryChange,
}) {
  return (
    <div className="mb-8 space-y-4">
      <div className="relative max-w-md mx-auto">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40"
        />
        <input
          value={search}
          onChange={onSearch}
          placeholder="Search terms or definitions…"
          aria-label="Search election terms and definitions"
          className="w-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
        />
        {search && (
          <button
            onClick={onClear}
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
            onClick={() => onCategoryChange(cat)}
            aria-pressed={category === cat}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
              category === cat
                ? 'bg-primary border-primary text-white'
                : 'border-slate-200 dark:border-white/15 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30',
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
