#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { createRequire } from 'module';
import { postCommand } from '../commands/post.js';
import { statusCommand } from '../commands/status.js';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json');

// Display welcome message
console.log(
  chalk.cyan(
    figlet.textSync('Social CLI', { horizontalLayout: 'full' })
  )
);

console.log(chalk.yellow(`Social Media CLI v${packageJson.version}\n`));

// Configure CLI
program
  .name('social-cli')
  .description('CLI tool for posting content to social media platforms')
  .version(packageJson.version);

// Add commands
program
  .command('post')
  .description('Create and post social media content')
  .option('-p, --platforms <platforms>', 'Comma-separated list of platforms (facebook,instagram,telegram,linkedin) or "all"')
  .option('-c, --content <content>', 'Post content/text')
  .option('-m, --media <files...>', 'Media file paths (images/videos from your device)')
  .option('-i, --interactive', 'Use interactive mode with multi-select options')
  .action(postCommand);

program
  .command('status')
  .description('Check connection status for all platforms')
  .option('-p, --platform <platform>', 'Check specific platform only')
  .action(statusCommand);

// Parse command line arguments
program.parse();
