// ─── QAIROSS — Structured Logger ─────────────────────────────────────────────────
// Logger estructurado para producción y desarrollo
// - Desarrollo: output formateado con colores y timestamp
// - Producción: JSON estructurado para servicios de agregación de logs
// - Soporta contexto adicional y request ID

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  [key: string]: unknown
  requestId?: string
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  service: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

const SERVICE_NAME = "qaiross"

/**
 * Formatea un nivel de log con colores para terminal (desarrollo)
 */
function colorizeLevel(level: LogLevel): string {
  const colors: Record<LogLevel, string> = {
    debug: "\x1b[36m",  // cyan
    info: "\x1b[32m",   // green
    warn: "\x1b[33m",   // yellow
    error: "\x1b[31m",  // red
  }
  const reset = "\x1b[0m"
  return `${colors[level]}[${level.toUpperCase().padEnd(5)}]${reset}`
}

/**
 * Formatea timestamp para desarrollo (formato legible)
 */
function formatDevTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString("en-US", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  })
}

/**
 * Crea una entrada de log base con toda la metadata
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: SERVICE_NAME,
  }

  if (context && Object.keys(context).length > 0) {
    entry.context = context
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    }
  }

  return entry
}

/**
 * Output para desarrollo: formato legible con colores
 */
function logDev(entry: LogEntry): void {
  const timestamp = formatDevTimestamp(entry.timestamp)
  const levelStr = colorizeLevel(entry.level)
  const requestId = entry.context?.requestId
    ? `\x1b[90m[${entry.context.requestId}]\x1b[0m `
    : ""

  let output = `${timestamp} ${levelStr} ${requestId}${entry.message}`

  // Mostrar contexto (excluyendo requestId que ya se mostró)
  if (entry.context) {
    const filteredContext = { ...entry.context }
    delete filteredContext.requestId
    if (Object.keys(filteredContext).length > 0) {
      output += `\n  \x1b[90m${JSON.stringify(filteredContext)}\x1b[0m`
    }
  }

  // Mostrar error
  if (entry.error) {
    output += `\n  \x1b[31m${entry.error.name}: ${entry.error.message}\x1b[0m`
    if (entry.error.stack) {
      output += `\n  \x1b[90m${entry.error.stack}\x1b[0m`
    }
  }

  const consoleFn =
    entry.level === "error"
      ? console.error
      : entry.level === "warn"
        ? console.warn
        : entry.level === "debug"
          ? console.debug
          : console.log

  consoleFn(output)
}

/**
 * Output para producción: JSON estructurado (una línea)
 */
function logProd(entry: LogEntry): void {
  const consoleFn =
    entry.level === "error"
      ? console.error
      : entry.level === "warn"
        ? console.warn
        : entry.level === "debug"
          ? console.debug
          : console.log

  consoleFn(JSON.stringify(entry))
}

/**
 * Función principal de logging
 */
function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  const entry = createLogEntry(level, message, context, error)

  if (process.env.NODE_ENV === "production") {
    logProd(entry)
  } else {
    logDev(entry)
  }
}

/**
 * Crea un child logger con contexto predefinido (ej: requestId)
 */
function withContext(defaultContext: LogContext) {
  return {
    info: (message: string, context?: LogContext) =>
      log("info", message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      log("warn", message, { ...defaultContext, ...context }),
    error: (message: string, context?: LogContext, error?: Error) =>
      log("error", message, { ...defaultContext, ...context }, error),
    debug: (message: string, context?: LogContext) =>
      log("debug", message, { ...defaultContext, ...context }),
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext, error?: Error) => log("error", message, context, error),
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  withContext,
}
