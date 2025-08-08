// Centralized error handling service for ChargeSource
import { toast } from '@/hooks/use-toast';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  NETWORK = 'network',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  DATABASE = 'database',
  FILE_UPLOAD = 'file_upload',
  FORM_SUBMISSION = 'form_submission',
  UNKNOWN = 'unknown'
}

export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  additionalData?: Record<string, any>;
}

export interface AppError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: ErrorContext;
  originalError?: Error;
  timestamp: Date;
  userFriendlyMessage?: string;
}

class ErrorService {
  private errors: AppError[] = [];
  private maxErrorHistory = 100;

  /**
   * Handle and categorize errors with appropriate user feedback
   */
  handleError(
    error: unknown,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext
  ): AppError {
    const appError = this.createAppError(error, category, severity, context);
    
    // Store error for debugging
    this.addToHistory(appError);
    
    // Show user-friendly feedback based on severity
    this.showUserFeedback(appError);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorService]', appError);
    }
    
    // Send to monitoring service in production
    if (import.meta.env.PROD) {
      this.sendToMonitoring(appError);
    }
    
    return appError;
  }

  /**
   * Create standardized error object
   */
  private createAppError(
    error: unknown,
    category: ErrorCategory,
    severity: ErrorSeverity,
    context?: ErrorContext
  ): AppError {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let message: string;
    let originalError: Error | undefined;
    
    if (error instanceof Error) {
      message = error.message;
      originalError = error;
    } else if (typeof error === 'string') {
      message = error;
    } else {
      message = 'An unknown error occurred';
    }

    return {
      id,
      message,
      category,
      severity,
      context,
      originalError,
      timestamp: new Date(),
      userFriendlyMessage: this.getUserFriendlyMessage(message, category)
    };
  }

  /**
   * Generate user-friendly error messages
   */
  private getUserFriendlyMessage(message: string, category: ErrorCategory): string {
    // Network-related errors
    if (category === ErrorCategory.NETWORK || message.includes('fetch') || message.includes('network')) {
      return 'Unable to connect to our servers. Please check your internet connection and try again.';
    }
    
    // Authentication errors
    if (category === ErrorCategory.AUTHENTICATION || message.includes('auth') || message.includes('login')) {
      return 'There was a problem with your login. Please sign in again.';
    }
    
    // Permission errors
    if (category === ErrorCategory.PERMISSION || message.includes('permission') || message.includes('unauthorized')) {
      return 'You do not have permission to perform this action. Please contact your administrator.';
    }
    
    // File upload errors
    if (category === ErrorCategory.FILE_UPLOAD || message.includes('upload') || message.includes('file')) {
      return 'There was a problem uploading your file. Please check the file size and format, then try again.';
    }
    
    // Database errors
    if (category === ErrorCategory.DATABASE || message.includes('database') || message.includes('supabase')) {
      return 'We are experiencing technical difficulties. Please try again in a few moments.';
    }
    
    // Validation errors
    if (category === ErrorCategory.VALIDATION || message.includes('validation') || message.includes('required')) {
      return 'Please check your input and ensure all required fields are filled correctly.';
    }
    
    // Form submission errors
    if (category === ErrorCategory.FORM_SUBMISSION) {
      return 'There was a problem submitting your form. Please review your information and try again.';
    }
    
    // Default user-friendly message
    return 'Something went wrong. Please try again, and contact support if the problem persists.';
  }

  /**
   * Show appropriate user feedback based on error severity
   */
  private showUserFeedback(error: AppError): void {
    const { severity, userFriendlyMessage } = error;
    
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        toast({
          title: "Critical Error",
          description: userFriendlyMessage,
          variant: "destructive",
        });
        break;
        
      case ErrorSeverity.HIGH:
        toast({
          title: "Error",
          description: userFriendlyMessage,
          variant: "destructive",
        });
        break;
        
      case ErrorSeverity.MEDIUM:
        toast({
          title: "Warning",
          description: userFriendlyMessage,
          variant: "destructive",
        });
        break;
        
      case ErrorSeverity.LOW:
        // For low severity, we might not show a toast at all
        // or show a subtle notification
        console.warn('Low severity error:', userFriendlyMessage);
        break;
    }
  }

  /**
   * Add error to history for debugging
   */
  private addToHistory(error: AppError): void {
    this.errors.unshift(error);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrorHistory) {
      this.errors = this.errors.slice(0, this.maxErrorHistory);
    }
  }

  /**
   * Send error to monitoring service (placeholder for actual implementation)
   */
  private sendToMonitoring(error: AppError): void {
    // In a real implementation, this would send to Sentry, DataDog, etc.
    // For now, we'll just log to console in production
    if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH) {
      console.error('[Production Error]', {
        id: error.id,
        message: error.message,
        category: error.category,
        severity: error.severity,
        context: error.context,
        timestamp: error.timestamp.toISOString()
      });
    }
  }

  /**
   * Get error history for debugging
   */
  getErrorHistory(): AppError[] {
    return [...this.errors];
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errors = [];
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): AppError[] {
    return this.errors.filter(error => error.category === category);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errors.filter(error => error.severity === severity);
  }
}

// Create singleton instance
export const errorService = new ErrorService();

// Convenience functions for common error scenarios
export const handleAuthError = (error: unknown, context?: ErrorContext) => 
  errorService.handleError(error, ErrorCategory.AUTHENTICATION, ErrorSeverity.HIGH, context);

export const handleNetworkError = (error: unknown, context?: ErrorContext) => 
  errorService.handleError(error, ErrorCategory.NETWORK, ErrorSeverity.MEDIUM, context);

export const handleValidationError = (error: unknown, context?: ErrorContext) => 
  errorService.handleError(error, ErrorCategory.VALIDATION, ErrorSeverity.LOW, context);

export const handleFileUploadError = (error: unknown, context?: ErrorContext) => 
  errorService.handleError(error, ErrorCategory.FILE_UPLOAD, ErrorSeverity.MEDIUM, context);

export const handleDatabaseError = (error: unknown, context?: ErrorContext) => 
  errorService.handleError(error, ErrorCategory.DATABASE, ErrorSeverity.HIGH, context);

export const handleCriticalError = (error: unknown, context?: ErrorContext) => 
  errorService.handleError(error, ErrorCategory.UNKNOWN, ErrorSeverity.CRITICAL, context);

// React hook for accessing error service
export const useErrorHandler = () => {
  return {
    handleError: errorService.handleError.bind(errorService),
    handleAuthError,
    handleNetworkError,
    handleValidationError,
    handleFileUploadError,
    handleDatabaseError,
    handleCriticalError,
    getErrorHistory: errorService.getErrorHistory.bind(errorService),
    clearHistory: errorService.clearHistory.bind(errorService),
  };
};

// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorService.handleError(
      event.error,
      ErrorCategory.UNKNOWN,
      ErrorSeverity.HIGH,
      {
        action: 'window_error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      }
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorService.handleError(
      event.reason,
      ErrorCategory.UNKNOWN,
      ErrorSeverity.HIGH,
      {
        action: 'unhandled_promise_rejection'
      }
    );
  });
}
