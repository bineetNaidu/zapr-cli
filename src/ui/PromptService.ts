import { consola } from 'consola';
import pc from 'picocolors';

export class PromptService {
  /**
   * Prompts the user for explicit interactive confirmation before proceeding with deletion.
   */
  async confirmDeletion(count: number, formattedSize: string): Promise<boolean> {
    if (count === 0) return false;

    const answer = await consola.prompt(
      `${pc.bold(pc.cyan('?'))} Permanently delete ${pc.bold(pc.yellow(count.toString()))} target folder(s) freeing ${pc.bold(pc.green(formattedSize))}?`,
      {
        type: 'confirm',
        initial: false,
      },
    );

    return Boolean(answer);
  }
}
