import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Service responsible for recursively measuring directory disk usage in bytes.
 * 
 * Performs high-speed async filesystem walks, gracefully skipping unreadable
 * or restricted files without aborting the overarching calculation process.
 */
export class DiskCalculator {
  /**
   * Recursively calculates the aggregate disk size of all files inside a given folder.
   * 
   * @param dirPath - Absolute path to the folder being measured.
   * @returns Total byte size of all accessible files contained within.
   */
  async calculateDirectorySize(dirPath: string): Promise<number> {
    let totalBytes = 0;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Recursively calculate sub-folder size
          totalBytes += await this.calculateDirectorySize(fullPath);
        } else if (entry.isFile()) {
          try {
            const stat = await fs.stat(fullPath);
            totalBytes += stat.size;
          } catch {
            // Silently ignore permissions or lock errors on individual files
          }
        }
      }
    } catch {
      // Ignore unreadable directories
    }

    return totalBytes;
  }
}
