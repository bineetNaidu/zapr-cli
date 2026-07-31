export interface ScanOptions {
  targetPath: string;
  dryRun: boolean;
  excludedFolders: string[];
  onScanningFolder: (folderName: string) => void;
  onSkippedFolder: (folderName: string) => void;
  onTargetDiscovered: (target: DiscoveredTarget) => void;
}

export interface CleanOptions {
  dryRun: boolean;
  confirm: boolean;
  concurrency: number;
  onItemPurged: (current: number, total: number, targetPath: string) => void;
  onItemFailed: (targetPath: string, errorMsg: string) => void;
}

export interface DiscoveredTarget {
  folderName: string;
  projectFolderPath: string;
  nodeModulesPaths: string[];
}

export interface ScanResult {
  targets: DiscoveredTarget[];
  totalNodeModulesCount: number;
  totalSizeBytes: number;
  formattedSize: string;
  durationSeconds: string;
}

export interface CleanResult {
  successCount: number;
  failedCount: number;
  totalSizeBytes: number;
  formattedSizeFreed: string;
}
