import fs from 'node:fs/promises';
import path from 'node:path';
import type { DiscoveredTarget, ScanOptions, ScanResult } from '../types/index.js';
import { DiskCalculator } from './DiskCalculator.js';
import { formatBytes, formatDuration, resolveAbsolutePath } from '../utils/formatters.js';

export class DirectoryScanner {
  private readonly diskCalculator: DiskCalculator;

  constructor(diskCalculator = new DiskCalculator()) {
    this.diskCalculator = diskCalculator;
  }

  /**
   * Scans a target path recursively for target node_modules directories.
   */
  async scan(options: ScanOptions): Promise<ScanResult> {
    const startTime = Date.now();
    const rootPath = resolveAbsolutePath(options.targetPath);
    const excluded = new Set(options.excludedFolders);

    const targets: DiscoveredTarget[] = [];
    let totalSizeBytes = 0;

    const topLevelEntries = await fs.readdir(rootPath, { withFileTypes: true });

    // Check if the root directory itself contains node_modules directly
    const rootNodeModules = topLevelEntries.find(
      (entry) => entry.isDirectory() && entry.name === 'node_modules',
    );

    if (rootNodeModules) {
      const nmPath = path.join(rootPath, 'node_modules');
      const size = await this.diskCalculator.calculateDirectorySize(nmPath);
      totalSizeBytes += size;
      targets.push({
        folderName: path.basename(rootPath),
        projectFolderPath: rootPath,
        nodeModulesPaths: [nmPath],
      });
    }

    for (const entry of topLevelEntries) {
      if (!entry.isDirectory() || excluded.has(entry.name)) {
        if (entry.isDirectory() && excluded.has(entry.name)) {
          options.onSkippedFolder?.(entry.name);
        }
        continue;
      }

      if (entry.name === 'node_modules') continue;

      options.onScanningFolder?.(entry.name);
      const projectFolderPath = path.join(rootPath, entry.name);
      const discoveredPaths = await this.findNodeModules(projectFolderPath, excluded, options);

      if (discoveredPaths.length > 0) {
        targets.push({
          folderName: entry.name,
          projectFolderPath,
          nodeModulesPaths: discoveredPaths,
        });

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
   * Recursively crawl directories to discover node_modules folders while skipping excluded names.
   */
  private async findNodeModules(
    dirPath: string,
    excluded: Set<string>,
    options: ScanOptions,
  ): Promise<string[]> {
    let foundPaths: string[] = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (excluded.has(entry.name)) {
          options.onSkippedFolder?.(entry.name);
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);

        if (entry.name === 'node_modules') {
          foundPaths.push(fullPath);
        } else {
          const subPaths = await this.findNodeModules(fullPath, excluded, options);
          foundPaths = foundPaths.concat(subPaths);
        }
      }
    } catch {
      // Ignore directory read/permission errors
    }

    return foundPaths;
  }
}
