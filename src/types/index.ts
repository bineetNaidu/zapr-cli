export interface ScanOptions {
  targetPath: string;
  dryRun: boolean;
  excludedFolders: string[];
}

export interface CleanOptions {
  dryRun: boolean;
  confirm: boolean;
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
