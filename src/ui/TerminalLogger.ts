import { createConsola } from 'consola';
import pc from 'picocolors';
import type { DiscoveredTarget, ScanResult } from '../types/index.js';
import pkg from '../../package.json' with { type: 'json' };

export class TerminalLogger {
  private targetRoot = '';
  private readonly logger = createConsola({
    defaults: {
      tag: 'zapr',
    },
  });

  showBanner(): void {
    this.logger.log('');
    this.logger.log(
      `  ${pc.bold(pc.bgCyan(pc.black(' ZAPR ')))} ${pc.bold(pc.cyan('⚡ Workspace Cleaner'))} ${pc.dim(`v${pkg.version}`)}`,
    );
    this.logger.log(`  ${pc.dim('───────────────────────────────────────────────────────')}`);
  }

  showDryRunWarning(): void {
    this.logger.log(
      `\n  ${pc.bold(pc.bgYellow(pc.black(' DRY-RUN MODE ')))} ${pc.dim('Previewing only — no files will be modified or deleted.')}`,
    );
  }

  showScanningStart(path: string): void {
    this.targetRoot = path;
    this.logger.log(`\n  ${pc.cyan('🔍')} ${pc.dim('Target Root:')} ${pc.bold(pc.white(path))}\n`);
  }

  showScanningFolder(folderName: string): void {
    this.logger.log(
      `  ${pc.bold(pc.magenta('⚡ SCANNING'))} ${pc.dim('›')} ${pc.cyan(pc.bold(folderName))}`,
    );
  }

  showSkippedFolder(folderName: string): void {
    this.logger.log(`  ${pc.dim('⏭  Skipping')} ${pc.yellow(folderName)}`);
  }

  showDiscoveredTarget(target: DiscoveredTarget): void {
    const count = target.nodeModulesPaths.length;
    this.logger.log(
      `  ${pc.green('📂')} ${pc.bold(pc.white(target.folderName))} ${pc.dim(`(${count} target${count > 1 ? 's' : ''})`)}`,
    );

    target.nodeModulesPaths.forEach((path, index) => {
      const isLast = index === target.nodeModulesPaths.length - 1;
      const prefix = isLast ? '└──' : '├──';

      let relativePath = path;
      if (this.targetRoot && path.startsWith(this.targetRoot)) {
        relativePath = path.slice(this.targetRoot.length).replace(/^[/\\]/, '');
      }

      const parts = relativePath.split('/');
      const folderLabel = parts[parts.length - 1] || relativePath;
      const parentDir =
        relativePath.length > folderLabel.length ? relativePath.slice(0, -folderLabel.length) : '';

      this.logger.log(
        `     ${pc.dim(prefix)} ${pc.red('📁')} ${pc.dim(parentDir)}${pc.bold(pc.red(folderLabel))}`,
      );
    });
    this.logger.log('');
  }

  showPurgedItem(current: number, total: number, targetPath: string): void {
    const padCurrent = current.toString().padStart(total.toString().length, ' ');

    let displayPath = targetPath;
    if (this.targetRoot && targetPath.startsWith(this.targetRoot)) {
      displayPath = targetPath.slice(this.targetRoot.length).replace(/^[/\\]/, '');
    }

    this.logger.log(
      `  ${pc.green('✔')} ${pc.dim(`[${padCurrent}/${total}]`)} ${pc.white(displayPath)}`,
    );
  }

  showPurgeError(targetPath: string, errorMsg: string): void {
    this.logger.log(`  ${pc.red('✖ Failed:')} ${pc.white(targetPath)} ${pc.red(`(${errorMsg})`)}`);
  }

  showScanSummary(result: ScanResult): void {
    if (process.stdout.isTTY) {
      process.stdout.write('\r\x1b[K');
    }
    const rawTitle = 'SCAN COMPLETE';
    const rawTime = `${result.durationSeconds}s`;
    const rawL1 = 'Project Groups';
    const rawV1 = result.targets.length.toString();
    const rawL2 = 'Target Folders';
    const rawV2 = result.totalNodeModulesCount.toString();
    const rawL3 = 'Reclaimable Space';
    const rawV3 = result.formattedSize;

    const innerWidth = 41;

    const padRow = (leftRawLen: number, rightRawLen: number) => {
      return ' '.repeat(Math.max(1, innerWidth - leftRawLen - rightRawLen));
    };

    this.logger.log('');
    this.logger.log(`  ${pc.cyan('┌' + '─'.repeat(innerWidth + 2) + '┐')}`);
    this.logger.log(
      `  ${pc.cyan('│')} ${pc.bold(pc.green(rawTitle))}${padRow(rawTitle.length, rawTime.length)}${pc.dim(rawTime)} ${pc.cyan('│')}`,
    );
    this.logger.log(`  ${pc.cyan('├' + '─'.repeat(innerWidth + 2) + '┤')}`);
    this.logger.log(
      `  ${pc.cyan('│')} ${pc.dim(rawL1)}${padRow(rawL1.length, rawV1.length)}${pc.bold(pc.yellow(rawV1))} ${pc.cyan('│')}`,
    );
    this.logger.log(
      `  ${pc.cyan('│')} ${pc.dim(rawL2)}${padRow(rawL2.length, rawV2.length)}${pc.bold(pc.yellow(rawV2))} ${pc.cyan('│')}`,
    );
    this.logger.log(
      `  ${pc.cyan('│')} ${pc.dim(rawL3)}${padRow(rawL3.length, rawV3.length)}${pc.bold(pc.green(rawV3))} ${pc.cyan('│')}`,
    );
    this.logger.log(`  ${pc.cyan('└' + '─'.repeat(innerWidth + 2) + '┘')}\n`);
  }

  showDryRunResults(_targets: DiscoveredTarget[]): void {
    this.logger.log(
      `  ${pc.bold(pc.cyan('💡 Tip:'))} Pass ${pc.bold(pc.yellow('-y'))} or ${pc.bold(pc.yellow('--yes'))} to execute deletion.\n`,
    );
  }

  showDeletionStart(count: number): void {
    this.logger.log(
      `  ${pc.bold(pc.cyan('🚀 Executing deletion'))} of ${pc.bold(pc.yellow(count.toString()))} target directory(ies)...\n`,
    );
  }

  showDeletionSuccess(successCount: number, freedSize: string): void {
    this.logger.log(
      `\n  ${pc.bold(pc.bgGreen(pc.black(' SUCCESS ')))} Purged ${pc.bold(pc.yellow(successCount.toString()))} directory(ies), reclaiming ${pc.bold(pc.green(freedSize))} disk space! ⚡\n`,
    );
  }

  showError(message: string): void {
    this.logger.error(`  ${pc.dim('✖')} ${pc.red(message)}\n`);
  }
}
