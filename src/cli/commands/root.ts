import { defineCommand } from 'citty';
import { CleanrApp } from '../../index.js';

/**
 * Root/default command handler for `cleanr`.
 *
 * Handles argument parsing, option resolution, and delegates execution
 * to the core `CleanrApp` orchestrator.
 */
export const rootCommand = defineCommand({
  meta: {
    name: 'cleanr',
    version: '1.0.0',
    description: 'Blazing fast, class-based node_modules cleaner CLI tool',
  },
  args: {
    path: {
      type: 'string',
      alias: 'p',
      description: 'Explicit path to directory root to scan',
      required: true,
    },
    'dry-run': {
      type: 'boolean',
      alias: 'd',
      description: 'Perform a test scan without deleting files',
      default: false,
    },
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Skip confirmation prompts and delete immediately',
      default: false,
    },
    exclude: {
      type: 'string',
      alias: 'e',
      description: 'Folder name(s) to skip scanning (comma-separated)',
    },
    concurrency: {
      type: 'string',
      alias: 'c',
      description: 'Maximum concurrent directory purges (Default: 5)',
      default: '5',
    },
    debug: {
      type: 'boolean',
      description: 'Enable verbose error stack traces',
      default: false,
    },
  },
  async run({ args }) {
    const excludeList = args.exclude ? args.exclude.split(',').map((s) => s.trim()) : [];
    const concurrencyNum = parseInt(args.concurrency, 10) || 5;
    const app = new CleanrApp();

    try {
      await app.run({
        path: args.path,
        dryRun: args['dry-run'],
        yes: args.yes,
        exclude: excludeList,
        concurrency: concurrencyNum,
      });
    } catch (err: unknown) {
      const exitCode = app.getErrorHandler().handle(err, args.debug);
      process.exit(exitCode);
    }
  },
});
