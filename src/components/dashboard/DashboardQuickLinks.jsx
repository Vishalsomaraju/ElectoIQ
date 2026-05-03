import { Link } from 'react-router-dom'
import { Card, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'

export function DashboardQuickLinks() {
  return (
    <Card>
      <CardTitle className="mb-4">Continue Learning</CardTitle>
      <div className="flex flex-wrap gap-3">
        <Link to="/timeline">
          <Button variant="outline" size="sm">📅 Timeline</Button>
        </Link>
        <Link to="/voter-journey">
          <Button variant="outline" size="sm">🗺️ Voter Journey</Button>
        </Link>
        <Link to="/quiz">
          <Button size="sm">🧠 Take Quiz</Button>
        </Link>
        <Link to="/glossary">
          <Button variant="outline" size="sm">📖 Glossary</Button>
        </Link>
      </div>
    </Card>
  )
}
