#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { loadConfig } from './utils/config.js';
import { checkoutCommand } from './commands/checkout.js';
import { switchCommand } from './commands/switch.js';

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

    // Parse arguments
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  }
}

main();