#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { createRequire } from 'module';
import { postCommand } from '../src/commands/post.js';
import { listCommand } from '../src/commands/list.js';
import { cancelCommand } from '../src/commands/cancel.js';
import { statusCommand } from '../src/commands/status.js';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

// Display welcome message
console.log(
  chalk.cyan(
    figlet.textSync('Social CLI', { horizontalLayout: 'full' })
  )
);

console.log(chalk.yellow(`Social Media Content Scheduler v${packageJson.version}\n`));

// Configure CLI
program
  .name('social-cli')
  .description('CLI tool for scheduling and posting content to social media platforms')
  .version(packageJson.version);

// Add commands
program
  .command('post')
  .description('Create and schedule social media posts')
  .option('-p, --platforms <platforms>', 'Comma-separated list of platforms (facebook,instagram,telegram,linkedin)')
  .option('-c, --content <content>', 'Post content/text')
  .option('-m, --media <media>', 'Comma-separated list of media file paths')
  .option('-s, --schedule <datetime>', 'Schedule post for specific date and time (YYYY-MM-DD HH:MM)')
  .option('-i, --interactive', 'Use interactive mode')
  .action(postCommand);

program
  .command('list')
  .description('List all scheduled posts')
  .option('-p, --platform <platform>', 'Filter by platform')
  .option('-s, --status <status>', 'Filter by status (pending,completed,failed)')
  .action(listCommand);

program
  .command('cancel')
  .description('Cancel a scheduled post')
  .argument('<id>', 'Post ID to cancel')
  .action(cancelCommand);

program
  .command('status')
  .description('Check connection status for all platforms')
  .option('-p, --platform <platform>', 'Check specific platform only')
  .action(statusCommand);

// Parse command line arguments
program.parse();
