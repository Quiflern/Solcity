"use client";

import { useState, type ReactNode, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, className = "" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    const activeButton = tabRefs.current[activeTab];
    if (activeButton) {
      setIndicatorStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className={className}>
      <div className="flex gap-8 border-b border-border relative">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-medium relative transition-colors ${activeTab === tab.id ? "text-text-primary" : "text-text-secondary"
              }`}
          >
            {tab.label}
          </button>
        ))}
        <motion.span
          className="absolute -bottom-px h-[2px] bg-accent"
          initial={false}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
      <div className="mt-6">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
