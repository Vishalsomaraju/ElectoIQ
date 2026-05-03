// src/test/logger.test.js
// Tests for the environment-aware logger utility
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('logger', () => {
  let warnSpy, errorSpy, infoSpy

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    // Reset module cache so DEV flag is re-evaluated each describe block
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('in development mode (import.meta.env.DEV = true)', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', true)
    })

    it("logger.warn calls console['warn']", async () => {
      const { logger } = await import('../utils/logger')
      logger.warn('test warning', 42)
      expect(warnSpy).toHaveBeenCalledWith('test warning', 42)
    })

    it("logger.error calls console['error']", async () => {
      const { logger } = await import('../utils/logger')
      logger.error('test error')
      expect(errorSpy).toHaveBeenCalledWith('test error')
    })

    it('logger.info calls console.info', async () => {
      const { logger } = await import('../utils/logger')
      logger.info('test info')
      expect(infoSpy).toHaveBeenCalledWith('test info')
    })
  })

  describe('in production mode (import.meta.env.DEV = false)', () => {
    beforeEach(() => {
      vi.stubEnv('DEV', false)
    })

    it('logger.warn is silent', async () => {
      const { logger } = await import('../utils/logger')
      logger.warn('should be silent')
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('logger.error is silent', async () => {
      const { logger } = await import('../utils/logger')
      logger.error('should be silent')
      expect(errorSpy).not.toHaveBeenCalled()
    })

    it('logger.info is silent', async () => {
      const { logger } = await import('../utils/logger')
      logger.info('should be silent')
      expect(infoSpy).not.toHaveBeenCalled()
    })
  })
})
