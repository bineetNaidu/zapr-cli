import fs from 'node:fs/promises';
import path from 'node:path';

export class DiskCalculator {
  /**
   * Recursively calculates the total disk size of a directory in bytes.
   */
  async calculateDirectorySize(dirPath: string): Promise<number> {
    let totalBytes = 0;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          totalBytes += await this.calculateDirectorySize(fullPath);
        } else if (entry.isFile()) {
          try {
            const stat = await fs.stat(fullPath);
            totalBytes += stat.size;
          } catch {
            // Ignore access errors on individual files
          }
        }
      }
    } catch {
      // Ignore directory access errors
    }

    return totalBytes;
  }
}
