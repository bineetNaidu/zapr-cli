import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { DirectoryScanner } from '../../../src/core/scanner/DirectoryScanner.js';
import { FolderCleaner } from '../../../src/core/cleaner/FolderCleaner.js';

const TEST_DIR = path.resolve('./temp-test-workspace');

describe('DirectoryScanner & FolderCleaner', () => {
  beforeEach(async () => {
    await fs.mkdir(path.join(TEST_DIR, 'project-a', 'node_modules'), { recursive: true });
    await fs.mkdir(path.join(TEST_DIR, 'project-b', 'node_modules'), { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  it('scans and discovers node_modules folders', async () => {
    const scanner = new DirectoryScanner();
    const dummyCallbacks = {
      onScanningFolder: () => {},
      onSkippedFolder: () => {},
      onTargetDiscovered: () => {},
    };

    const result = await scanner.scan({
      targetPath: TEST_DIR,
      dryRun: true,
      excludedFolders: [],
      ...dummyCallbacks,
    });

    expect(result.totalNodeModulesCount).toBe(2);
    expect(result.targets.length).toBe(2);
  });

  it('respects dry-run flag during cleaning', async () => {
    const scanner = new DirectoryScanner();
    const cleaner = new FolderCleaner();

    const dummyCallbacks = {
      onScanningFolder: () => {},
      onSkippedFolder: () => {},
      onTargetDiscovered: () => {},
    };

    const result = await scanner.scan({
      targetPath: TEST_DIR,
      dryRun: true,
      excludedFolders: [],
      ...dummyCallbacks,
    });

    await cleaner.clean(result.targets, {
      dryRun: true,
      concurrency: 5,
      onItemPurged: () => {},
      onItemFailed: () => {},
    });

    const exists = await fs.stat(path.join(TEST_DIR, 'project-a', 'node_modules')).catch(() => null);
    expect(exists).not.toBeNull();
  });
});
