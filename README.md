# zapr ⚡

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Build](https://img.shields.io/badge/Build-unbuild-cyan.svg)](https://github.com/unjs/unbuild)
[![Testing](https://img.shields.io/badge/Testing-Vitest-green.svg)](https://vitest.dev/)
[![Linter](https://img.shields.io/badge/Linter-Oxlint-orange.svg)](https://oxc.rs/)
[![License](https://img.shields.io/badge/License-Blue_Oak_1.0.0-blueviolet.svg)](./LICENSE)

Blazing fast, class-based, object-oriented CLI tool to scan and purge `node_modules` and heavy build outputs (`dist`, `build`, `.next`, `.nuxt`, `coverage`) across your projects to reclaim precious disk space.

---

## ⚡ Quick Start

Run directly using `npx`:

```bash
npx zapr -p ./projects
```

---

## 🚀 Features

- **Object-Oriented Architecture**: Modular, SOLID, class-based design (`DirectoryScanner`, `FolderCleaner`, `DiskCalculator`, `TerminalLogger`).
- **Multi-Target Cleanup**: Cleans `node_modules` as well as build artifacts (`dist`, `build`, `.next`, `.nuxt`, `coverage`) out of the box.
- **Real-Time Discovery**: Streams project folder discoveries as it crawls your workspace in real-time.
- **Safety First (Dry Run & Confirmation)**: Supports test runs (`-d` / `--dry-run`) and interactive deletion confirmation prompts.
- **Concurrency Capped Purging**: Employs an internal worker queue pool (`concurrentMap`) to prevent OS file descriptor limits (`EMFILE`) during heavy folder purges.
- **Symlink Protection**: Automatically ignores symbolic links (`isSymbolicLink()`) to prevent circular loops or double-counting in monorepos (`pnpm`/`yarn`/`bun`).
- **Nuxt/Nuxi CLI Aesthetic**: Pristine, readable terminal reporting with soft badges, clean metrics, and itemized progress updates.
- **Strict Type Safety**: Written in 100% strict TypeScript with zero `any` types.

---

## 🛠️ CLI Options

| Flag            | Short | Description                                              | Default |
| :-------------- | :---- | :------------------------------------------------------- | :------ |
| `--path`        | `-p`  | **(Required)** Path to directory root to scan            | _None_  |
| `--dry-run`     | `-d`  | Preview scan results and disk space without deleting     | `false` |
| `--yes`         | `-y`  | Skip interactive prompt and execute deletion immediately | `false` |
| `--exclude`     | `-e`  | Comma-separated folder names to skip scanning            | `[]`    |
| `--concurrency` | `-c`  | Maximum concurrent directory purges                      | `5`     |
| `--debug`       |       | Enable verbose error stack traces                        | `false` |

---

## 💡 Usage Examples

### Preview reclaimable space without deleting (Dry-Run):

```bash
npx zapr -p ./workspaces -d
```

### Delete immediately without confirmation prompts:

```bash
npx zapr -p ./workspaces -y
```

### Exclude specific directories:

```bash
npx zapr -p ./workspaces -e "archive,temp-projects"
```

---

## 📦 Programmatic Library API

`zapr` can also be imported directly into your Node.js TypeScript projects:

```typescript
import { ZaprApp, DirectoryScanner, FolderCleaner } from 'zapr';

const app = new ZaprApp();

await app.run({
  path: './my-workspace',
  dryRun: true,
  yes: false,
  exclude: ['vendor'],
});
```

---

## 📄 License

Licensed under the [Blue Oak Model License 1.0.0](./LICENSE).
