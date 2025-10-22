#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { loadConfig } from './utils/config.js';
import { checkoutCommand } from './commands/checkout.js';

async function main() {
  try {
    const program = new Command();

    program
      .name('lit')
      .description('Linear + OpenAI CLI Tool')
      .version('1.0.0');

    // Load configuration
    const config = loadConfig();

    // Register commands
    checkoutCommand(program, config);

    // Parse arguments
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  }
}

main();