/**
 * ContentWrapper Component
 *
 * A reusable container component that provides consistent max-width constraints
 * and horizontal padding across the application.
 *
 * Features:
 * - Three max-width presets: default (1200px), wide (1400px), full (100%)
 * - Automatic horizontal centering
 * - Consistent 8-unit horizontal padding
 * - Optional additional className for custom styling
 *
 * @param children - Content to be wrapped
 * @param maxWidth - Width constraint preset (default: "default")
 * @param className - Additional CSS classes
 */

interface ContentWrapperProps {
  children: React.ReactNode;
  maxWidth?: "default" | "wide" | "full";
  className?: string;
}

export default function ContentWrapper({
  children,
  maxWidth = "default",
  className = "",
}: ContentWrapperProps) {
  const maxWidthClass = {
    default: "max-w-[1200px]",
    wide: "max-w-[1400px]",
    full: "max-w-full",
  }[maxWidth];

  return (
    <div className={`${maxWidthClass} mx-auto px-8 w-full ${className}`}>
      {children}
    </div>
  );
}
