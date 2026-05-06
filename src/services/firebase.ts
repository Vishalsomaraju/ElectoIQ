/**
 * @file firebase.ts
 * @description Firebase service initialisation for ElectoIQ.
 *
 * Sets up Firebase Auth, Firestore (with offline persistence), App Check
 * (reCAPTCHA v3), Performance Monitoring, and Analytics in a single module.
 *
 * All service references are module-level `let` variables so the Firebase SDK
 * singleton pattern is preserved — Firebase must not be initialised more than
 * once per page load.
 *
 * SDK: firebase ^12.12.1
 * Docs: https://firebase.google.com/docs
 */

import { initializeApp, FirebaseApp } from 'firebase/app'
import { logger } from '../utils/logger'
import { sanitizeInput } from '../utils/helpers'
import { getAuth, Auth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from 'firebase/firestore'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getPerformance, FirebasePerformance } from 'firebase/performance'
import { getAnalytics, logEvent, Analytics } from 'firebase/analytics'

// ---------------------------------------------------------------------------
// Environment checks
// ---------------------------------------------------------------------------

/**
 * `true` when all required Firebase environment variables are present and
 * non-placeholder. When `false`, all Firebase features silently no-op.
 */
const FIREBASE_CONFIGURED =
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_API_KEY !== 'UNCONFIGURED_API_KEY'

const RECAPTCHA_CONFIGURED =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY &&
  import.meta.env.VITE_RECAPTCHA_SITE_KEY !== 'UNCONFIGURED_RECAPTCHA_KEY'

// ---------------------------------------------------------------------------
// Service singletons
// NOTE: These are module-level `let` by design — Firebase requires exactly
// one initialisation per app instance. Callers use the getter functions below
// instead of importing these directly, so the nullability is contained here.
// ---------------------------------------------------------------------------

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let perf: FirebasePerformance | null = null
let analytics: Analytics | null = null

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

/**
 * Assembles the Firebase config object from environment variables.
 * Separated from `initializeApp` so the config can be inspected or mocked
 * in tests without touching the Firebase SDK.
 */
function buildFirebaseConfig() {
  return {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  }
}

if (FIREBASE_CONFIGURED) {
  try {
    app  = initializeApp(buildFirebaseConfig())
    auth = getAuth(app)
    db   = initializeFirestore(app, {
      // Enable offline persistence so the app works without a network connection.
      // `persistentMultipleTabManager` coordinates cache access across browser tabs.
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })

    // App Check (reCAPTCHA v3) — protects Firestore and other backend resources
    if (RECAPTCHA_CONFIGURED) {
      try {
        initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
          isTokenAutoRefreshEnabled: true,
        })
      } catch (_appCheckError) {
        logger.warn('[ElectoIQ] App Check init failed:', _appCheckError instanceof Error
          ? _appCheckError.message
          : String(_appCheckError))
      }
    }

    // Performance Monitoring (non-critical — failure does not block the app)
    try {
      perf = getPerformance(app)
    } catch (_perfError) {
      logger.warn('[ElectoIQ] Performance monitoring unavailable:', _perfError instanceof Error
        ? _perfError.message
        : _perfError)
    }

    // Analytics (non-critical — failure does not block the app)
    try {
      analytics = getAnalytics(app)
      logEvent(analytics, 'app_open', { platform: 'web' })
    } catch (_analyticsError) {
      logger.warn('[ElectoIQ] Analytics unavailable:', _analyticsError instanceof Error
        ? _analyticsError.message
        : _analyticsError)
    }
  } catch (err) {
    // Redact any API key fragments that may appear in Firebase error messages
    const message = err instanceof Error
      ? err.message.replace(/key=[^&\s]*/g, 'key=REDACTED')
      : 'Firebase init failed'
    logger.warn('[ElectoIQ] Firebase init failed:', message)
  }
}

// ---------------------------------------------------------------------------
// Analytics helpers
// ---------------------------------------------------------------------------

/**
 * Strip dangerous or oversized values from an analytics params object.
 * Keys are restricted to alphanumeric + underscore (max 40 chars).
 * String values are sanitised and truncated to 100 chars.
 *
 * @param {Record<string, unknown>} params - Raw event parameters
 * @returns {Record<string, string | number | boolean>} Sanitised parameters
 */
function sanitizeAnalyticsParams(
  params: Record<string, unknown> = {}
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).flatMap(([key, value]): Array<[string, string | number | boolean]> => {
      if (!key || value == null) return []

      const safeKey = String(key).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 40)
      if (!safeKey) return []

      if (typeof value === 'string') {
        return [[safeKey, sanitizeInput(value).slice(0, 100)]]
      }
      if (typeof value === 'number' || typeof value === 'boolean') {
        return [[safeKey, value]]
      }
      // Fallback: serialise complex objects as a truncated JSON string
      return [[safeKey, sanitizeInput(JSON.stringify(value)).slice(0, 100)]]
    })
  )
}

/**
 * Fire a Firebase Analytics event with sanitised parameters.
 * Safe to call when Analytics is unavailable — returns `false` and no-ops.
 *
 * @param {string} eventName - Analytics event name (max 40 alphanumeric/underscore chars)
 * @param {Record<string, unknown>} [params={}] - Optional event parameters
 * @returns {boolean} `true` if the event was fired successfully
 */
export function trackAnalyticsEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): boolean {
  if (!analytics) return false

  const safeEventName = String(eventName).replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 40)
  if (!safeEventName) return false

  try {
    logEvent(analytics, safeEventName, sanitizeAnalyticsParams(params))
    return true
  } catch (error) {
    logger.warn('[ElectoIQ] Analytics event failed:',
      error instanceof Error ? error.message : error)
    return false
  }
}

/**
 * Fire a Firebase Analytics event with raw (unsanitised) parameters.
 * Prefer `trackAnalyticsEvent` for user-facing data. This function is
 * intended for internal, trusted event parameters only.
 *
 * @param {string} eventName - Analytics event name
 * @param {Record<string, unknown>} [params={}] - Raw event parameters
 */
export function logAnalyticsEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): void {
  if (!analytics) return
  try {
    logEvent(analytics, eventName, params)
  } catch (err) {
    logger.warn('[Analytics] logEvent failed:', err instanceof Error ? err.message : err)
  }
}

// ---------------------------------------------------------------------------
// Getters — preferred over importing the raw `let` variables directly
// ---------------------------------------------------------------------------

/** @returns {Auth | null} Firebase Auth instance, or `null` if not initialised */
export function getFirebaseAuth(): Auth | null { return auth }

/** @returns {Firestore | null} Firestore instance, or `null` if not initialised */
export function getFirebaseDb(): Firestore | null { return db }

/** @returns {FirebasePerformance | null} Performance instance, or `null` if not initialised */
export function getFirebasePerformance(): FirebasePerformance | null { return perf }

/** @returns {boolean} `true` if Firebase was successfully initialised */
export function isFirebaseReady(): boolean { return !!app }

// Direct exports for backwards compatibility with existing imports
export { app, auth, db, perf, analytics }
