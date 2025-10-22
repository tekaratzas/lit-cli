import promptSync from 'prompt-sync';
import chalk from 'chalk';

const prompt = promptSync();

export interface Config {
  linearApiKey: string;
  openaiKey: string;
}

export function loadConfig(): Config {
  console.log(chalk.blue.bold('\n🔧 CLI Configuration\n'));

  // Check for environment variables first
  let linearApiKey = process.env.LINEAR_API_KEY;
  let openaiKey = process.env.OPENAI_KEY;

  // Prompt for missing values
  if (!linearApiKey) {
    linearApiKey = prompt(chalk.yellow('Linear API Key: '));
    if (!linearApiKey) {
      console.error(chalk.red('Error: Linear API Key is required'));
      process.exit(1);
    }
  }

  if (!openaiKey) {
    openaiKey = prompt(chalk.yellow('OpenAI API Key: '));
    if (!openaiKey) {
      console.error(chalk.red('Error: OpenAI API Key is required'));
      process.exit(1);
    }
  }

  console.log(chalk.green('✓ Configuration loaded successfully\n'));

  return {
    linearApiKey,
    openaiKey,
  };
}
