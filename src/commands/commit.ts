import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';
import { Config } from '../utils/config';
import { execSync } from 'child_process';
import { LinearClient } from '@linear/sdk';
import { getIssueIdentifierFromBranch } from '../utils/Linear';
import { getCurrentBranch } from '../utils/git';

export function commitCommand(program: Command, config: Config) {
    program
        .command('commit <message...>')
        .alias('cm')
        .description('Commit the current changes to the current branch and leave a comment on the Linear issue')
        .action(async (messageParts: string[]) => {
            if (!messageParts || messageParts.length === 0) {
                console.error(chalk.red('Error: Message is required'));
                console.log(chalk.yellow('Usage: lit commit <message>'));
                process.exit(1);
            }

            const message = messageParts.join(' ');

            const commitSpinner = ora('Committing changes...').start();

            try {
                const client = new LinearClient({
                    apiKey: config.linearApiKey,
                });

                const currentBranch = getCurrentBranch();
                const issueIdentifier = getIssueIdentifierFromBranch(currentBranch);

                if (!issueIdentifier) {
                    commitSpinner.fail('Failed to find issue');
                    console.error(chalk.red('Error during commit:'), 'Issue identifier not found in branch name');
                    process.exit(1);
                }

                const issue = await client.issue(issueIdentifier);
                if (!issue) {
                    commitSpinner.fail('Failed to find issue');
                    console.error(chalk.red('Error during commit:'), 'Issue not found');
                    process.exit(1);
                }

                // Now that we have the issue, leave a comment with the message from the commit
                await client.createComment({
                    issueId: issue.id,
                    body: message,
                });

                commitSpinner.succeed(`Commented on issue: ${issue.title}`);

            } catch (error) {
                commitSpinner.fail('Failed to create Linear client');
                console.error(chalk.red('Error during commit:'), error);
                process.exit(1);
            }

            try {
                execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
            } catch (error) {
                commitSpinner.fail('Failed to commit changes');
                console.error(chalk.red('Error during commit:'), error);
                process.exit(1);
            }
        });
}