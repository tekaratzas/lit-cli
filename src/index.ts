#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { loadConfig } from './utils/config';
import { checkoutCommand } from './commands/checkout';
import { switchCommand } from './commands/switch';
import { commitCommand } from './commands/commit';
import { configCommand } from './commands/config';

async function main() {
  try {
    const program = new Command();

    program
      .name('lit')
      .description('Linear + Git in one CLI')
      .version('1.0.0');

    // Register config command (doesn't need config loaded)
    configCommand(program);

    // Register commands with lazy config loading
    // Config will only be loaded when these commands are actually executed
    checkoutCommand(program, loadConfig);
    switchCommand(program, loadConfig);
    commitCommand(program, loadConfig);
    
    // Parse arguments
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  }
}

main();