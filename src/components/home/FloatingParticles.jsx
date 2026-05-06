import { motion } from 'framer-motion'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Total number of floating particles rendered in the background. */
const PARTICLE_COUNT = 18

/**
 * Colour palette for the particles, cycling through the Indian flag colours
 * plus a complementary blue. Index modulo 4 selects the colour per particle.
 */
const PARTICLE_COLORS = ['#FF9933', '#138808', '#1a56db', '#0ea5e9']

// ---------------------------------------------------------------------------
// Static particle data
// ---------------------------------------------------------------------------

/**
 * Particle definitions are generated once at module load time (outside the
 * component) so they are stable across renders. Re-creating them inside the
 * component would cause all particles to "jump" on every parent re-render
 * because the random positions and timings would change.
 */
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
  id:       index,
  x:        Math.random() * 100,        // horizontal position (%)
  y:        Math.random() * 100,        // vertical position (%)
  size:     2 + Math.random() * 3,      // diameter in px (2–5 px)
  duration: 6 + Math.random() * 8,      // animation cycle in seconds (6–14 s)
  delay:    Math.random() * 5,          // stagger so they don't all pulse together
  color:    PARTICLE_COLORS[index % PARTICLE_COLORS.length],
}))

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * FloatingParticles — renders a set of softly animated coloured dots as a
 * purely decorative background layer.
 *
 * The container is `pointer-events-none` so it never intercepts clicks, and
 * `aria-hidden` because it carries no semantic meaning.
 */
export function FloatingParticles() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-20"
          style={{
            left:       `${particle.x}%`,
            top:        `${particle.y}%`,
            width:      particle.size,
            height:     particle.size,
            background: particle.color,
          }}
          animate={{ y: [0, -24, 0], opacity: [0.12, 0.28, 0.12] }}
          transition={{
            duration: particle.duration,
            delay:    particle.delay,
            repeat:   Infinity,
            ease:     'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
