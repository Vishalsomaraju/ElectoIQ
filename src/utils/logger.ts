/**
 * @file logger.ts
 * @description Environment-aware logger that is completely silent in production builds.
 *
 * Use this instead of raw `console.warn` / `console.error` throughout the app
 * so that debug output is never leaked to end users in production.
 *
 * @example
 *   logger.warn('[MyHook] Something unexpected happened:', error)
 *   logger.info('[Firebase] Initialised successfully')
 */

const isDev = import.meta.env.DEV

export const logger: {
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
} = {
  warn:  (...args) => { if (isDev) console.warn(...args) },
  error: (...args) => { if (isDev) console.error(...args) },
  info:  (...args) => { if (isDev) console.info(...args) },
}
