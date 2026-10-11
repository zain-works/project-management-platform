type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'token',
  'tokenHash',
  'authorization',
  'cookie',
  'secret',
  'creditCard',
  'apiKey',
]);

function sanitize(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitize);

  const sanitizedObj: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitizedObj[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitizedObj[key] = sanitize(value);
    } else {
      sanitizedObj[key] = value;
    }
  }
  return sanitizedObj;
}

function formatLog(level: LogLevel, message: string, context?: unknown) {
  const timestamp = new Date().toISOString();
  const meta = context ? ` ${JSON.stringify(sanitize(context))}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${meta}`;
}

export const logger = {
  info(message: string, context?: unknown) {
    console.log(formatLog('info', message, context));
  },
  warn(message: string, context?: unknown) {
    console.warn(formatLog('warn', message, context));
  },
  error(message: string, context?: unknown) {
    console.error(formatLog('error', message, context));
  },
  debug(message: string, context?: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatLog('debug', message, context));
    }
  },
};
