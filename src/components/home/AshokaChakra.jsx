/**
 * AshokaChakra — SVG rendering of the 24-spoke Ashoka Wheel.
 *
 * Used as a decorative background element on the Home page hero.
 * Rendered with very low opacity so it never competes with foreground content.
 * Aria-hidden because it is purely decorative.
 *
 * @param {{ size?: number }} props
 * @param {number} [props.size=220] - Width and height of the SVG in pixels
 */

// ---------------------------------------------------------------------------
// Constants — kept named so the geometry is self-documenting
// ---------------------------------------------------------------------------

/** Centre coordinates of the 220×220 viewBox */
const CHAKRA_CENTER = 110

/** Outer radius — the rim of the wheel */
const CHAKRA_OUTER_RADIUS = 104

/** Inner radius — where the spoke body meets the hub area */
const CHAKRA_INNER_RADIUS = 60

/** Hub radius — the solid circle at the centre */
const CHAKRA_HUB_RADIUS = 14

/** Number of spokes on the Ashoka Chakra */
const SPOKE_COUNT = 24

/** Colour of all SVG elements (navy blue, matching the Indian flag) */
const CHAKRA_COLOR = '#000080'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a degree angle (measured clockwise from north) to Cartesian
 * coordinates on the chakra's coordinate system.
 *
 * @param {number} angleDeg - Angle in degrees (0 = top, increases clockwise)
 * @param {number} radius - Distance from the centre point
 * @returns {{ x: number, y: number }}
 */
function polarToCartesian(angleDeg, radius) {
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: CHAKRA_CENTER + radius * Math.sin(angleRad),
    y: CHAKRA_CENTER - radius * Math.cos(angleRad),
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AshokaChakra({ size = 220 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 220 220"
      className="chakra-spin opacity-[0.06] dark:opacity-[0.07]"
      aria-hidden="true"
      focusable="false"
    >
      {/* Outer rim */}
      <circle
        cx={CHAKRA_CENTER}
        cy={CHAKRA_CENTER}
        r={CHAKRA_OUTER_RADIUS}
        fill="none"
        stroke={CHAKRA_COLOR}
        strokeWidth="6"
      />

      {/* Inner ring (spoke endpoints) */}
      <circle
        cx={CHAKRA_CENTER}
        cy={CHAKRA_CENTER}
        r={CHAKRA_INNER_RADIUS}
        fill="none"
        stroke={CHAKRA_COLOR}
        strokeWidth="3"
      />

      {/* Hub */}
      <circle cx={CHAKRA_CENTER} cy={CHAKRA_CENTER} r={CHAKRA_HUB_RADIUS} fill={CHAKRA_COLOR} />

      {/* Primary spokes — 24 thick lines from inner ring to outer rim */}
      {Array.from({ length: SPOKE_COUNT }).map((_, index) => {
        const angleDeg = (index * 360) / SPOKE_COUNT
        const inner = polarToCartesian(angleDeg, CHAKRA_INNER_RADIUS)
        const outer = polarToCartesian(angleDeg, CHAKRA_OUTER_RADIUS)
        return (
          <line
            key={`spoke-${index}`}
            x1={inner.x} y1={inner.y}
            x2={outer.x} y2={outer.y}
            stroke={CHAKRA_COLOR}
            strokeWidth="3"
            strokeLinecap="round"
          />
        )
      })}

      {/* Secondary spokes — 24 thin lines offset by half a spoke interval,
          running from the hub to the inner ring (decorative teardrop detail) */}
      {Array.from({ length: SPOKE_COUNT }).map((_, index) => {
        const angleDeg = (index * 360) / SPOKE_COUNT + (360 / SPOKE_COUNT / 2)
        const hubEdge  = polarToCartesian(angleDeg, CHAKRA_HUB_RADIUS)
        const ringEdge = polarToCartesian(angleDeg, CHAKRA_INNER_RADIUS)
        return (
          <line
            key={`spoke-secondary-${index}`}
            x1={hubEdge.x}  y1={hubEdge.y}
            x2={ringEdge.x} y2={ringEdge.y}
            stroke={CHAKRA_COLOR}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        )
      })}
    </svg>
  )
}
