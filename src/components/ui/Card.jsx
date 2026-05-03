// src/components/ui/Card.jsx
import { cn } from "../../utils/helpers";

/**
 * Main Card container component.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.hover=false] - Enable hover scale effect
 * @param {boolean} [props.glow=false] - Enable glow effect on hover
 * @param {function} [props.onClick] - Click handler
 * @returns {JSX.Element} Card component
 */
export function Card({
  children,
  className,
  hover = false,
  glow = false,
  onClick,
}) {
  const isInteractive = Boolean(onClick);

  const handleKeyDown = (e) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      className={cn(
        "glass rounded-2xl p-6 transition-all duration-300",
        hover && "hover:border-blue-500/30 hover:scale-[1.01]",
        isInteractive &&
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-india-saffron focus-visible:ring-offset-2",
        glow && "hover:glow-primary",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Header section for Card component.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Header content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} CardHeader component
 */
export function CardHeader({ children, className }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

/**
 * Title element for Card component.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Title text
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} CardTitle component
 */
export function CardTitle({ children, className }) {
  return (
    <h3
      className={cn(
        "font-display font-bold text-lg text-slate-900 dark:text-white",
        className,
      )}
    >
      {children}
    </h3>
  );
}

/**
 * Description text for Card component.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Description text
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} CardDescription component
 */
export function CardDescription({ children, className }) {
  return (
    <p
      className={cn(
        "text-sm text-slate-500 dark:text-white/60 mt-1",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * Content container for Card component.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Main content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} CardContent component
 */
export function CardContent({ children, className }) {
  return <div className={cn("", className)}>{children}</div>;
}

/**
 * Footer section for Card component.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Footer content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} CardFooter component
 */
export function CardFooter({ children, className }) {
  return (
    <div
      className={cn(
        "mt-4 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}
