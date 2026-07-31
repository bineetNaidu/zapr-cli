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
export const DEFAULT_EXCLUDED_FOLDERS: readonly string[] = [
  '.git',
  '.hg',
  '.svn',
  '.vscode',
  '.idea',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  'vendor',
];

/**
 * Standard folder name targeted for disk cleanup operations.
 */
export const TARGET_FOLDER_NAME = 'node_modules';
