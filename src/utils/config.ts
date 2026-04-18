import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import promptSync from 'prompt-sync';
import chalk from 'chalk';

const prompt = promptSync();

export interface Config {
  linearApiKey: string;
}

interface ConfigFile {
  linearApiKey?: string;
}

// Get config directory path (~/.config/lit-cli)
function getConfigDir(): string {
  const configHome = process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
  return join(configHome, 'lit-cli');
}

// Get config file path
function getConfigPath(): string {
  return join(getConfigDir(), 'config.json');
}

// Read config from file
function readConfigFile(): ConfigFile {
  try {
    const configPath = getConfigPath();
    if (!existsSync(configPath)) {
      return {};
    }
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(chalk.yellow('Warning: Failed to read config file, using defaults'));
    return {};
  }
}

// Write config to file
export function writeConfigFile(config: ConfigFile): void {
  const configDir = getConfigDir();
  const configPath = getConfigPath();

  // Create config directory if it doesn't exist
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

// Get a specific config value
export function getConfigValue(key: keyof ConfigFile): string | undefined {
  const config = readConfigFile();
  return config[key];
}

// Set a specific config value
export function setConfigValue(key: keyof ConfigFile, value: string): void {
  const config = readConfigFile();
  config[key] = value;
  writeConfigFile(config);
}

// Load config with priority: env var > config file > prompt
export function loadConfig(): Config {
  // Priority 1: Check environment variables
  let linearApiKey = process.env.LINEAR_API_KEY;

  // Priority 2: Check config file
  if (!linearApiKey) {
    linearApiKey = getConfigValue('linearApiKey');
  }

  // Priority 3: Prompt for missing values
  if (!linearApiKey) {
    console.log(chalk.yellow('\nLinear API key not found.'));
    console.log(chalk.gray('Get your API key: https://linear.app/settings/account/security'));
    console.log(chalk.gray('Set it permanently with: lit config set linear-api-key <your-key>'));
    console.log(chalk.gray('Or set the LINEAR_API_KEY environment variable.\n'));
    
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
