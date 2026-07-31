import { DirectoryScanner } from './core/scanner/DirectoryScanner.js';
import { FolderCleaner } from './core/cleaner/FolderCleaner.js';
import { TerminalLogger } from './ui/TerminalLogger.js';
import { PromptService } from './ui/PromptService.js';
import { DEFAULT_EXCLUDED_FOLDERS } from './config/defaults.js';
import type { ScanOptions } from './types/index.js';
import { directoryExists, resolveAbsolutePath } from './utils/formatters.js';

import { ErrorHandler } from './errors/ErrorHandler.js';
import { SignalHandler } from './utils/SignalHandler.js';
import { InvalidPathError, PathNotFoundError } from './errors/CliError.js';

/**
 * Main application orchestrator for Cleanr.
 * 
 * Coordinates interaction between scanner engine, cleaning engine, logger, and user UI.
 * Can be instantiated directly by Node apps or invoked via CLI runner.
 */
export class CleanrApp {
  private readonly scanner: DirectoryScanner;
  private readonly cleaner: FolderCleaner;
  private readonly logger: TerminalLogger;
  private readonly promptService: PromptService;
  private readonly errorHandler: ErrorHandler;
  private readonly signalHandler: SignalHandler;

  constructor(
    scanner = new DirectoryScanner(),
    cleaner = new FolderCleaner(),
    logger = new TerminalLogger(),
    promptService = new PromptService(),
    errorHandler = new ErrorHandler(logger),
    signalHandler = new SignalHandler(),
  ) {
    this.scanner = scanner;
    this.cleaner = cleaner;
    this.logger = logger;
    this.promptService = promptService;
    this.errorHandler = errorHandler;
    this.signalHandler = signalHandler;
  }

  getErrorHandler(): ErrorHandler {
    return this.errorHandler;
  }

  /**
   * Executes a full scan and optional cleanup workflow based on provided user options.
   */
  async run(options: {
    path?: string;
    dryRun?: boolean;
    yes?: boolean;
    exclude?: string[];
  }): Promise<void> {
    this.signalHandler.register();
    this.logger.showBanner();

    if (!options.path) {
      throw new InvalidPathError('Please explicitly specify a path using --path or -p (e.g. cleanr -p ./projects)');
    }

    const resolvedPath = resolveAbsolutePath(options.path);
    const exists = await directoryExists(resolvedPath);

    if (!exists) {
      throw new PathNotFoundError(resolvedPath);
    }

    const scanOptions: ScanOptions = {
      targetPath: resolvedPath,
      dryRun: Boolean(options.dryRun),
      excludedFolders: [...DEFAULT_EXCLUDED_FOLDERS, ...(options.exclude ?? [])],
      onScanningFolder: (folderName) => this.logger.showScanningFolder(folderName),
      onSkippedFolder: (folderName) => this.logger.showSkippedFolder(folderName),
    };

    if (scanOptions.dryRun) {
      this.logger.showDryRunWarning();
    }

    this.logger.showScanningStart(resolvedPath);
    const scanResult = await this.scanner.scan(scanOptions);

    if (scanResult.totalNodeModulesCount === 0) {
      this.logger.showScanSummary(scanResult);
      return;
    }

    scanResult.targets.forEach((t) => this.logger.showDiscoveredTarget(t));
    this.logger.showScanSummary(scanResult);

    if (scanOptions.dryRun) {
      this.logger.showDryRunResults(scanResult.targets);
      return;
    }

    const shouldDelete = options.yes
      ? true
      : await this.promptService.confirmDeletion(
          scanResult.totalNodeModulesCount,
          scanResult.formattedSize,
        );

    if (!shouldDelete) {
      this.logger.showError('Deletion cancelled by user.');
      return;
    }

    this.logger.showDeletionStart(scanResult.totalNodeModulesCount);
    const cleanResult = await this.cleaner.clean(scanResult.targets, {
      dryRun: scanOptions.dryRun,
      confirm: true,
      onItemPurged: (current, total, targetPath) =>
        this.logger.showPurgedItem(current, total, targetPath),
      onItemFailed: (targetPath, errorMsg) =>
        this.logger.showPurgeError(targetPath, errorMsg),
    });

    this.logger.showDeletionSuccess(cleanResult.successCount, scanResult.formattedSize);
  }
}

// Re-export core modules for library consumer usage
export { DirectoryScanner } from './core/scanner/DirectoryScanner.js';
export { FolderCleaner } from './core/cleaner/FolderCleaner.js';
export { DiskCalculator } from './core/stats/DiskCalculator.js';
export { CliError } from './errors/CliError.js';
