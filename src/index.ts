import { DirectoryScanner } from './core/DirectoryScanner.js';
import { FolderCleaner } from './core/FolderCleaner.js';
import { TerminalLogger } from './ui/TerminalLogger.js';
import { PromptService } from './ui/PromptService.js';
import { DEFAULT_EXCLUDED_FOLDERS } from './constants/defaults.js';
import type { ScanOptions } from './types/index.js';
import { directoryExists, resolveAbsolutePath } from './utils/formatters.js';

export class CleanrApp {
  private readonly scanner: DirectoryScanner;
  private readonly cleaner: FolderCleaner;
  private readonly logger: TerminalLogger;
  private readonly promptService: PromptService;

  constructor(
    scanner = new DirectoryScanner(),
    cleaner = new FolderCleaner(),
    logger = new TerminalLogger(),
    promptService = new PromptService(),
  ) {
    this.scanner = scanner;
    this.cleaner = cleaner;
    this.logger = logger;
    this.promptService = promptService;
  }

  async run(options: {
    path?: string;
    dryRun?: boolean;
    yes?: boolean;
    exclude?: string[];
  }): Promise<void> {
    this.logger.showBanner();

    if (!options.path) {
      this.logger.showError('Error: Please explicitly specify a path using --path or -p (e.g. cleanr -p ./projects)');
      process.exit(1);
    }

    const resolvedPath = resolveAbsolutePath(options.path);
    const exists = await directoryExists(resolvedPath);

    if (!exists) {
      this.logger.showError(`Error: Specified directory path does not exist: ${resolvedPath}`);
      process.exit(1);
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
