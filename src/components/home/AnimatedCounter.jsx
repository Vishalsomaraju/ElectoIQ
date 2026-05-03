import { useRef, useEffect, useState } from "react";
import { useInView, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";

export function AnimatedCounter({ to, suffix, color }) {
  const ref = useRef(null);
  const prevValueRef = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 55, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    if (prevValueRef.current === to) return;
    prevValueRef.current = to;
    motionVal.set(to);
  }, [inView, to, motionVal]);

  useMotionValueEvent(spring, "change", (v) => {
    setDisplay(Math.round(v).toString());
  });

  return (
    <span
      ref={ref}
      className="font-display font-extrabold text-4xl md:text-5xl tabular-nums mb-1 block"
      style={{ color }}
      aria-hidden="true"
    >
      {display}
      {suffix}
    </span>
  );
}
