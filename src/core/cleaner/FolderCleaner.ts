import fs from 'node:fs/promises';
import type { CleanOptions, CleanResult, DiscoveredTarget } from '../../types/index.js';
import { formatBytes } from '../../utils/formatters.js';

/**
 * Service responsible for executing deletion of targeted node_modules folders.
 * 
 * Implements strict dry-run safeguards and emits real-time progress callbacks
 * as purge operations succeed or encounter permission issues.
 */
export class FolderCleaner {
  /**
   * Safely deletes discovered target directories in parallel.
   * 
   * @param targets - Discovered projects and their node_modules directory paths.
   * @param options - Execution flags (e.g. dryRun) and event notification callbacks.
   */
  async clean(targets: DiscoveredTarget[], options: CleanOptions): Promise<CleanResult> {
    const allPaths = targets.flatMap((t) => t.nodeModulesPaths);
    let successCount = 0;
    let failedCount = 0;

    // Fast-exit if running in dry-run mode or if no targets exist
    if (options.dryRun || allPaths.length === 0) {
      return {
        successCount: 0,
        failedCount: 0,
        totalSizeBytes: 0,
        formattedSizeFreed: formatBytes(0),
      };
    }

    let completed = 0;

    // Purge target directories asynchronously
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
