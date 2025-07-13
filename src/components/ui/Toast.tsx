import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, visible, onClose, duration = 2000 }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-surface-primary text-theme-primary px-4 py-2 rounded shadow-lg z-50 border border-accent-primary animate-fade-in">
      {message}
    </div>
  );
}; 
