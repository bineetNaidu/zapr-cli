import { describe, expect, it, vi } from 'vitest';
import { PathNotFoundError, ProcessInterruptedError } from '../../../src/errors/CliError.js';
import { ErrorHandler } from '../../../src/errors/ErrorHandler.js';
import type { TerminalLogger } from '../../../src/ui/TerminalLogger.js';

describe('ErrorHandler', () => {
  const mockLogger = {
    showError: vi.fn(),
  } as unknown as TerminalLogger;

  it('handles custom CliError with user-friendly output and exit code', () => {
    const handler = new ErrorHandler(mockLogger);
    const error = new PathNotFoundError('/invalid/path');

    const exitCode = handler.handle(error);

    expect(exitCode).toBe(1);
    expect(mockLogger.showError).toHaveBeenCalledWith(
      'Specified directory path does not exist: /invalid/path',
    );
  });

  it('handles ProcessInterruptedError with 130 exit code', () => {
    const handler = new ErrorHandler(mockLogger);
    const error = new ProcessInterruptedError();

    const exitCode = handler.handle(error);

    expect(exitCode).toBe(130);
    expect(mockLogger.showError).toHaveBeenCalledWith(
      'Operation interrupted by user (Ctrl+C). Partial operations may remain.',
    );
  });
});
