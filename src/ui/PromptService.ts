import { consola } from 'consola';
import pc from 'picocolors';

export class PromptService {
  /**
   * Prompts the user for explicit interactive confirmation before proceeding with deletion.
   */
  async confirmDeletion(count: number, formattedSize: string): Promise<boolean> {
    if (count === 0) return false;

    const answer = await consola.prompt(
      `Are you sure you want to permanently delete ${pc.yellow(count.toString())} 'node_modules' folder(s) freeing ${pc.green(formattedSize)}?`,
      {
        type: 'confirm',
        initial: false,
      },
    );

    return Boolean(answer);
  }
}
