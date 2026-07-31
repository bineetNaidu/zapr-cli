import fs from 'node:fs/promises';
import type { CleanOptions, CleanResult, DiscoveredTarget } from '../types/index.js';
import { formatBytes } from '../utils/formatters.js';

export class FolderCleaner {
  /**
   * Safely deletes discovered node_modules directories, adhering strictly to dry-run logic.
   */
  async clean(targets: DiscoveredTarget[], options: CleanOptions): Promise<CleanResult> {
    const allPaths = targets.flatMap((t) => t.nodeModulesPaths);
    let successCount = 0;
    let failedCount = 0;

    if (options.dryRun || allPaths.length === 0) {
      return {
        successCount: 0,
        failedCount: 0,
        totalSizeBytes: 0,
        formattedSizeFreed: formatBytes(0),
      };
    }

    let completed = 0;

    await Promise.all(
      allPaths.map(async (targetPath) => {
        try {
          await fs.rm(targetPath, { recursive: true, force: true });
          successCount++;
          completed++;
          options.onItemPurged?.(completed, allPaths.length, targetPath);
        } catch (err) {
          failedCount++;
          const message = err instanceof Error ? err.message : 'Unknown error';
          options.onItemFailed?.(targetPath, message);
        }
      }),
    );

    return {
      successCount,
      failedCount,
      totalSizeBytes: 0,
      formattedSizeFreed: formatBytes(0),
    };
  }
}
