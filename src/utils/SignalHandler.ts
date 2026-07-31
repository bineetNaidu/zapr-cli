import { ProcessInterruptedError } from '../errors/CliError.js';

export class SignalHandler {
  private isRegistered = false;
  private cleanupCallback?: () => void;

  register(onInterrupt?: () => void): void {
    if (this.isRegistered) return;
    this.isRegistered = true;
    this.cleanupCallback = onInterrupt;

    const handleSignal = () => {
      this.cleanupCallback?.();
      const error = new ProcessInterruptedError();
      console.log(`\n⚠️  ${error.message}`);
      process.exit(error.exitCode);
    };

    process.once('SIGINT', handleSignal);
    process.once('SIGTERM', handleSignal);
  }
}
