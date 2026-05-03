import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// ─── Hoisted mocks (evaluated before any imports) ────────────────────────────

// Mutable firebase service mock — we mutate .auth to test both configured/null states
const firebaseMock = vi.hoisted(() => ({
  auth: { currentUser: null },
  trackAnalyticsEvent: vi.fn(),
}))

vi.mock('../services/firebase', () => firebaseMock)

vi.mock('firebase/auth', () => ({
  signInWithRedirect: vi.fn(),
  signInAnonymously: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  getRedirectResult: vi.fn(() => Promise.resolve()),
  GoogleAuthProvider: class {
    addScope() {}
    setCustomParameters() {}
  },
}))

vi.mock('../utils/logger', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import {
  signInWithRedirect,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  getRedirectResult,
} from 'firebase/auth'
import { logger } from '../utils/logger'
import { useAuth } from '../hooks/useAuth'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setAuth(value) {
  firebaseMock.auth = value
}

// ═══════════════════════════════════════════════════════════════════════════
// Auth configured
// ═══════════════════════════════════════════════════════════════════════════
describe('useAuth hook — auth configured', () => {
  beforeEach(() => {
    setAuth({ currentUser: null })
    vi.clearAllMocks()
    // Default: listener immediately resolves with null user
    onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null)
      return vi.fn()
    })
  })

  it('initializes with loading true, then resolves user via listener', () => {
    const mockUnsubscribe = vi.fn()
    onAuthStateChanged.mockImplementation((_auth, _cb) => {
      // Don't call callback immediately → loading stays true
      return mockUnsubscribe
    })

    const { result, unmount } = renderHook(() => useAuth())

    expect(onAuthStateChanged).toHaveBeenCalled()
    expect(result.current.loading).toBe(true)

    act(() => {
      const cb = onAuthStateChanged.mock.calls[0][1]
      cb({ uid: 'user123' })
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.user).toEqual({ uid: 'user123' })

    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('handles Google sign in successfully', async () => {
    signInWithRedirect.mockResolvedValueOnce()
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(signInWithRedirect).toHaveBeenCalled()
    expect(result.current.error).toBeNull()
  })

  it('handles Google sign in error', async () => {
    const error = new Error('Redirect failed')
    signInWithRedirect.mockRejectedValueOnce(error)
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      try { await result.current.signInWithGoogle() } catch (_) {}
    })

    expect(result.current.error).toBe('Redirect failed')
  })

  it('handles guest sign in successfully', async () => {
    signInAnonymously.mockResolvedValueOnce({ user: { uid: 'guest123' } })
    const { result } = renderHook(() => useAuth())

    let user
    await act(async () => {
      user = await result.current.signInAsGuest()
    })

    expect(signInAnonymously).toHaveBeenCalled()
    expect(user).toEqual({ uid: 'guest123' })
    expect(result.current.error).toBeNull()
  })

  it('handles guest sign in error', async () => {
    const error = new Error('Guest sign in failed')
    signInAnonymously.mockRejectedValueOnce(error)
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      try { await result.current.signInAsGuest() } catch (_) {}
    })

    expect(result.current.error).toBe('Guest sign in failed')
  })

  it('handles logout successfully', async () => {
    signOut.mockResolvedValueOnce()
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.logout()
    })

    expect(signOut).toHaveBeenCalled()
    expect(result.current.error).toBeNull()
  })

  it('handles logout error', async () => {
    const error = new Error('Logout failed')
    signOut.mockRejectedValueOnce(error)
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      try { await result.current.logout() } catch (_) {}
    })

    expect(result.current.error).toBe('Logout failed')
  })

  it('logs redirect result errors via logger.warn', async () => {
    const error = new Error('Redirect result error')
    getRedirectResult.mockRejectedValueOnce(error)

    renderHook(() => useAuth())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(logger.warn).toHaveBeenCalledWith(
      '[useAuth] Redirect result error:',
      'Redirect result error',
    )
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Auth NOT configured (auth === null)
// ═══════════════════════════════════════════════════════════════════════════
describe('useAuth hook — auth not configured (null)', () => {
  beforeEach(() => {
    setAuth(null)
    vi.clearAllMocks()
  })

  it('sets loading to false immediately when auth is null', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(false)
  })

  it('sets error to "Firebase not configured" on Google sign in', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.signInWithGoogle()
    })

    expect(result.current.error).toBe('Firebase not configured')
    expect(signInWithRedirect).not.toHaveBeenCalled()
  })

  it('sets error to "Firebase not configured" on guest sign in', async () => {
    const { result } = renderHook(() => useAuth())

    let user
    await act(async () => {
      user = await result.current.signInAsGuest()
    })

    expect(result.current.error).toBe('Firebase not configured')
    expect(user).toBeUndefined()
    expect(signInAnonymously).not.toHaveBeenCalled()
  })

  it('returns early from logout without error when auth is null', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.error).toBeNull()
    expect(signOut).not.toHaveBeenCalled()
  })
})
