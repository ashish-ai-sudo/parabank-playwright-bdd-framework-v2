/**
 * Lightweight, contextual logger for the automation framework.
 *
 * Usage:
 *   const log = createLogger('LoginPage');
 *   log.info('Submitting login form');
 *   log.debug('Username field value set');
 *
 * Log level is controlled by the LOG_LEVEL environment variable.
 * Defaults to 'info'. Set LOG_LEVEL=debug to see debug output.
 * Valid values: debug | info | warn | error
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info:  1,
  warn:  2,
  error: 3,
};

/** Resolved once at module load — avoids repeated env reads. */
const minRank: number = (() => {
  const raw = process.env['LOG_LEVEL']?.toLowerCase() as LogLevel | undefined;
  return LEVEL_RANK[raw ?? 'info'] ?? LEVEL_RANK.info;
})();

function emit(level: LogLevel, context: string, message: string): void {
  if (LEVEL_RANK[level] < minRank) return;

  // HH:mm:ss.SSS keeps log lines short without losing precision.
  const timestamp = new Date().toISOString().slice(11, 23);
  const label     = level.toUpperCase().padEnd(5);
  const line      = `[${timestamp}] ${label} [${context}] ${message}`;

  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.info(line);
  }
}

/**
 * Returns a logger bound to the given context label.
 * Typically called once per class/file:
 *   const log = createLogger('BasePage');
 */
export function createLogger(context: string): Logger {
  return {
    debug: (message) => emit('debug', context, message),
    info:  (message) => emit('info',  context, message),
    warn:  (message) => emit('warn',  context, message),
    error: (message) => emit('error', context, message),
  };
}
