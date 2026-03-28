/**
 * Logger Service - Object-Oriented Logging Utility
 * 
 * A flexible, extensible logging system with multiple log levels,
 * output destinations, and formatting options.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export type LogOutput = 'console' | 'file' | 'both';
export type LogFormat = 'text' | 'json';

export interface LoggerOptions {
  /** Minimum log level to output (default: INFO) */
  minLevel?: LogLevel;
  /** Output destination (default: 'console') */
  output?: LogOutput;
  /** Log format (default: 'text') */
  format?: LogFormat;
  /** File path for file output (required if output includes 'file') */
  filePath?: string;
  /** Whether to include timestamp (default: true) */
  includeTimestamp?: boolean;
  /** Whether to include log level in output (default: true) */
  includeLevel?: boolean;
  /** Whether to include caller information (default: false) */
  includeCaller?: boolean;
  /** Custom timestamp format (default: ISO string) */
  timestampFormat?: string;
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: unknown;
  caller?: string;
}

/**
 * Main Logger class implementing object-oriented logging
 */
export class Logger {
  private minLevel: LogLevel;
  private output: LogOutput;
  private format: LogFormat;
  private filePath?: string;
  private includeTimestamp: boolean;
  private includeLevel: boolean;
  private includeCaller: boolean;
  private timestampFormat: string;

  private static instance: Logger | null = null;

  /**
   * Creates a new Logger instance
   * @param options Configuration options for the logger
   */
  constructor(options: LoggerOptions = {}) {
    this.minLevel = options.minLevel ?? LogLevel.INFO;
    this.output = options.output ?? 'console';
    this.format = options.format ?? 'text';
    this.filePath = options.filePath;
    this.includeTimestamp = options.includeTimestamp ?? true;
    this.includeLevel = options.includeLevel ?? true;
    this.includeCaller = options.includeCaller ?? false;
    this.timestampFormat = options.timestampFormat ?? 'iso';

    // Validate file path if file output is requested
    if (this.output.includes('file') && !this.filePath) {
      throw new Error('File path is required when output includes "file"');
    }
  }

  /**
   * Get singleton instance of Logger
   * @param options Configuration options (only used on first call)
   * @returns Singleton Logger instance
   */
  static getInstance(options?: LoggerOptions): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(options);
    }
    return Logger.instance;
  }

  /**
   * Log a debug message
   * @param message The message to log
   * @param data Optional additional data
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log an info message
   * @param message The message to log
   * @param data Optional additional data
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a warning message
   * @param message The message to log
   * @param data Optional additional data
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log an error message
   * @param message The message to log
   * @param data Optional additional data
   */
  error(message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Log a fatal error message
   * @param message The message to log
   * @param data Optional additional data
   */
  fatal(message: string, data?: unknown): void {
    this.log(LogLevel.FATAL, message, data);
  }

  /**
   * Core logging method
   * @param level Log level
   * @param message The message to log
   * @param data Optional additional data
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    // Skip if below minimum level
    if (level < this.minLevel) {
      return;
    }

    // Get caller information if requested
    const caller = this.includeCaller ? this.getCaller() : undefined;

    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
      caller
    };

    // Format and output the log entry
    const formatted = this.formatEntry(entry);
    this.outputEntry(formatted, entry);
  }

  /**
   * Format a log entry based on configured format
   * @param entry The log entry to format
   * @returns Formatted log string
   */
  private formatEntry(entry: LogEntry): string {
    if (this.format === 'json') {
      return this.formatAsJson(entry);
    }
    return this.formatAsText(entry);
  }

  /**
   * Format log entry as plain text
   * @param entry The log entry to format
   * @returns Formatted text string
   */
  private formatAsText(entry: LogEntry): string {
    const parts: string[] = [];

    if (this.includeTimestamp) {
      parts.push(this.formatTimestamp(entry.timestamp));
    }

    if (this.includeLevel) {
      parts.push(`[${LogLevel[entry.level]}]`);
    }

    parts.push(entry.message);

    if (entry.caller) {
      parts.push(`(${entry.caller})`);
    }

    const baseMessage = parts.join(' ');

    if (entry.data !== undefined) {
      try {
        const dataStr = typeof entry.data === 'object' 
          ? JSON.stringify(entry.data, null, 2)
          : String(entry.data);
        return `${baseMessage}\n${dataStr}`;
      } catch {
        return `${baseMessage} [Unserializable data]`;
      }
    }

    return baseMessage;
  }

  /**
   * Format log entry as JSON
   * @param entry The log entry to format
   * @returns JSON string
   */
  private formatAsJson(entry: LogEntry): string {
    const jsonEntry: Record<string, unknown> = {
      message: entry.message,
      level: LogLevel[entry.level]
    };

    if (this.includeTimestamp) {
      jsonEntry.timestamp = entry.timestamp.toISOString();
    }

    if (entry.caller && this.includeCaller) {
      jsonEntry.caller = entry.caller;
    }

    if (entry.data !== undefined) {
      jsonEntry.data = entry.data;
    }

    return JSON.stringify(jsonEntry);
  }

  /**
   * Format timestamp based on configured format
   * @param date Date to format
   * @returns Formatted timestamp string
   */
  private formatTimestamp(date: Date): string {
    if (this.timestampFormat === 'iso') {
      return date.toISOString();
    }
    
    // Custom format handling (simplified - in production you might use a library like date-fns)
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
        hour12: false
      }).format(date);
    } catch {
      return date.toISOString();
    }
  }

  /**
   * Output log entry to configured destinations
   * @param formatted Formatted log message
   * @param entry Original log entry
   */
  private outputEntry(formatted: string, entry: LogEntry): void {
    // Output to console if configured
    if (this.output === 'console' || this.output === 'both') {
      this.outputToConsole(formatted, entry.level);
    }

    // Output to file if configured
    if (this.output === 'file' || this.output === 'both') {
      this.outputToFile(formatted);
    }
  }

  /**
   * Output log entry to console with appropriate console method
   * @param message Formatted message
   * @param level Log level
   */
  private outputToConsole(message: string, level: LogLevel): void {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message);
        break;
      default:
        console.log(message);
    }
  }

  /**
   * Output log entry to file
   * @param message Formatted message
   */
  private outputToFile(message: string): void {
    // In a real implementation, you would write to a file
    // For now, we'll simulate file writing
    // Note: In a browser environment, you might use the File API
    // In Node.js, you would use fs module
    
    // This is a placeholder - actual file writing would depend on the environment
    console.warn(`File logging to ${this.filePath} not implemented in this example`);
    console.warn(`Would write: ${message}`);
  }

  /**
   * Get caller information (simplified)
   * @returns Caller information string
   */
  private getCaller(): string {
    try {
      const error = new Error();
      const stack = error.stack?.split('\n') || [];
      
      // Find the first stack frame that's not from the Logger class
      for (let i = 3; i < stack.length; i++) {
        const frame = stack[i].trim();
        if (!frame.includes('Logger.') && !frame.includes('logger.ts')) {
          // Extract just the function/file info
          const match = frame.match(/at\s+(.+)\s+\((.+)\)/);
          if (match) {
            return `${match[1]} (${match[2]})`;
          }
          return frame.replace('at ', '');
        }
      }
    } catch {
      // Ignore errors in caller detection
    }
    
    return 'unknown';
  }

  /**
   * Update logger configuration
   * @param options New configuration options
   */
  configure(options: Partial<LoggerOptions>): void {
    if (options.minLevel !== undefined) {
      this.minLevel = options.minLevel;
    }
    if (options.output !== undefined) {
      this.output = options.output;
    }
    if (options.format !== undefined) {
      this.format = options.format;
    }
    if (options.filePath !== undefined) {
      this.filePath = options.filePath;
    }
    if (options.includeTimestamp !== undefined) {
      this.includeTimestamp = options.includeTimestamp;
    }
    if (options.includeLevel !== undefined) {
      this.includeLevel = options.includeLevel;
    }
    if (options.includeCaller !== undefined) {
      this.includeCaller = options.includeCaller;
    }
    if (options.timestampFormat !== undefined) {
      this.timestampFormat = options.timestampFormat;
    }
  }

  /**
   * Get current configuration
   * @returns Current configuration
   */
  getConfig(): LoggerOptions {
    return {
      minLevel: this.minLevel,
      output: this.output,
      format: this.format,
      filePath: this.filePath,
      includeTimestamp: this.includeTimestamp,
      includeLevel: this.includeLevel,
      includeCaller: this.includeCaller,
      timestampFormat: this.timestampFormat
    };
  }
}

/**
 * Convenience function to create a logger instance
 * @param options Logger configuration options
 * @returns New Logger instance
 */
export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}

/**
 * Default logger instance (singleton pattern)
 */
export const defaultLogger = Logger.getInstance();

// Example usage (commented out for production):
/*
// Basic usage
const logger = new Logger();
logger.info('Application started');
logger.debug('Debug information', { userId: 123, action: 'login' });
logger.error('Something went wrong', new Error('Test error'));

// Singleton pattern
const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();
console.log(logger1 === logger2); // true

// Custom configuration
const fileLogger = new Logger({
  minLevel: LogLevel.DEBUG,
  output: 'file',
  filePath: './logs/app.log',
  format: 'json',
  includeCaller: true
});

// Update configuration at runtime
logger.configure({ minLevel: LogLevel.WARN });
*/