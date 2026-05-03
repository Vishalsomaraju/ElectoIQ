/**
 * Environment-aware logger. Silent in production builds.
 * Use instead of console['warn']/error throughout the app.
 */
const isDev = import.meta.env.DEV

export const logger: {
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
} = {
  warn: (...args) => { if (isDev) console['warn'](...args) },
  error: (...args) => { if (isDev) console['error'](...args) },
  info: (...args) => { if (isDev) console.info(...args) },
}
