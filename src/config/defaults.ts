/**
 * Default configuration constants for the Cleanr application.
 * 
 * Centralizing default parameters makes it easier to extend options
 * or load user overrides from config files in the future.
 */

/**
 * Common system and dependency management directories that should be skipped by default
 * during recursive directory scanning.
 */
/**
 * Common system and IDE metadata directories that should be skipped by default
 * during recursive directory scanning.
 */
export const DEFAULT_EXCLUDED_FOLDERS: readonly string[] = [
  '.git',
  '.hg',
  '.svn',
  '.vscode',
  '.idea',
  'vendor',
];

/**
 * Default directory names targeted for cleanup operations (node_modules + build outputs).
 */
export const TARGET_FOLDER_NAMES: readonly string[] = [
  'node_modules',
  'dist',
  'build',
  '.next',
  '.nuxt',
  'coverage',
];
