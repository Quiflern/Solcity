import { useVirtualizer } from "@tanstack/react-virtual";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/Sheet";
import { IconRenderer, useIconPicker } from "@/contexts/IconPickerContext";

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  placeholder = "Select icon",
  label,
  disabled = false,
}) => {
  const isDark = true; // Always use dark theme for this app
  const [isOpen, setIsOpen] = useState(false);
  const { icons, searchTerm, setSearchTerm } = useIconPicker();
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const columnsPerRow = isMobile ? 5 : 6;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(icons.length / columnsPerRow),
    getScrollElement: () => parentRef.current,
    estimateSize: () => (isMobile ? 40 : 50),
    overscan: 5,
  });

  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchTerm]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    if (!isOpen) {
      setLocalSearch("");
    } else {
      setLocalSearch(searchTerm);
    }
  }, [isOpen]);

  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    showAbove: false,
  });

  const [compactView] = useState(false);

  const [hoveredIcon, setHoveredIcon] = useState<{
    name: string;
    friendlyName: string;
    rect: DOMRect;
  } | null>(null);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const dropdownHeight = window.innerWidth < 768 ? 300 : 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setDropdownPosition({
        top: showAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        showAbove,
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setLocalSearch("");
    setHoveredIcon(null);
  };

  const handleSelect = (iconName: string) => {
    onChange(iconName);

    setTimeout(() => {
      setIsOpen(false);
      setLocalSearch("");
      setHoveredIcon(null);
    }, 0);
  };

  const handleIconHover = (
    e: React.MouseEvent<HTMLButtonElement>,
    icon: { name: string; friendlyName: string },
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredIcon({
      name: icon.name,
      friendlyName: icon.friendlyName,
      rect,
    });
  };

  const handleIconLeave = () => {
    setHoveredIcon(null);
  };

  const selectedIcon = icons.find((icon) => icon.name === value);

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  React.useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const dropdownHeight = window.innerWidth < 768 ? 300 : 280;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const showAbove =
          spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

        setDropdownPosition({
          top: showAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
          left: rect.left,
          width: rect.width,
          showAbove,
        });
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, compactView]);

  const renderPickerContent = () => (
    <div className="flex flex-col h-full">
      <div className="border-b border-border mt-2 px-3 pb-2 shrink-0">
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 ${
              isDark ? "text-text-secondary" : "text-gray-500"
            }`}
          />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search icons..."
            className={`w-full pl-8 pr-3 py-1.5 text-xs rounded border transition-colors focus:outline-none focus:ring-2 ${
              isDark
                ? "bg-panel border-border text-white placeholder-text-secondary focus:border-accent focus:ring-accent/50"
                : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-accent focus:ring-accent/50"
            }`}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 pt-2">
        {icons.length === 0 ? (
          <div
            className={`py-12 text-center ${
              isDark ? "text-text-secondary" : "text-gray-500"
            }`}
          >
            <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No icons found</p>
          </div>
        ) : (
          <div
            ref={parentRef}
            className="h-full overflow-y-auto p-2 mobile-scrollbar-hide"
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const rowStartIndex = virtualRow.index * columnsPerRow;
                const rowIcons = icons.slice(
                  rowStartIndex,
                  rowStartIndex + columnsPerRow,
                );

                return (
                  <div
                    key={virtualRow.index}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={`grid pb-1.5 ${isMobile ? "grid-cols-5 gap-1" : "grid-cols-6 gap-1.5"}`}
                  >
                    {rowIcons.map((icon) => (
                      <div key={icon.name} className="aspect-square">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(icon.name);
                          }}
                          onMouseEnter={(e) => handleIconHover(e, icon)}
                          onMouseLeave={handleIconLeave}
                          className={`group w-full h-full flex items-center justify-center rounded border transition-transform duration-200 hover:scale-110 hover:z-10 relative cursor-pointer focus:outline-none focus:ring-2 pointer-events-auto ${
                            value === icon.name
                              ? isDark
                                ? "bg-accent/20 border-accent/50 focus:ring-accent/50"
                                : "bg-accent/10 border-accent/50 focus:ring-accent/50"
                              : isDark
                                ? "border-border hover:bg-panel hover:border-border focus:ring-accent/20"
                                : "border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-accent/50"
                          }`}
                        >
                          {React.createElement(
                            icon.Component as React.ComponentType<{
                              className?: string;
                            }>,
                            {
                              className: `w-3 h-3 md:w-4 md:h-4 ${
                                value === icon.name
                                  ? "text-accent"
                                  : isDark
                                    ? "text-text-secondary group-hover:text-white"
                                    : "text-gray-600 group-hover:text-gray-900"
                              }`,
                            },
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {label && (
        <label
          className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
            isDark ? "text-white" : "text-gray-700"
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative" ref={pickerRef}>
        <div className="relative">
          {selectedIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <IconRenderer
                icon={selectedIcon.name}
                className={`w-5 h-5 ${isDark ? "text-white" : "text-gray-900"}`}
              />
            </div>
          )}
          <input
            ref={inputRef}
            type="text"
            readOnly
            value={selectedIcon?.friendlyName || ""}
            placeholder={placeholder}
            onClick={handleOpen}
            disabled={disabled}
            className={`w-full px-4 py-3 rounded border transition-colors cursor-pointer focus:outline-none focus:ring-2 ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-opacity-80"
            } ${selectedIcon ? "pl-10" : ""} ${
              isDark
                ? "bg-panel border-border text-white placeholder-text-secondary focus:border-accent focus:ring-accent/50"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-accent focus:ring-accent/50"
            }`}
          />
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                isDark
                  ? "hover:bg-border text-text-secondary hover:text-white"
                  : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {compactView && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent
            side="bottom"
            className={`h-[80vh] p-0 flex flex-col rounded-t-2xl ${
              isDark ? "bg-panel border-border" : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`p-4 border-b ${
                isDark ? "border-border" : "border-gray-200"
              }`}
            >
              <SheetTitle
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Select Icon
              </SheetTitle>
              <SheetDescription className="sr-only">
                Search and select an icon from the list
              </SheetDescription>
            </div>
            {renderPickerContent()}
          </SheetContent>
        </Sheet>
      )}

      {!compactView &&
        isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10002 pointer-events-auto"
              onClick={handleClose}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: dropdownPosition.showAbove ? 10 : -10,
                }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: dropdownPosition.showAbove ? 10 : -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${Math.max(dropdownPosition.width, isMobile ? 260 : 320)}px`,
                  height: isMobile ? "300px" : "280px",
                  zIndex: 10003,
                  pointerEvents: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
                className={`rounded border shadow-xl overflow-hidden flex flex-col ${
                  isDark
                    ? "bg-panel border-border backdrop-blur-xl"
                    : "bg-white border-gray-200"
                }`}
              >
                {renderPickerContent()}
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}

      {hoveredIcon &&
        isOpen &&
        createPortal(
          <div
            className={`fixed z-10004 px-2 py-1 rounded text-[10px] whitespace-nowrap pointer-events-none transition-opacity shadow-lg animate-in fade-in-0 zoom-in-95 duration-200 ${
              isDark
                ? "bg-border text-white border border-border"
                : "bg-gray-900 text-white"
            }`}
            style={{
              top: dropdownPosition.showAbove
                ? hoveredIcon.rect.top + hoveredIcon.rect.height + 8
                : hoveredIcon.rect.top - 10,
              left: hoveredIcon.rect.left + hoveredIcon.rect.width / 2,
              transform: dropdownPosition.showAbove
                ? "translate(-50%, 0)"
                : "translate(-50%, -100%)",
            }}
          >
            {hoveredIcon.friendlyName}
            <div
              className={`absolute w-2 h-2 rotate-45 left-1/2 -translate-x-1/2 ${
                isDark ? "bg-border" : "bg-gray-900"
              } ${dropdownPosition.showAbove ? "-top-1" : "-bottom-1"}`}
            />
          </div>,
          document.body,
        )}
    </div>
  );
};
