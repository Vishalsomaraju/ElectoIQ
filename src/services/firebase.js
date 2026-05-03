// ─── Google Service: Firebase (Auth + Firestore) ─────────────────────────
// Purpose: Auth (Google OAuth + Anonymous) and real-time Firestore data
// SDK: firebase ^12.12.1
// Docs: https://firebase.google.com/docs
// src/services/firebase.js

import { initializeApp } from 'firebase/app'
import { logger } from '../utils/logger'
import { sanitizeInput } from '../utils/helpers'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getPerformance } from 'firebase/performance'
import { getAnalytics, logEvent } from 'firebase/analytics'

const FIREBASE_CONFIGURED =
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_API_KEY !== 'your_firebase_api_key'

let app = null
let auth = null
let db = null
let perf = null
let analytics = null

if (FIREBASE_CONFIGURED) {
  try {
    app = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    })
    auth = getAuth(app)
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    })

    if (import.meta.env.VITE_RECAPTCHA_SITE_KEY && import.meta.env.VITE_RECAPTCHA_SITE_KEY !== 'your_recaptcha_key') {
      try {
        initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
          isTokenAutoRefreshEnabled: true
        })
      } catch (err) {
        logger.warn('[ElectoIQ] App Check init failed:', err.message)
      }
    }

    try { perf = getPerformance(app) } catch (_e) {
      logger.warn('[ElectoIQ] Performance unavailable:', _e.message)
    }
    try {
      analytics = getAnalytics(app)
      logEvent(analytics, 'app_open', { platform: 'web' })
    } catch (_e) {
      logger.warn('[ElectoIQ] Analytics unavailable:', _e.message)
    }
  } catch (err) {
    const msg = err instanceof Error
      ? err.message.replace(/key=[^&\s]*/g, 'key=REDACTED')
      : 'Firebase init failed'
    logger.warn('[ElectoIQ] Firebase init failed:', msg)
  }
}

function sanitizeAnalyticsParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).flatMap(([key, value]) => {
      if (!key || value == null) return []
      const safeKey = String(key).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 40)
      if (!safeKey) return []

      if (typeof value === 'string') {
        return [[safeKey, sanitizeInput(value).slice(0, 100)]]
      }
      if (typeof value === 'number' || typeof value === 'boolean') {
        return [[safeKey, value]]
      }
      return [[safeKey, sanitizeInput(JSON.stringify(value)).slice(0, 100)]]
    })
  )
}

export function trackAnalyticsEvent(eventName, params = {}) {
  if (!analytics) return false
  const safeEventName = String(eventName).replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 40)
  if (!safeEventName) return false

  try {
    logEvent(analytics, safeEventName, sanitizeAnalyticsParams(params))
    return true
  } catch (error) {
    logger.warn('[ElectoIQ] Analytics event failed:', error instanceof Error ? error.message : error)
    return false
  }
}

/**
 * Log a Firebase Analytics event safely.
 * @param {string} eventName - Analytics event name
 * @param {Object} [params] - Event parameters
 */
export function logAnalyticsEvent(eventName, params = {}) {
  if (!analytics) return
  try {
    logEvent(analytics, eventName, params)
  } catch (err) {
    logger.warn('[Analytics] logEvent failed:', err.message)
  }
}

export function getFirebaseAuth() { return auth }
export function getFirebaseDb() { return db }
export function getFirebasePerformance() { return perf }
export function isFirebaseReady() { return !!app }

export { app, auth, db, perf, analytics }
