export function ChakraLogo() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      className="drop-shadow-[0_0_8px_rgba(26,86,219,0.6)]"
      aria-hidden="true"
      focusable="false"
    >
      {/* Outer ring */}
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="none"
        stroke="#1a56db"
        strokeWidth="1.8"
      />
      <circle
        cx="18"
        cy="18"
        r="10"
        fill="none"
        stroke="#1a56db"
        strokeWidth="1"
      />
      <circle cx="18" cy="18" r="3" fill="#1a56db" />
      {/* 24 spokes */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        const rad = (angle * Math.PI) / 180;
        const x1 = 18 + 10 * Math.sin(rad);
        const y1 = 18 - 10 * Math.cos(rad);
        const x2 = 18 + 16 * Math.sin(rad);
        const y2 = 18 - 16 * Math.cos(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#1a56db"
            strokeWidth="1"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
