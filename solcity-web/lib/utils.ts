/**
 * Utility functions for the application.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges Tailwind CSS class names.
 *
 * This utility function combines multiple class names using clsx and then
 * merges them with tailwind-merge to handle conflicting Tailwind classes.
 * It's useful for conditional styling and component composition.
 *
 * @param inputs - Class names, objects, or arrays to combine
 * @returns Merged class name string
 *
 * @example
 * ```tsx
 * // Basic usage
 * cn("px-4 py-2", "bg-blue-500") // "px-4 py-2 bg-blue-500"
 *
 * // Conditional classes
 * cn("px-4", isActive && "bg-blue-500") // "px-4 bg-blue-500" if isActive
 *
 * // Conflicting classes (tailwind-merge resolves)
 * cn("px-4 py-2", "px-6") // "py-2 px-6" (px-6 overrides px-4)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
