"use client"

import React, { createContext, useContext, useMemo, useState } from "react";
import * as LucideIcons from "lucide-react";

export type IconInfo = {
  name: string;
  friendlyName: string;
  Component: React.ComponentType<{ className?: string }>;
};

interface IconPickerContextType {
  icons: IconInfo[];
  allIcons: IconInfo[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const IconPickerContext = createContext<IconPickerContextType | undefined>(
  undefined,
);

// Curated list of relevant icons for offers/rewards
const RELEVANT_ICONS = [
  "Gift", "Tag", "Percent", "DollarSign", "Coins", "CreditCard", "Ticket",
  "Star", "Award", "Trophy", "Crown", "Sparkles", "Zap", "Heart",
  "ShoppingBag", "ShoppingCart", "Package", "Box", "Coffee", "Pizza",
  "Utensils", "Wine", "Beer", "IceCream", "Cake", "Apple", "Sandwich",
  "Shirt", "Watch", "Glasses", "Headphones", "Smartphone", "Laptop",
  "Camera", "Music", "Film", "Gamepad2", "Dumbbell", "Bike", "Car",
  "Plane", "Hotel", "MapPin", "Compass", "Palmtree", "Sun", "Moon",
  "Cloud", "Umbrella", "Flame", "Snowflake", "Leaf", "Flower2",
  "Gem", "Diamond", "Key", "Lock", "Unlock", "Shield", "BadgeCheck",
  "Medal", "Target", "TrendingUp", "BarChart3", "PieChart", "Activity",
  "Calendar", "Clock", "Timer", "Bell", "Mail", "MessageCircle",
  "Users", "User", "UserPlus", "Smile", "ThumbsUp", "PartyPopper"
];

export const IconPickerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const allIcons: IconInfo[] = useMemo(
    () =>
      RELEVANT_ICONS
        .map((iconName) => {
          const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons];
          if (!IconComponent) return null;

          return {
            name: iconName,
            friendlyName: iconName.replace(/([A-Z])/g, " $1").trim(),
            Component: IconComponent as React.ComponentType<{
              className?: string;
            }>,
          };
        })
        .filter((icon): icon is IconInfo => icon !== null),
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

export const useIconPicker = () => {
  const context = useContext(IconPickerContext);
  if (!context) {
    throw new Error("useIconPicker must be used within IconPickerProvider");
  }
  return context;
};

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
    const FallbackIcon = LucideIcons["Gift"] as React.ComponentType<{
      className?: string;
    }>;
    return <FallbackIcon className={className} />;
  }

  return <IconComponent className={className} />;
};
