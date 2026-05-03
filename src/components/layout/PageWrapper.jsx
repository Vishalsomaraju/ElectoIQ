// src/components/layout/PageWrapper.jsx
import { cn } from '../../utils/helpers'

export function PageWrapper({ children, className, wide = false }) {
  return (
    <div className={cn('pt-24 pb-16 min-h-screen', className)}>
      <div className={cn('mx-auto px-4 sm:px-6', wide ? 'max-w-7xl' : 'max-w-6xl')}>
        {children}
      </div>
    </div>
  )
}
