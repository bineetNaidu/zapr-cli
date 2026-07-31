export abstract class CliError extends Error {
  public abstract readonly exitCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class PathNotFoundError extends CliError {
  public readonly exitCode = 1;

  constructor(path: string) {
    super(`Specified directory path does not exist: ${path}`);
  }
}

export class InvalidPathError extends CliError {
  public readonly exitCode = 1;

  constructor(message: string) {
    super(message);
  }
}

export class PermissionError extends CliError {
  public readonly exitCode = 1;

  constructor(targetPath: string, action: string) {
    super(`Permission denied while trying to ${action}: ${targetPath}`);
  }
}

export class ProcessInterruptedError extends CliError {
  public readonly exitCode = 130;

  constructor() {
    super('Operation interrupted by user (Ctrl+C). Partial operations may remain.');
  }
}
