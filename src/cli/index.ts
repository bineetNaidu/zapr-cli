import { defineCommand, runMain } from 'citty';
import { CleanrApp } from '../index.js';

export const mainCommand = defineCommand({
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
  },
  async run({ args }) {
    const excludeList = args.exclude ? args.exclude.split(',').map((s) => s.trim()) : [];
    const app = new CleanrApp();
    await app.run({
      path: args.path,
      dryRun: args['dry-run'],
      yes: args.yes,
      exclude: excludeList,
    });
  },
});

export const runCli = () => runMain(mainCommand);
