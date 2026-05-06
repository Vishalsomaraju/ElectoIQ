// src/hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { logger } from '../utils/logger'
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  User,
} from 'firebase/auth'
import { auth, trackAnalyticsEvent } from '../services/firebase'

// ---------------------------------------------------------------------------
// Google OAuth provider configuration
// Minimal scopes — email + profile only. No drive/calendar access requested.
// Docs: https://firebase.google.com/docs/auth/web/google-signin
// ---------------------------------------------------------------------------

const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')
googleProvider.setCustomParameters({ prompt: 'select_account' })

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseAuthResult {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signInAsGuest: () => Promise<User | undefined>
  logout: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

/**
 * Returns `true` when Firebase Auth is not initialised (i.e. the app is
 * running without Firebase credentials). Callers should set an error message
 * and return early when this is `true`.
 */
function isFirebaseAuthMissing(): boolean {
  return !auth
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages Firebase authentication state, exposing Google OAuth,
 * anonymous guest sign-in, and sign-out actions.
 *
 * @returns {UseAuthResult} Authentication state and action methods
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isFirebaseAuthMissing()) {
      setLoading(false)
      return
    }

    // Handle any pending Google redirect result from a previous tab session.
    // Errors here are non-fatal — the user simply stays signed out.
    getRedirectResult(auth!).catch((err: Error) => {
      logger.warn('[useAuth] Google redirect result error:', err.message)
    })

    const unsubscribe = onAuthStateChanged(auth!, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /**
   * Initiate Google OAuth sign-in via redirect.
   * The result is handled on the next page load via `getRedirectResult`.
   */
  const signInWithGoogle = async (): Promise<void> => {
    if (isFirebaseAuthMissing()) {
      setError('Firebase not configured')
      return
    }

    setError(null)
    try {
      trackAnalyticsEvent('auth_google_sign_in_started')
      await signInWithRedirect(auth!, googleProvider)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      logger.warn('[signInWithGoogle] error:', message)
      setError(message)
      throw err
    }
  }

  /**
   * Sign in as an anonymous guest.
   * Useful for users who want to explore without creating an account.
   *
   * @returns {Promise<User | undefined>} The anonymous Firebase user, or undefined on failure
   */
  const signInAsGuest = async (): Promise<User | undefined> => {
    if (isFirebaseAuthMissing()) {
      setError('Firebase not configured')
      return undefined
    }

    setError(null)
    try {
      const result = await signInAnonymously(auth!)
      trackAnalyticsEvent('auth_guest_sign_in', { provider: 'anonymous' })
      return result.user
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      logger.warn('[signInAsGuest] error:', message)
      setError(message)
      throw err
    }
  }

  /**
   * Sign out the currently authenticated user.
   */
  const logout = async (): Promise<void> => {
    if (isFirebaseAuthMissing()) return

    setError(null)
    try {
      await signOut(auth!)
      trackAnalyticsEvent('auth_sign_out')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      logger.warn('[logout] error:', message)
      setError(message)
      throw err
    }
  }

  return { user, loading, error, signInWithGoogle, signInAsGuest, logout }
}
