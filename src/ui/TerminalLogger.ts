import { createConsola } from 'consola';
import pc from 'picocolors';
import type { DiscoveredTarget, ScanResult } from '../types/index.js';

export class TerminalLogger {
  private readonly logger = createConsola();

  showBanner(): void {
    this.logger.log(pc.bold(pc.cyan('\n>>> NODE_MODULES SCANNER & CLEANER\n')));
  }

  showDryRunWarning(): void {
    this.logger.warn(pc.bold(pc.yellow('[DRY-RUN MODE ENABLED - No files will be deleted]')));
  }

  showScanningStart(path: string): void {
    this.logger.info(`${pc.bold('Scanning directory:')} ${pc.magenta(path)}`);
  }

  showDiscoveredTarget(target: DiscoveredTarget): void {
    this.logger.log(
      `  ${pc.green('✔ Detected')} in ${pc.bold(target.folderName)}: ${pc.dim(target.nodeModulesPaths.join(', '))}`,
    );
  }

  showScanSummary(result: ScanResult): void {
    this.logger.success(
      `\n${pc.bold('Scan complete')} in ${pc.cyan(result.durationSeconds + 's')}! ` +
        `Found ${pc.yellow(result.totalNodeModulesCount.toString())} 'node_modules' folder(s) ` +
        `across ${pc.yellow(result.targets.length.toString())} project(s). ` +
        `Total reclaimable space: ${pc.bold(pc.green(result.formattedSize))}\n`,
    );
  }

  showDryRunResults(targets: DiscoveredTarget[]): void {
    const allPaths = targets.flatMap((t) => t.nodeModulesPaths);
    this.logger.info(pc.bold(pc.yellow('Dry-run finished. Directories that would be removed:')));
    allPaths.forEach((p) => this.logger.log(`  ${pc.dim('- ' + p)}`));
  }

  showDeletionStart(count: number): void {
    this.logger.start(pc.bold(pc.red(`⚠️ Starting Parallel Deletion (${count} folders)...`)));
  }

  showDeletionSuccess(successCount: number, freedSize: string): void {
    this.logger.success(
      `\n${pc.bold(pc.green('🎉 Cleanup completed!'))} ` +
        `Successfully purged ${pc.yellow(successCount.toString())} directory(ies), freeing ${pc.bold(pc.green(freedSize))}.\n`,
    );
  }

  showError(message: string): void {
    this.logger.error(pc.red(message));
  }
}
