import { Command } from 'commander';
import chalk from 'chalk';
import { setConfigValue, getConfigValue } from '../utils/config';
import { readRepositoryConfig, repositoryConfigPath, RepositoryConfig, setRepositoryConfigValue } from '../utils/repositoryConfig';

export function configCommand(program: Command) {
  const config = program.command('config').description('Manage lit-cli configuration');

  config.command('set <key> <value>')
    .description('Set a configuration value')
    .option('--local', 'Store team or project in the repository .lit.json')
    .action((key: string, value: string, options: { local?: boolean }) => {
      if (options.local) {
        const path = setRepositoryConfigValue(localKey(key), value);
        console.log(chalk.green(`✓ Successfully set ${key}`));
        console.log(chalk.gray(`Config stored at: ${path}`));
      } else {
        requireGlobalKey(key);
        setConfigValue('linearApiKey', value);
        console.log(chalk.green(`✓ Successfully set ${key}`));
      }
    });

  config.command('get <key>')
    .description('Get a configuration value')
    .option('--local', 'Read repository configuration')
    .action((key: string, options: { local?: boolean }) => {
      const value = options.local ? readRepositoryConfig()[localKey(key)] : globalValue(key);
      console.log(value ? `${key}: ${value}` : `${key} is not set`);
    });

  config.command('list')
    .description('List configuration values')
    .option('--local', 'List repository configuration')
    .action((options: { local?: boolean }) => {
      if (options.local) {
        const values = readRepositoryConfig();
        for (const key of ['team', 'project'] as const) console.log(`${key}: ${values[key] ?? '(not set)'}`);
        console.log(`Config file: ${repositoryConfigPath() ?? '(not in a Git repository)'}`);
      } else {
        const value = getConfigValue('linearApiKey');
        console.log(`linear-api-key: ${value ? value.slice(0, 8) + '...' + value.slice(-4) : '(not set)'}`);
      }
    });
}

function localKey(key: string): keyof RepositoryConfig {
  if (key !== 'team' && key !== 'project') {
    throw new Error('Local configuration accepts team and project only. Store API keys without --local.');
  }
  return key;
}

function globalValue(key: string): string | undefined {
  requireGlobalKey(key);
  return getConfigValue('linearApiKey');
}

function requireGlobalKey(key: string): void {
  if (key !== 'linear-api-key') throw new Error('Use --local to configure team or project; the user configuration accepts linear-api-key only.');
}
