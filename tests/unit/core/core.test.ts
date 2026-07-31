import fs from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FolderCleaner } from '../../../src/core/cleaner/FolderCleaner.js';
import { DirectoryScanner } from '../../../src/core/scanner/DirectoryScanner.js';

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

    const exists = await fs
      .stat(path.join(TEST_DIR, 'project-a', 'node_modules'))
      .catch(() => null);
    expect(exists).not.toBeNull();
  });
});
