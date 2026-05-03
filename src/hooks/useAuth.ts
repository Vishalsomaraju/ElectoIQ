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
  User
} from 'firebase/auth'
import { auth, trackAnalyticsEvent } from '../services/firebase'

// -- Google Service: Firebase Authentication -------------------------------
// Minimal OAuth scopes -- only email + profile, no drive/calendar access
// Docs: https://firebase.google.com/docs/auth/web/google-signin
const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')
googleProvider.setCustomParameters({ prompt: 'select_account' })

export interface UseAuthResult {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signInAsGuest: () => Promise<User | undefined>
  logout: () => Promise<void>
}

/**
 * Custom hook to manage Firebase authentication state.
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    // Handle redirect result (Google Sign-In completes via redirect)
    getRedirectResult(auth).catch((err: Error) => {
      logger.warn('[useAuth] Redirect result error:', err.message)
    })

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = async (): Promise<void> => {
    if (!auth) { setError('Firebase not configured'); return }
    setError(null)
    try {
      trackAnalyticsEvent('auth_google_sign_in_started')
      await signInWithRedirect(auth, googleProvider)
    } catch (err: unknown) {
      logger.warn('[signInWithGoogle] error:', err)
      setError(err instanceof Error ? err.message : String(err))
      throw err
    }
  }

  const signInAsGuest = async (): Promise<User | undefined> => {
    if (!auth) { setError('Firebase not configured'); return undefined }
    setError(null)
    try {
      const result = await signInAnonymously(auth)
      trackAnalyticsEvent('auth_guest_sign_in', { provider: 'anonymous' })
      return result.user
    } catch (err: unknown) {
      logger.warn('[signInAsGuest] error:', err)
      setError(err instanceof Error ? err.message : String(err))
      throw err
    }
  }

  const logout = async (): Promise<void> => {
    if (!auth) return
    setError(null)
    try {
      await signOut(auth)
      trackAnalyticsEvent('auth_sign_out')
    } catch (err: unknown) {
      logger.warn('[logout] error:', err)
      setError(err instanceof Error ? err.message : String(err))
      throw err
    }
  }

  return { user, loading, error, signInWithGoogle, signInAsGuest, logout }
}
