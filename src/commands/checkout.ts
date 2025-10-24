import { IssuePayload, LinearClient } from '@linear/sdk';
import chalk from 'chalk';
import { Command } from 'commander';
import type { Config } from '../utils/config';
import getCurrentUserContext, { getURLForIssue } from '../utils/Linear';
import { generateBranchName } from '../utils/branchName';
import { createAndCheckoutBranch, GitError, checkForSafeGitStatus } from '../utils/git';

function mapIssueType(type: string | undefined): string {
  if (!type) return 'Feature';

  const typeMap: { [key: string]: string } = {
    'b': 'Bug',
    'bug': 'Bug',
    'i': 'improvement',
    'improvement': 'improvement',
    'f': 'Feature',
    'feature': 'Feature',
  };

  const mapped = typeMap[type.toLowerCase()];
  if (!mapped) {
    console.error(chalk.red('Error: Invalid issue type. Must be one of: b/bug, i/improvement, f/feature'));
    process.exit(1);
  }
  return mapped;
}

export function checkoutCommand(program: Command, config: Config) {
  program
    .command('checkout')
    .alias('co')
    .option('-b, --branch <branch>', 'Feature branch name')
    .option('-d, --description <description>', 'Issue description')
    .option('-t, --type <type>', 'Issue type: b/bug, i/improvement, f/feature')
    .description('Create a new Linear issue and checkout a feature branch')
    .action(async (options) => {
      if (!options.branch) {
        console.error(chalk.red('Error: Branch name is required'));
        console.log(chalk.yellow('Usage: lit checkout -b <branch-name> [-d <description>] [-t b|i|f]'));
        process.exit(1);
      }

      if (!checkForSafeGitStatus()) {
        console.error(chalk.red('Error: Git is not installed or not found in PATH. Please install Git to continue.'));
        return;
      }

      try {
        const client = new LinearClient({
          apiKey: config.linearApiKey,
        });

        const userContext = await getCurrentUserContext(client);

        // Remove surrounding quotes if they were included in the argument value
        let title = options.branch.replace(/^["']|["']$/g, '');
        const description = options.description || '';
        const issueType = mapIssueType(options.type);

        const issuePayload: IssuePayload = await client.createIssue({
          title: title,
          description: description,
          teamId: userContext.teamId,
          assigneeId: userContext.id,
          labelIds: [userContext.labels[issueType]],
        });

        const issue = await issuePayload.issue;

        if (!issue) {
          console.error(chalk.red('Error: Failed to create ticket'));
          return;
        }

        const issueTitle = issue.title;
        const issueIdentifier = issue.identifier;
        const gitBranchName = generateBranchName(userContext.displayName, issueIdentifier, issueTitle);

        console.log(chalk.green(`✓ Successfully created ticket: ${issue.identifier} - ${issue.title}`));
        
        const ticketUrl = await getURLForIssue(client, issue.identifier);
        // Use ANSI OSC 8 escape codes for clickable links - keep separate from chalk
        console.log(chalk.gray('\nTicket URL:'));
        console.log(`\u001b]8;;${ticketUrl}\u001b\\${ticketUrl}\u001b]8;;\u001b\\`);

        // Attempt to create and checkout the git branch
        try {
          createAndCheckoutBranch(gitBranchName);
        } catch (gitError) {
          if (gitError instanceof GitError) {
            console.error(chalk.red(`\n✗ Git Error: ${gitError.message}\n`));
          } else {
            throw gitError;
          }
        }
      } catch (error) {
        console.error(chalk.red('Error during checkout:'), error);
        process.exit(1);
      }
    });
}

