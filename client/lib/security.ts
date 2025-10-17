// Security utilities for ChargeSource app

import { safeParse } from "./safeLocalStorage";

/**
 * Input sanitization utilities
 */
export const sanitize = {
  /**
   * Sanitize HTML to prevent XSS attacks
   */
  html: (input: string): string => {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  },

  /**
   * Sanitize user input for display
   */
  userInput: (input: string): string => {
    return input
      .replace(/[<>]/g, "") // Remove angle brackets
      .trim()
      .slice(0, 1000); // Limit length
  },

  /**
   * Sanitize email addresses
   */
  email: (email: string): string => {
    return email
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9@._-]/g, "");
  },

  /**
   * Sanitize phone numbers
   */
  phone: (phone: string): string => {
    return phone.replace(/[^0-9+\-\s()]/g, "");
  },

  /**
   * Sanitize project names and descriptions
   */
  projectText: (text: string): string => {
    return text.replace(/[<>]/g, "").trim().slice(0, 500);
  },
};

/**
 * Validation utilities
 */
export const validate = {
  /**
   * Email validation
   */
  email: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  /**
   * Australian phone number validation
   */
  australianPhone: (phone: string): boolean => {
    const phoneRegex = /^(\+61|0)[2-478][0-9]{8}$/;
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    return phoneRegex.test(cleanPhone);
  },

  /**
   * Strong password validation
   */
  password: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Project ID validation
   */
  projectId: (id: string): boolean => {
    const idRegex = /^[a-zA-Z0-9\-_]{1,50}$/;
    return idRegex.test(id);
  },

  /**
   * File upload validation
   */
  fileUpload: (file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      errors.push(
        "File type not allowed. Only JPEG, PNG, WebP, and PDF files are accepted.",
      );
    }

    if (file.size > maxSize) {
      errors.push("File size too large. Maximum size is 10MB.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

/**
 * Content Security Policy helpers
 */
export const csp = {
  /**
   * Generate nonce for inline scripts
   */
  generateNonce: (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  },

  /**
   * Check if external URL is allowed
   */
  isAllowedDomain: (url: string): boolean => {
    const allowedDomains = [
      "maps.googleapis.com",
      "maps.gstatic.com",
      "fonts.googleapis.com",
      "fonts.gstatic.com",
      // Add your allowed domains here
    ];

    try {
      const urlObj = new URL(url);
      return allowedDomains.includes(urlObj.hostname);
    } catch {
      return false;
    }
  },
};

/**
 * Local storage security
 */
export const secureStorage = {
  /**
   * Set item with expiration
   */
  setItem: (key: string, value: any, expirationHours: number = 24): void => {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + expirationHours);

    const item = {
      value: value,
      expiration: expiration.toISOString(),
    };

    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error("Failed to set localStorage item:", error);
    }
  },

  /**
   * Get item with expiration check
   */
  getItem: (key: string): any => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item = safeParse<any>(itemStr, null);
      if (!item) return null;
      const now = new Date();

      if (now > new Date(item.expiration)) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error("Failed to get localStorage item:", error);
      return null;
    }
  },

  /**
   * Remove expired items
   */
  cleanup: (): void => {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      try {
        const itemStr = localStorage.getItem(key);
        if (itemStr) {
          const item = safeParse<any>(itemStr, null);
          if (
            item &&
            item.expiration &&
            new Date() > new Date(item.expiration)
          ) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Invalid JSON, ignore
      }
    });
  },
};

/**
 * Rate limiting for API calls
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000, // 15 minutes
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];

    // Remove old attempts outside the window
    const validAttempts = attempts.filter((time) => now - time < this.windowMs);

    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);

    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

/**
 * Environment-based security configurations
 */
export const securityConfig = {
  isDevelopment: import.meta.env.DEV,

  // API endpoints should use HTTPS in production
  getApiUrl: (endpoint: string): string => {
    const baseUrl = import.meta.env.DEV
      ? "http://localhost:8080"
      : "https://your-production-domain.com";

    return `${baseUrl}${endpoint}`;
  },

  // Cookie settings for production
  cookieSettings: {
    secure: !import.meta.env.DEV, // HTTPS only in production
    sameSite: "strict" as const,
    httpOnly: false, // We need access in JS for auth tokens
  },
};

/**
 * Audit logging for security events
 */
export const auditLog = {
  logSecurityEvent: (
    event: string,
    details: Record<string, any> = {},
  ): void => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In production, send to security monitoring service
    if (!import.meta.env.DEV) {
      // Send to your security monitoring service
      // Example: sendToSecurityService(logEntry);
    } else {
      console.log("Security Event:", logEntry);
    }
  },
};

/**
 * Secure random ID generation
 */
export const generateSecureId = (length: number = 32): string => {
  const array = new Uint8Array(length / 2);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
};

// Create global rate limiter instance
export const globalRateLimiter = new RateLimiter();

// Initialize security cleanup
if (typeof window !== "undefined") {
  // Clean up expired storage items on load
  secureStorage.cleanup();

  // Set up periodic cleanup
  setInterval(secureStorage.cleanup, 60 * 60 * 1000); // Every hour
}
