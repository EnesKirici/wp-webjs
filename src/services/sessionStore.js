/**
 * Session Store Service
 * WhatsApp session yönetimi
 */

import { CONSTANTS } from '../config/constants.js';
import { log } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

/**
 * Session klasörünün var olduğundan emin ol
 */
export function ensureSessionDirectory() {
  const sessionPath = CONSTANTS.SESSION.PATH;

  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
    log.info(`Session directory created: ${sessionPath}`);
  } else {
    log.debug(`Session directory exists: ${sessionPath}`);
  }

  return sessionPath;
}

/**
 * Session var mı kontrol et
 */
export function hasSession() {
  const sessionPath = CONSTANTS.SESSION.PATH;
  
  if (!fs.existsSync(sessionPath)) {
    return false;
  }

  const files = fs.readdirSync(sessionPath);
  const hasSessionFiles = files.length > 0;

  log.debug(`Session check: ${hasSessionFiles ? 'Found' : 'Not found'}`, {
    path: sessionPath,
    fileCount: files.length,
  });

  return hasSessionFiles;
}

/**
 * Session'ı temizle (QR kodu sıfırlamak için)
 */
export function clearSession() {
  const sessionPath = CONSTANTS.SESSION.PATH;

  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true, force: true });
    log.info(`Session cleared: ${sessionPath}`);
    return true;
  }

  log.warn(`Session path not found, nothing to clear: ${sessionPath}`);
  return false;
}

/**
 * Session bilgilerini al
 */
export function getSessionInfo() {
  const sessionPath = CONSTANTS.SESSION.PATH;

  if (!fs.existsSync(sessionPath)) {
    return {
      exists: false,
      path: sessionPath,
      files: [],
    };
  }

  const files = fs.readdirSync(sessionPath);
  const stats = fs.statSync(sessionPath);

  return {
    exists: true,
    path: path.resolve(sessionPath),
    fileCount: files.length,
    files: files.slice(0, 5), // İlk 5 dosya
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime,
  };
}

/**
 * Session path'ini döndür
 */
export function getSessionPath() {
  return path.resolve(CONSTANTS.SESSION.PATH);
}

log.info('Session store module initialized');

