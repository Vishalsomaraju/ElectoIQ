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
      {/* Outer ring */}
      <circle
        cx="110"
        cy="110"
        r="104"
        fill="none"
        stroke="#000080"
        strokeWidth="6"
      />
      <circle
        cx="110"
        cy="110"
        r="60"
        fill="none"
        stroke="#000080"
        strokeWidth="3"
      />
      {/* Hub */}
      <circle cx="110" cy="110" r="14" fill="#000080" />
      {/* 24 spokes */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        const rad = (angle * Math.PI) / 180;
        const x1 = 110 + 60 * Math.sin(rad);
        const y1 = 110 - 60 * Math.cos(rad);
        const x2 = 110 + 104 * Math.sin(rad);
        const y2 = 110 - 104 * Math.cos(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#000080"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      {/* 24 teardrop spokes (every other one slightly wider) */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24 + 7.5;
        const rad = (angle * Math.PI) / 180;
        const x1 = 110 + 14 * Math.sin(rad);
        const y1 = 110 - 14 * Math.cos(rad);
        const x2 = 110 + 60 * Math.sin(rad);
        const y2 = 110 - 60 * Math.cos(rad);
        return (
          <line
            key={`t${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#000080"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        );
      })}
    </svg>
  );
}
