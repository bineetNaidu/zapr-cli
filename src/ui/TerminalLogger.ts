import { createConsola } from 'consola';
import pc from 'picocolors';
import type { DiscoveredTarget, ScanResult } from '../types/index.js';

export class TerminalLogger {
  private readonly logger = createConsola({
    defaults: {
      tag: 'cleanr',
    },
  });

  showBanner(): void {
    this.logger.log(`\n  ${pc.bold(pc.bgCyan(pc.black(' cleanr ')))} ${pc.dim('v1.0.0')}\n`);
  }

  showDryRunWarning(): void {
    this.logger.info(
      `${pc.yellow(pc.bold('DRY-RUN MODE'))} ${pc.dim('— No files will be modified or deleted.')}`,
    );
  }

  showScanningStart(path: string): void {
    this.logger.info(`Scanning directory ${pc.cyan(path)}\n`);
  }

  showScanningFolder(folderName: string): void {
    this.logger.log(`  ${pc.dim('›')} Scanning ${pc.cyan(folderName)}...`);
  }

  showSkippedFolder(folderName: string): void {
    this.logger.log(`  ${pc.dim('⏭')} Skipping ${pc.yellow(folderName)}`);
  }

  showDiscoveredTarget(target: DiscoveredTarget): void {
    const count = target.nodeModulesPaths.length;
    this.logger.log(
      pc.greenBright(
        `  ${pc.green('✔')} Discovered in ${pc.bold(target.folderName)} ${pc.dim(`(${count} folder${count > 1 ? 's' : ''})`)}`,
      ),
    );
    target.nodeModulesPaths.forEach((path) => {
      this.logger.log(`    ${pc.dim('↳ ' + path)}`);
    });
  }

  showPurgedItem(current: number, total: number, targetPath: string): void {
    const padCurrent = current.toString().padStart(total.toString().length, ' ');
    this.logger.log(
      `  ${pc.dim(`[${padCurrent}/${total}]`)} ${pc.green('✔ Purged:')} ${pc.dim(targetPath)}`,
    );
  }

  showPurgeError(targetPath: string, errorMsg: string): void {
    this.logger.log(`  ${pc.red('✖ Failed:')} ${pc.dim(targetPath)} ${pc.red(`(${errorMsg})`)}`);
  }

  showScanSummary(result: ScanResult): void {
    this.logger.log('');
    this.logger.success(pc.bold(`Scan complete in ${pc.cyan(result.durationSeconds + 's')}`));
    this.logger.log(
      `  ${pc.dim('•')} Target Folders : ${pc.yellow(result.totalNodeModulesCount.toString())} target directories`,
    );
    this.logger.log(
      `  ${pc.dim('•')} Project Groups : ${pc.yellow(result.targets.length.toString())} projects`,
    );
    this.logger.log(
      `  ${pc.dim('•')} Reclaimable   : ${pc.bold(pc.green(result.formattedSize))}\n`,
    );
  }

  showDryRunResults(targets: DiscoveredTarget[]): void {
    const allPaths = targets.flatMap((t) => t.nodeModulesPaths);
    this.logger.info(pc.bold('Dry-run preview summary:'));
    allPaths.forEach((p) => this.logger.log(`  ${pc.dim('• ' + p)}`));
    this.logger.log(
      `\n  ${pc.dim('💡 Tip: Pass')} ${pc.cyan('-y')} ${pc.dim('or')} ${pc.cyan('--yes')} ${pc.dim('to execute deletion.')}\n`,
    );
  }

  showDeletionStart(count: number): void {
    this.logger.info(
      `Starting parallel deletion of ${pc.yellow(count.toString())} directory(ies)...\n`,
    );
  }

  showDeletionSuccess(successCount: number, freedSize: string): void {
    this.logger.success(
      `Cleanup completed! Successfully purged ${pc.yellow(successCount.toString())} directory(ies), freeing ${pc.bold(pc.green(freedSize))}.\n`,
    );
  }

  showError(message: string): void {
    this.logger.error(pc.red(message));
  }
}
