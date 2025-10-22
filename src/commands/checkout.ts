import { IssuePayload, LinearClient } from '@linear/sdk';
import OpenAI from 'openai';
import chalk from 'chalk';
import { Command } from 'commander';
import type { Config } from '../utils/config.js';
import getCurrentUserContext from '../utils/LinearUserContext.js';
import { generateBranchName } from '../utils/branchName.js';
import { createAndCheckoutBranch, GitError, checkForSafeGitStatus } from '../utils/git.js';

export function checkoutCommand(program: Command, config: Config) {
  program
    .command('checkout')
    .alias('co')
    .option('-b, --branch <branch>', 'Feature branch name')
    .description('Checkout a feature branch')
    .action(async (options) => {
      if (!options.branch) {
        console.error(chalk.red('Error: Branch name is required'));
        console.log(chalk.yellow('Usage: lit checkout -b <branch-name>'));
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

        const branchNameProcessed = await processBranchName(options.branch, config.openaiKey);

        console.log(chalk.green(`✓ Title: ${branchNameProcessed.title}`));
        console.log(chalk.green(`✓ Description: ${branchNameProcessed.description}`));
        console.log(chalk.green(`✓ Issue Type: ${branchNameProcessed.issueType}`));
        console.log(chalk.green(`✓ Team ID: ${userContext.teamId}`));
        console.log(chalk.green(`✓ Assignee ID: ${userContext.id}`));
        console.log(chalk.green(`✓ Label IDs: ${userContext.labels[branchNameProcessed.issueType]}`));

        const issuePayload: IssuePayload = await client.createIssue({
          title: branchNameProcessed.title,
          description: branchNameProcessed.description,
          teamId: userContext.teamId,
          assigneeId: userContext.id,
          labelIds: [userContext.labels[branchNameProcessed.issueType]],
        });

        const issue = await issuePayload.issue;

        if (!issue) {
          console.error(chalk.red('Error: Failed to create ticket'));
          return;
        }

        const issueId = issue.id;
        const issueTitle = issue.title;
        const gitBranchName = generateBranchName(userContext.displayName, issueId, userContext.organizationSlug, issueTitle);

        console.log(chalk.green(`✓ Successfully created ticket: ${issue.title}`));
        console.log(chalk.green(`✓ Successfully created ticket: ${issue.description}`));
        console.log(chalk.cyan(`\n🌳 Git branch name: ${gitBranchName}`));

        // Attempt to create and checkout the git branch
        try {
          console.log(chalk.blue('\n📦 Creating and checking out git branch...\n'));
          createAndCheckoutBranch(gitBranchName);
          console.log(chalk.green(`\n✓ Successfully checked out branch: ${gitBranchName}\n`));
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

// Goal is to use branch name to generate a ticket title and description
// Send whatever is in the branch name to the LLM to generate a ticket title and description

enum IssueType {
  Feature = 'Feature',
  Bug = 'Bug',
  improvement = 'improvement',
}
interface BranchNameProcessed {
  title: string;
  description: string;
  issueType: IssueType;
}

async function processBranchName(
  branchName: string,
  openaiKey: string
): Promise<BranchNameProcessed> {
  const openai = new OpenAI({ apiKey: openaiKey });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `You are a helpful assistant that processes branch names and generates a ticket title, description, and issue type.
            The branch name is: ${branchName}
            Generate a JSON response with the following structure:
            {
              "title": "short title",
              "description": "detailed description",
              "issueType": "Feature" | "Bug" | "improvement"
            }
            Respond ONLY with valid JSON, no markdown formatting.`,
      },
    ],
  });

  const content = response.choices[0].message.content || '{}';

  try {
    const parsed = JSON.parse(content);
    return {
      title: parsed.title || branchName,
      description: parsed.description || '',
      issueType: parsed.issueType || IssueType.Feature,
    };
  } catch (error) {
    console.error(chalk.red('Error: Failed to parse OpenAI response, using defaults'));
    process.exit(1);
  }
}
