import chalk from 'chalk';
import { Command } from 'commander';
import type { Config } from '../utils/config.js';

export function checkoutCommand(program: Command, config: Config) {
  program
    .command('checkout')
    .alias('co')
    .option('-b, --branch <branch>', 'Feature branch name')
    .description('Checkout a feature branch')
    .action(async (options) => {
      if (!options.branch) {
        console.error(chalk.red('Error: Branch name is required'));
        console.log(chalk.yellow('Usage: lit checkout -b <branch-name>'));
        process.exit(1);
      }

      try {
        console.log(chalk.cyan.bold('\n🔀 Checking out branch...\n'));
        console.log(chalk.gray(`Branch: ${options.branch}`));
        console.log(chalk.gray(`Linear API Key: ${config.linearApiKey.substring(0, 5)}***`));
        console.log(chalk.gray(`OpenAI Key: ${config.openaiKey.substring(0, 5)}***\n`));

        // TODO: Add your checkout logic here
        console.log(chalk.green(`✓ Successfully checked out branch: ${options.branch}\n`));
      } catch (error) {
        console.error(chalk.red('Error during checkout:'), error);
        process.exit(1);
      }
    });
}
