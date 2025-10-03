/**
 * Logger Utility
 * Winston kullanarak console ve file logging
 */

import winston from 'winston';
import { CONSTANTS } from '../config/constants.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Logger instance
const logger = winston.createLogger({
  level: CONSTANTS.LOGGING.LEVEL,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console transport (renkli)
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
    // File transport - tüm loglar
    new winston.transports.File({
      filename: CONSTANTS.LOGGING.FILE_PATH,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport - sadece hatalar
    new winston.transports.File({
      filename: './logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Structured logging helpers
 */
export const log = {
  info: (message, meta = {}) => logger.info(message, meta),
  error: (message, error = null) => {
    if (error instanceof Error) {
      logger.error(message, { error: error.message, stack: error.stack });
    } else {
      logger.error(message, { error });
    }
  },
  warn: (message, meta = {}) => logger.warn(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),
};

export default logger;

