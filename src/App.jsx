// src/App.jsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Spinner } from './components/ui/Spinner'
import { ChatDrawer } from './components/shared/ChatDrawer'
import { FloatingChat } from './components/shared/FloatingChat'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { RouteChangeAnnouncer } from './components/shared/RouteChangeAnnouncer'
import { RouteStateSync } from './components/shared/RouteStateSync'

// ---------------------------------------------------------------------------
// Lazy-loaded page modules
// Each page is its own chunk so users only download what they navigate to.
// ---------------------------------------------------------------------------

const Home        = lazy(() => import('./pages/Home'))
const Timeline    = lazy(() => import('./pages/Timeline'))
const VoterJourney = lazy(() => import('./pages/VoterJourney'))
const Quiz        = lazy(() => import('./pages/Quiz'))
const Glossary    = lazy(() => import('./pages/Glossary'))
const Dashboard   = lazy(() => import('./pages/Dashboard'))
const NotFound    = lazy(() => import('./pages/NotFound'))

// ---------------------------------------------------------------------------
// Route tree
// ---------------------------------------------------------------------------

/** Full-viewport spinner shown while a lazy page chunk is loading. */
const PageLoadingFallback = (
  <div className="flex h-[80vh] items-center justify-center">
    <Spinner size="lg" />
  </div>
)

/**
 * AnimatedRoutes — wraps all route definitions in AnimatePresence so that
 * page transitions animate in and out when the pathname changes.
 *
 * Must be rendered inside `<BrowserRouter>` so `useLocation` works.
 */
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <>
      <AnimatePresence mode="wait">
        <Suspense fallback={PageLoadingFallback}>
          <Routes location={location} key={location.pathname}>
            <Route path="/"             element={<Home />} />
            <Route path="/timeline"     element={<Timeline />} />
            <Route path="/voter-journey" element={<VoterJourney />} />
            <Route path="/quiz"         element={<Quiz />} />
            <Route path="/glossary"     element={<Glossary />} />
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="*"             element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  )
}

// ---------------------------------------------------------------------------
// Root application component
// ---------------------------------------------------------------------------

/**
 * App — root component. Wraps the entire tree in:
 * - `ErrorBoundary` — catches unhandled render errors
 * - `BrowserRouter` — enables client-side routing
 * - `RouteChangeAnnouncer` — announces navigation to screen readers
 * - `AuthProvider` — Firebase auth state
 * - `AppProvider` — global app state (quiz progress, chat, etc.)
 * - `RouteStateSync` — syncs the current page name into AppContext
 */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RouteChangeAnnouncer />
        <AuthProvider>
          <AppProvider>
            <RouteStateSync />
            <div className="min-h-screen flex flex-col">
              {/* Skip-to-content link for keyboard / screen reader users */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-blue-600"
              >
                Skip to main content
              </a>

              <Navbar />

              <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                <AnimatedRoutes />
              </main>

              <Footer />
              <FloatingChat />
              <ChatDrawer />
            </div>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
