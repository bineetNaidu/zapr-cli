import { CliError } from './CliError.js';
import type { TerminalLogger } from '../ui/TerminalLogger.js';

export class ErrorHandler {
  private readonly logger: TerminalLogger;

  constructor(logger: TerminalLogger) {
    this.logger = logger;
  }

  handle(error: unknown, debug = false): number {
    if (error instanceof CliError) {
      this.logger.showError(error.message);
      return error.exitCode;
    }

    if (error instanceof Error) {
      const isDev = process.env.NODE_ENV === 'development' || debug;
      if (isDev && error.stack) {
        this.logger.showError(`Unexpected Error: ${error.message}\n${error.stack}`);
      } else {
        this.logger.showError(`An unexpected error occurred: ${error.message}`);
      }
      return 1;
    }

    this.logger.showError('An unknown error occurred.');
    return 1;
  }
}
