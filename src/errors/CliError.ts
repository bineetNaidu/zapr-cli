/**
 * Custom operational error class for Cleanr CLI.
 * 
 * Provides human-readable error messages alongside specific exit codes
 * to ensure graceful failures and predictable CLI exit statuses.
 */
export class CliError extends Error {
  /**
   * Numeric process exit code (e.g., 1 for general error, 2 for invalid arguments).
   */
  public readonly exitCode: number;

  constructor(message: string, exitCode = 1) {
    super(message);
    this.name = 'CliError';
    this.exitCode = exitCode;

    // Restore standard prototype chain for custom Error classes in TypeScript
    Object.setPrototypeOf(this, CliError.prototype);
  }
}
