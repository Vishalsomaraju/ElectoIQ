// src/utils/helpers.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import DOMPurify from 'dompurify'

/**
 * Merge Tailwind classes safely.
 * @param {...ClassValue} inputs - Tailwind class strings or conditionals
 * @returns {string} Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize user input before sending to external APIs or database.
 * Uses DOMPurify as primary sanitizer with regex strips as defense-in-depth.
 * @param {string} raw - Raw user input
 * @returns {string} Sanitized safe string
 */
export function sanitizeInput(raw: string | null | undefined): string {
  if (!raw) return ''
  const purified = typeof window !== 'undefined'
    ? DOMPurify.sanitize(raw, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    : raw
  return purified
    .replace(/\{[^}]*\}/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, 500)
}

/**
 * Format a date string to Indian locale.
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

/**
 * Capitalize first letter of a string.
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
export function capitalize(str: string | null | undefined): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Calculate quiz score as percentage.
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total number of questions
 * @returns {number} Rounded percentage score
 */
export function calcScore(correct: number, total: number): number {
  if (!total) return 0
  return Math.round((correct / total) * 100)
}

/**
 * Get grade label based on score percentage.
 * @param {number} score - Score percentage (0-100)
 * @returns {{ label: string, color: string, emoji: string }} Grade object
 */
export function getGrade(score: number): { label: string; color: string; emoji: string } {
  if (score >= 90) return { label: 'Expert Voter', color: 'text-green-400', emoji: '🏆' }
  if (score >= 70) return { label: 'Informed Voter', color: 'text-blue-400', emoji: '🎓' }
  if (score >= 50) return { label: 'Aware Citizen', color: 'text-yellow-400', emoji: '📚' }
  return { label: 'Keep Learning', color: 'text-red-400', emoji: '💪' }
}

/**
 * Shuffle an array using Fisher-Yates algorithm.
 * @param {Array} array - Input array
 * @returns {Array} New shuffled array
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Truncate text to a max length with ellipsis.
 * @param {string} text - Input text
 * @param {number} [maxLen=120] - Maximum character length
 * @returns {string} Truncated text
 */
export function truncate(text: string | null | undefined, maxLen = 120): string {
  if (!text) return ''
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}

/**
 * Debounce a function call.
 * @param {Function} fn - Function to debounce
 * @param {number} [delay=300] - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay = 300): T {
  let timeout: ReturnType<typeof setTimeout>
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }) as T
}
