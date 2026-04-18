import { Command } from 'commander';
import chalk from 'chalk';
import { setConfigValue, getConfigValue } from '../utils/config';

export function configCommand(program: Command) {
  const config = program
    .command('config')
    .description('Manage lit-cli configuration');

  config
    .command('set <key> <value>')
    .description('Set a configuration value')
    .action((key: string, value: string) => {
      const validKeys = ['linear-api-key'];
      
      if (!validKeys.includes(key)) {
        console.error(chalk.red(`Error: Invalid config key '${key}'`));
        console.log(chalk.yellow(`Valid keys: ${validKeys.join(', ')}`));
        process.exit(1);
      }

      // Map CLI keys to internal config keys
      const keyMap: { [key: string]: 'linearApiKey' } = {
        'linear-api-key': 'linearApiKey',
      };

      const internalKey = keyMap[key];
      
      try {
        setConfigValue(internalKey, value);
        console.log(chalk.green(`✓ Successfully set ${key}`));
        console.log(chalk.gray(`Config stored at: ~/.config/lit-cli/config.json`));
      } catch (error) {
        console.error(chalk.red('Error setting config:'), error);
        process.exit(1);
      }
    });

  config
    .command('get <key>')
    .description('Get a configuration value')
    .action((key: string) => {
      const validKeys = ['linear-api-key'];
      
      if (!validKeys.includes(key)) {
        console.error(chalk.red(`Error: Invalid config key '${key}'`));
        console.log(chalk.yellow(`Valid keys: ${validKeys.join(', ')}`));
        process.exit(1);
      }

      const keyMap: { [key: string]: 'linearApiKey' } = {
        'linear-api-key': 'linearApiKey',
      };

      const internalKey = keyMap[key];
      const value = getConfigValue(internalKey);

      if (value) {
        console.log(chalk.cyan(`${key}:`), value);
      } else {
        console.log(chalk.yellow(`${key} is not set`));
      }
    });

  config
    .command('list')
    .description('List all configuration values')
    .action(() => {
      const keys: Array<'linearApiKey'> = ['linearApiKey'];
      const displayNames = {
        linearApiKey: 'linear-api-key',
      };

      console.log(chalk.bold('\nConfiguration:'));
      keys.forEach(key => {
        const value = getConfigValue(key);
        const displayName = displayNames[key];
        if (value) {
          // Mask the API key for security
          const maskedValue = value.substring(0, 8) + '...' + value.substring(value.length - 4);
          console.log(chalk.cyan(`  ${displayName}:`), maskedValue);
        } else {
          console.log(chalk.cyan(`  ${displayName}:`), chalk.gray('(not set)'));
        }
      });
      console.log(chalk.gray('\nConfig file: ~/.config/lit-cli/config.json\n'));
    });
}
