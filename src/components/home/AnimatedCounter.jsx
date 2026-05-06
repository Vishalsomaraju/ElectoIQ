import { useRef, useEffect, useState } from 'react'
import { useInView, useMotionValue, useSpring, useMotionValueEvent } from 'framer-motion'

/**
 * AnimatedCounter — smoothly animates a numeric value from 0 to `to` when it
 * scrolls into view. Uses a spring physics model for a natural feel.
 *
 * The element is aria-hidden because a visually animated counter is not useful
 * to screen readers — provide a separate accessible label at the call site.
 *
 * @param {object} props
 * @param {number} props.to       - Target number to count up to
 * @param {string} [props.suffix] - Optional suffix appended after the number (e.g. "%", "+")
 * @param {string} [props.color]  - CSS color value for the displayed number
 */
export function AnimatedCounter({ to, suffix, color }) {
  const containerRef = useRef(null)

  // Track the previously animated-to value so we don't retrigger the spring
  // when the parent re-renders without changing the `to` prop.
  const previousTargetRef = useRef(null)

  const isInView = useInView(containerRef, { once: true, margin: '-60px' })
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { stiffness: 55, damping: 20 })

  const [displayValue, setDisplayValue] = useState('0')

  useEffect(() => {
    if (!isInView) return
    if (previousTargetRef.current === to) return // Already animated to this value

    previousTargetRef.current = to
    motionValue.set(to)
  }, [isInView, to, motionValue])

  // Round the spring output to a whole number on every frame
  useMotionValueEvent(springValue, 'change', (currentValue) => {
    setDisplayValue(Math.round(currentValue).toString())
  })

  return (
    <span
      ref={containerRef}
      className="font-display font-extrabold text-4xl md:text-5xl tabular-nums mb-1 block"
      style={{ color }}
      aria-hidden="true"
    >
      {displayValue}
      {suffix}
    </span>
  )
}
