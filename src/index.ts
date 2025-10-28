#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { loadConfig } from './utils/config';
import { checkoutCommand } from './commands/checkout';
import { switchCommand } from './commands/switch';
import { commitCommand } from './commands/commit';

async function main() {
  try {
    const program = new Command();

    program
      .name('lit')
      .description('Linear + Git in one CLI')
      .version('1.0.0');

    // Load configuration
    const config = loadConfig();

    // Register commands
    checkoutCommand(program, config);
    switchCommand(program, config);
    commitCommand(program, config);
    // Parse arguments
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  }
}

main();