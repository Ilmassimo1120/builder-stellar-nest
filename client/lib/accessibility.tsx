// Accessibility utilities for ChargeSource app
import React, { useEffect, useRef } from 'react';

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
 * Announce dynamic content changes to screen readers
 */
export const useAnnouncer = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  };

  return announce;
};

/**
 * Keyboard navigation utilities
 */
export const keyboardUtils = {
  isArrowKey: (key: string) => ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key),
  isEnterOrSpace: (key: string) => ['Enter', ' '].includes(key),
  isEscape: (key: string) => key === 'Escape',
  isTab: (key: string) => key === 'Tab',
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
