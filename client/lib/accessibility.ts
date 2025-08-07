// Accessibility utilities for ChargeSource app
import { useEffect, useRef } from 'react';

/**
 * Manage focus for better keyboard navigation
 */
export const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement | null>(null);

  const setFocus = (element: HTMLElement | null) => {
    if (element) {
      element.focus();
      focusRef.current = element;
    }
  };

  const restoreFocus = () => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  };

  return { setFocus, restoreFocus };
};

/**
 * Trap focus within a container (for modals, dialogs)
 */
export const useFocusTrap = (isActive: boolean = false) => {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Dispatch custom event for parent to handle
        container.dispatchEvent(new CustomEvent('escapeFocusTrap'));
      }
    };

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);

    // Focus first element when trap is activated
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Announce dynamic content changes to screen readers
 */
export const useAnnouncer = () => {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) {
      // Create announcer element if it doesn't exist
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    // Clear and set new message
    announcerRef.current.textContent = '';
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = message;
      }
    }, 100);
  };

  return announce;
};

/**
 * Skip to main content link
 */
export const SkipToMain: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-primary text-primary-foreground px-4 py-2 z-50"
    >
      Skip to main content
    </a>
  );
};

/**
 * Screen reader only text component
 */
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
};

/**
 * ARIA-describedby helper
 */
export const useAriaDescribedBy = (description: string) => {
  const id = `desc-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    'aria-describedby': id,
    descriptionProps: {
      id,
      children: description,
      className: 'sr-only'
    }
  };
};

/**
 * Keyboard navigation utilities
 */
export const keyboardUtils = {
  isArrowKey: (key: string) => ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key),
  isEnterOrSpace: (key: string) => ['Enter', ' '].includes(key),
  isEscape: (key: string) => key === 'Escape',
  isTab: (key: string) => key === 'Tab',
  
  handleArrowNavigation: (
    e: React.KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ) => {
    if (!keyboardUtils.isArrowKey(e.key)) return;
    
    e.preventDefault();
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowUp':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowDown':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowLeft':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowRight':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
    }
    
    onIndexChange(newIndex);
    items[newIndex]?.focus();
  }
};

/**
 * Color contrast checker
 */
export const colorContrast = {
  // Simple contrast ratio calculator
  getContrastRatio: (color1: string, color2: string): number => {
    // This is a simplified version - in production, use a proper color contrast library
    const getLuminance = (color: string): number => {
      // Convert hex to RGB and calculate relative luminance
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const [rs, gs, bs] = [r, g, b].map(c => 
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  },
  
  meetsWCAG: (ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean => {
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }
};

/**
 * Reduced motion preferences
 */
export const useReducedMotion = () => {
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return prefersReducedMotion;
};

/**
 * High contrast mode detection
 */
export const useHighContrast = () => {
  const prefersHighContrast = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-contrast: high)').matches;
  
  return prefersHighContrast;
};

/**
 * Accessible form validation
 */
export const accessibleFormValidation = {
  createErrorId: (fieldName: string) => `${fieldName}-error`,
  
  getFieldProps: (fieldName: string, hasError: boolean) => ({
    'aria-invalid': hasError,
    'aria-describedby': hasError ? accessibleFormValidation.createErrorId(fieldName) : undefined,
  }),
  
  getErrorProps: (fieldName: string) => ({
    id: accessibleFormValidation.createErrorId(fieldName),
    role: 'alert',
    'aria-live': 'polite' as const,
  })
};