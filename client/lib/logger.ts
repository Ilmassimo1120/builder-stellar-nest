// Environment-aware logging utility
type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && level === "debug") {
      return false;
    }
    return true;
  }

  private addLog(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Send to external logging service in production
    if (!this.isDevelopment && (level === "error" || level === "warn")) {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry) {
    // In production, send to logging service like Sentry, LogRocket, etc.
    // For now, it's a placeholder
    if (
      typeof window !== "undefined" &&
      "navigator" in window &&
      navigator.sendBeacon
    ) {
      try {
        navigator.sendBeacon("/api/logs", JSON.stringify(entry));
      } catch (error) {
        // Silently fail - don't log the logger!
      }
    }
  }

  debug(message: string, data?: any) {
    if (this.shouldLog("debug")) {
      console.debug(`[DEBUG] ${message}`, data);
      this.addLog("debug", message, data);
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog("info")) {
      console.info(`[INFO] ${message}`, data);
      this.addLog("info", message, data);
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog("warn")) {
      console.warn(`[WARN] ${message}`, data);
      this.addLog("warn", message, data);
    }
  }

  error(message: string, data?: any) {
    if (this.shouldLog("error")) {
      console.error(`[ERROR] ${message}`, data);
      this.addLog("error", message, data);
    }
  }

  // Get recent logs for debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Performance timing
  time(label: string) {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // Group logging
  group(label: string) {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  groupEnd() {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience functions
export const logDebug = (message: string, data?: any) =>
  logger.debug(message, data);
export const logInfo = (message: string, data?: any) =>
  logger.info(message, data);
export const logWarn = (message: string, data?: any) =>
  logger.warn(message, data);
export const logError = (message: string, data?: any) =>
  logger.error(message, data);
export const logTime = (label: string) => logger.time(label);
export const logTimeEnd = (label: string) => logger.timeEnd(label);
export const logGroup = (label: string) => logger.group(label);
export const logGroupEnd = () => logger.groupEnd();

// Error tracking wrapper
export function withErrorLogging<T extends (...args: any[]) => any>(
  fn: T,
  context: string = "Unknown",
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);

      // Handle promises
      if (result && typeof result.catch === "function") {
        return result.catch((error: Error) => {
          logError(`Error in ${context}`, {
            error: error.message,
            stack: error.stack,
          });
          throw error;
        });
      }

      return result;
    } catch (error) {
      logError(`Error in ${context}`, {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      throw error;
    }
  }) as T;
}

export default logger;
