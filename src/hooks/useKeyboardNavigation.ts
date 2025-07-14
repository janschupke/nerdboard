import { useState, useCallback, useEffect } from 'react';

export const useKeyboardNavigation = <T extends string>(
  items: T[],
  onToggle: (itemId: T) => void,
  onSidebarToggle: () => void,
  isCollapsed: boolean,
) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
          break;
        case 'Enter':
        case ' ': // Spacebar
          event.preventDefault();
          if (items[selectedIndex]) {
            onToggle(items[selectedIndex]);
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (!isCollapsed) {
            onSidebarToggle();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (isCollapsed) {
            onSidebarToggle();
          }
          break;
      }
    },
    [items, selectedIndex, isCollapsed, onToggle, onSidebarToggle],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    selectedIndex,
    setSelectedIndex,
  };
};
