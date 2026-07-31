import { runMain } from 'citty';
import { rootCommand } from './commands/root.js';

/**
 * CLI Entrypoint definition.
 *
 * Re-exports the root command definition and provides the invocation runner helper.
 * Additional subcommands (e.g. scan, purge, config) can be hooked up via `subCommands` on `rootCommand`.
 */
export const mainCommand = rootCommand;

export const runCli = () => runMain(mainCommand);
