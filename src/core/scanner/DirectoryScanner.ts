import fs from 'node:fs/promises';
import path from 'node:path';
import type { DiscoveredTarget, ScanOptions, ScanResult } from '../../types/index.js';
import { DiskCalculator } from '../stats/DiskCalculator.js';
import { formatBytes, formatDuration, resolveAbsolutePath } from '../../utils/formatters.js';
import { TARGET_FOLDER_NAMES } from '../../config/defaults.js';
import { PathNotFoundError, PermissionError } from '../../errors/CliError.js';

/**
 * Core engine responsible for scanning workspace trees to locate target cleanup directories (node_modules + build outputs).
 *
 * Traverses file systems efficiently while respecting exclusion rules and emitting progress hooks.
 */
export class DirectoryScanner {
  private readonly diskCalculator: DiskCalculator;

  constructor(diskCalculator = new DiskCalculator()) {
    this.diskCalculator = diskCalculator;
  }

  /**
   * Scans a target root directory recursively to discover all target folders.
   *
   * @param options - Configuration including path, exclusion rules, and event callbacks.
   * @returns Detailed summary containing discovered targets, aggregate byte sizes, and duration.
   */
  async scan(options: ScanOptions): Promise<ScanResult> {
    const startTime = Date.now();
    const rootPath = resolveAbsolutePath(options.targetPath);
    const excluded = new Set(options.excludedFolders);
    const targetSet = new Set(TARGET_FOLDER_NAMES);

    const targets: DiscoveredTarget[] = [];
    let totalSizeBytes = 0;

    let topLevelEntries: import('node:fs').Dirent[] = [];

    try {
      topLevelEntries = await fs.readdir(rootPath, { withFileTypes: true });
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        throw new PathNotFoundError(rootPath);
      }
      if (code === 'EACCES' || code === 'EPERM') {
        throw new PermissionError(rootPath, 'read directory');
      }
      throw err;
    }

    // Scenario 1: Check if the specified root directory itself is a direct target container
    const rootDirectTargets = topLevelEntries.filter(
      (entry) => entry.isDirectory() && targetSet.has(entry.name),
    );

    if (rootDirectTargets.length > 0) {
      const paths = rootDirectTargets.map((e) => path.join(rootPath, e.name));
      for (const p of paths) {
        totalSizeBytes += await this.diskCalculator.calculateDirectorySize(p);
      }
      const target: DiscoveredTarget = {
        folderName: path.basename(rootPath),
        projectFolderPath: rootPath,
        nodeModulesPaths: paths,
      };
      targets.push(target);
      options.onTargetDiscovered(target);
    }

    // Scenario 2: Iterate through child directories to locate nested projects
    for (const entry of topLevelEntries) {
      if (entry.isSymbolicLink()) continue;

      if (!entry.isDirectory() || excluded.has(entry.name)) {
        if (entry.isDirectory() && excluded.has(entry.name)) {
          options.onSkippedFolder(entry.name);
        }
        continue;
      }

      if (targetSet.has(entry.name)) continue;

      options.onScanningFolder(entry.name);
      const projectFolderPath = path.join(rootPath, entry.name);
      const discoveredPaths = await this.findTargetDirectories(
        projectFolderPath,
        excluded,
        targetSet,
        options,
      );

      if (discoveredPaths.length > 0) {
        const target: DiscoveredTarget = {
          folderName: entry.name,
          projectFolderPath,
          nodeModulesPaths: discoveredPaths,
        };

        targets.push(target);
        options.onTargetDiscovered(target);

        for (const nmPath of discoveredPaths) {
          totalSizeBytes += await this.diskCalculator.calculateDirectorySize(nmPath);
        }
      }
    }

    const durationMs = Date.now() - startTime;
    const totalCount = targets.reduce((acc, curr) => acc + curr.nodeModulesPaths.length, 0);

    return {
      targets,
      totalNodeModulesCount: totalCount,
      totalSizeBytes,
      formattedSize: formatBytes(totalSizeBytes),
      durationSeconds: formatDuration(durationMs),
    };
  }

  /**
   * Helper function to recursively crawl nested folders looking for target directory matches.
   */
  private async findTargetDirectories(
    dirPath: string,
    excluded: Set<string>,
    targetSet: Set<string>,
    options: ScanOptions,
  ): Promise<string[]> {
    let foundPaths: string[] = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isSymbolicLink() || !entry.isDirectory()) continue;
        if (excluded.has(entry.name)) {
          options.onSkippedFolder(entry.name);
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);

        if (targetSet.has(entry.name)) {
          foundPaths.push(fullPath);
        } else {
          const subPaths = await this.findTargetDirectories(fullPath, excluded, targetSet, options);
          foundPaths = foundPaths.concat(subPaths);
        }
      }
    } catch {
      // Gracefully bypass permission/read errors on inaccessible subdirectories
    }

    return foundPaths;
  }
}
