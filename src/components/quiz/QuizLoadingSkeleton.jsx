import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

export function QuizLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-2 w-full" />
      </div>
      <Card className="mb-6 space-y-4">
        <Skeleton className="h-6 w-1/5" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-4/5" />
      </Card>
      <div className="space-y-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  )
}
