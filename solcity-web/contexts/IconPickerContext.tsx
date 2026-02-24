"use client";

import * as LucideIcons from "lucide-react";
import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";

/**
 * IconPickerContext
 *
 * Provides a centralized icon management system for the application using Lucide icons.
 * Manages a curated list of relevant icons for offers/rewards and provides search functionality.
 *
 * Features:
 * - Curated list of 70+ relevant icons for loyalty programs
 * - Real-time search/filter functionality
 * - Icon metadata with friendly names
 * - Type-safe icon components
 * - Fallback icon handling
 *
 * Usage:
 * 1. Wrap your app with IconPickerProvider
 * 2. Use useIconPicker() hook to access icons and search
 * 3. Use IconRenderer component to display icons by name
 */

/**
 * IconInfo Type
 *
 * Represents metadata for a single icon in the picker.
 *
 * @property name - Original icon name from Lucide (e.g., "ShoppingBag")
 * @property friendlyName - Human-readable name with spaces (e.g., "Shopping Bag")
 * @property Component - React component for rendering the icon
 */
export type IconInfo = {
  name: string;
  friendlyName: string;
  Component: React.ComponentType<{ className?: string }>;
};

/**
 * IconPickerContextType
 *
 * Context value interface providing icon data and search functionality.
 *
 * @property icons - Filtered list of icons based on current search term
 * @property allIcons - Complete list of all available icons
 * @property searchTerm - Current search filter text
 * @property setSearchTerm - Function to update search filter
 */
interface IconPickerContextType {
  icons: IconInfo[];
  allIcons: IconInfo[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const IconPickerContext = createContext<IconPickerContextType | undefined>(
  undefined,
);

/**
 * RELEVANT_ICONS
 *
 * Curated list of icon names relevant for loyalty programs, offers, and rewards.
 * Organized by category:
 * - Commerce: Gift, Tag, Percent, DollarSign, Coins, CreditCard, Ticket
 * - Achievement: Star, Award, Trophy, Crown, Sparkles, Zap, Heart
 * - Shopping: ShoppingBag, ShoppingCart, Package, Box
 * - Food & Beverage: Coffee, Pizza, Utensils, Wine, Beer, IceCream, Cake, etc.
 * - Fashion & Tech: Shirt, Watch, Glasses, Headphones, Smartphone, Laptop, Camera
 * - Entertainment: Music, Film, Gamepad2
 * - Lifestyle: Dumbbell, Bike, Car, Plane, Hotel, MapPin, Compass
 * - Nature: Palmtree, Sun, Moon, Cloud, Umbrella, Flame, Snowflake, Leaf, Flower2
 * - Premium: Gem, Diamond, Key, Lock, Unlock, Shield, BadgeCheck, Medal
 * - Analytics: Target, TrendingUp, BarChart3, PieChart, Activity
 * - Time & Communication: Calendar, Clock, Timer, Bell, Mail, MessageCircle
 * - Social: Users, User, UserPlus, Smile, ThumbsUp, PartyPopper
 */
const RELEVANT_ICONS = [
  "Gift",
  "Tag",
  "Percent",
  "DollarSign",
  "Coins",
  "CreditCard",
  "Ticket",
  "Star",
  "Award",
  "Trophy",
  "Crown",
  "Sparkles",
  "Zap",
  "Heart",
  "ShoppingBag",
  "ShoppingCart",
  "Package",
  "Box",
  "Coffee",
  "Pizza",
  "Utensils",
  "Wine",
  "Beer",
  "IceCream",
  "Cake",
  "Apple",
  "Sandwich",
  "Shirt",
  "Watch",
  "Glasses",
  "Headphones",
  "Smartphone",
  "Laptop",
  "Camera",
  "Music",
  "Film",
  "Gamepad2",
  "Dumbbell",
  "Bike",
  "Car",
  "Plane",
  "Hotel",
  "MapPin",
  "Compass",
  "Palmtree",
  "Sun",
  "Moon",
  "Cloud",
  "Umbrella",
  "Flame",
  "Snowflake",
  "Leaf",
  "Flower2",
  "Gem",
  "Diamond",
  "Key",
  "Lock",
  "Unlock",
  "Shield",
  "BadgeCheck",
  "Medal",
  "Target",
  "TrendingUp",
  "BarChart3",
  "PieChart",
  "Activity",
  "Calendar",
  "Clock",
  "Timer",
  "Bell",
  "Mail",
  "MessageCircle",
  "Users",
  "User",
  "UserPlus",
  "Smile",
  "ThumbsUp",
  "PartyPopper",
];

/**
 * IconPickerProvider Component
 *
 * Context provider that manages icon data and search state for the entire application.
 * Must wrap any components that use useIconPicker() or IconRenderer.
 *
 * Features:
 * - Initializes icon list from Lucide icons library
 * - Provides search/filter functionality
 * - Memoizes icon list for performance
 * - Converts icon names to friendly display names
 *
 * @param children - Child components that need access to icon picker functionality
 *
 * @example
 * ```tsx
 * <IconPickerProvider>
 *   <YourApp />
 * </IconPickerProvider>
 * ```
 */
export const IconPickerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const allIcons: IconInfo[] = useMemo(
    () =>
      RELEVANT_ICONS.map((iconName) => {
        const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons];
        if (!IconComponent) return null;

        return {
          name: iconName,
          friendlyName: iconName.replace(/([A-Z])/g, " $1").trim(),
          Component: IconComponent as React.ComponentType<{
            className?: string;
          }>,
        };
      }).filter((icon): icon is IconInfo => icon !== null),
    [],
  );

  const filteredIcons = useMemo(() => {
    if (!searchTerm.trim()) {
      return allIcons;
    }
    const search = searchTerm.toLowerCase();
    return allIcons.filter(
      (icon) =>
        icon.name.toLowerCase().includes(search) ||
        icon.friendlyName.toLowerCase().includes(search),
    );
  }, [allIcons, searchTerm]);

  return (
    <IconPickerContext.Provider
      value={{
        icons: filteredIcons,
        allIcons,
        searchTerm,
        setSearchTerm,
      }}
    >
      {children}
    </IconPickerContext.Provider>
  );
};

/**
 * useIconPicker Hook
 *
 * Custom hook to access icon picker context data and functionality.
 * Must be used within a component wrapped by IconPickerProvider.
 *
 * @returns IconPickerContextType object with:
 *   - icons: Filtered icon list based on search
 *   - allIcons: Complete unfiltered icon list
 *   - searchTerm: Current search filter
 *   - setSearchTerm: Function to update search
 *
 * @throws Error if used outside IconPickerProvider
 *
 * @example
 * ```tsx
 * const { icons, searchTerm, setSearchTerm } = useIconPicker();
 * ```
 */
export const useIconPicker = () => {
  const context = useContext(IconPickerContext);
  if (!context) {
    throw new Error("useIconPicker must be used within IconPickerProvider");
  }
  return context;
};

/**
 * IconRenderer Component
 *
 * Renders a Lucide icon by name with automatic fallback handling.
 * Used to display icons throughout the application based on stored icon names.
 *
 * Features:
 * - Renders icon by string name
 * - Automatic fallback to Gift icon if icon not found
 * - Returns null for empty icon names
 * - Type-safe icon component rendering
 * - Supports custom className for styling
 *
 * @param icon - Name of the Lucide icon to render (e.g., "ShoppingBag")
 * @param className - Optional CSS classes for styling the icon
 *
 * @example
 * ```tsx
 * <IconRenderer icon="Gift" className="w-6 h-6 text-accent" />
 * ```
 */
export const IconRenderer = ({
  icon,
  className = "",
}: {
  icon: string;
  className?: string;
}) => {
  if (!icon) {
    return null;
  }

  const IconComponent = LucideIcons[
    icon as keyof typeof LucideIcons
  ] as React.ComponentType<{ className?: string }>;

  if (!IconComponent) {
    // Fallback to Gift icon
    const FallbackIcon = LucideIcons.Gift as React.ComponentType<{
      className?: string;
    }>;
    return <FallbackIcon className={className} />;
  }

  return <IconComponent className={className} />;
};
