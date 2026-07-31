import path from 'node:path';
import fs from 'node:fs/promises';

/**
 * Normalizes and resolves absolute filesystem paths safely.
 */
export function resolveAbsolutePath(targetPath: string): string {
  if (!targetPath || targetPath.trim() === '') {
    throw new Error('Path argument is required and cannot be empty.');
  }
  return path.resolve(targetPath);
}

/**
 * Checks if a directory path exists on disk.
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Format bytes into human readable binary unit strings (B, KB, MB, GB).
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = (bytes / Math.pow(1024, index)).toFixed(2);
  return `${value} ${units[index] ?? 'B'}`;
}

/**
 * Format milliseconds duration into fixed seconds string.
 */
export function formatDuration(durationMs: number): string {
  return (durationMs / 1000).toFixed(2);
}
