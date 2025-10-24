import promptSync from 'prompt-sync';
import chalk from 'chalk';

const prompt = promptSync();

export interface Config {
  linearApiKey: string;
}

export function loadConfig(): Config {
  // Check for environment variables first
  let linearApiKey = process.env.LINEAR_API_KEY;

  // Prompt for missing values
  if (!linearApiKey) {
    linearApiKey = prompt(chalk.yellow('Linear API Key: '));
    if (!linearApiKey) {
      console.error(chalk.red('Error: Linear API Key is required'));
      process.exit(1);
    }
  }

  return {
    linearApiKey,
  };
}
