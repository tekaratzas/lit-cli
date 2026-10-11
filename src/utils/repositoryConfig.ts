import { execFileSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface RepositoryConfig {
  team?: string;
  project?: string;
}

export function readRepositoryConfig(): RepositoryConfig {
  const path = repositoryConfigPath();
  return path ? readConfig(path) : {};
}

export function setRepositoryConfigValue(key: keyof RepositoryConfig, value: string): string {
  const path = repositoryConfigPath();
  if (!path) throw new Error('Local configuration requires a Git repository.');
  const config = { ...readConfig(path), [key]: value.trim() };
  validateConfig(config);
  writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
  return path;
}

export function repositoryConfigPath(): string | undefined {
  try {
    const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    return join(root, '.lit.json');
  } catch {
    return undefined;
  }
}

function readConfig(path: string): RepositoryConfig {
  if (!existsSync(path)) return {};
  let config: unknown;
  try {
    config = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    throw new Error(`Cannot read ${path}: expected valid JSON.`);
  }
  validateConfig(config);
  return config;
}

function validateConfig(config: unknown): asserts config is RepositoryConfig {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('.lit.json must be an object with optional team and project strings.');
  }
  for (const [key, value] of Object.entries(config)) {
    if (!['team', 'project'].includes(key) || typeof value !== 'string' || !value.trim()) {
      throw new Error('.lit.json accepts only non-empty team and project strings. Store API keys in user configuration.');
    }
  }
}
