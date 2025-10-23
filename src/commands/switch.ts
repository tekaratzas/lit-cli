import { Command } from "commander";
import { Config } from "../utils/config";
import chalk from "chalk";
import { Issue, LinearClient } from "@linear/sdk";
import getCurrentUserContext from "../utils/LinearUserContext";
import inquirer from 'inquirer';
import { generateBranchName } from "../utils/branchName";
import { createAndCheckoutBranch } from "../utils/git";


interface IssueDetails {
    identifier: string;
    title: string;
}

// This will work like a search function for linear issues.
// If we we find 1 strong match, assign the issue to the current user (if not already done so) mark as in progress. then checkout the branch (with the right name)
// If multiple matches, will need to disambiguate first
export function switchCommand(program: Command, config: Config) {
    program
        .command('switch')
        .alias('sw')
        .description('')
        .action(async (options) => {
            if (!options.issueDescriton) {
                console.error(chalk.red('Error: Branch name is required'));
                console.log(chalk.yellow('Usage: lit checkout -b <branch-name>'));
                process.exit(1);
            }

            const client = new LinearClient({
                apiKey: config.linearApiKey,
            });

            const userContext = await getCurrentUserContext(client);

            const issues = await client.searchIssues(options.issueDescription);

            const issueDetails: IssueDetails[] = await issues.nodes.map(issue => ({
                identifier: issue.identifier,
                title: issue.title,
            }));

            const issue = await disambiguateIssues(issueDetails);

            if (!issue) {
                console.error(chalk.red('Error: unable to find issue'));
                process.exit(1);
            }

            // get branch name from issue
            const branchName = generateBranchName(userContext.displayName, issue.identifier, userContext.organizationSlug, issue.title);

            // checkout branch
            createAndCheckoutBranch(branchName);
        })
}

async function disambiguateIssues(issues: IssueDetails[]): Promise<IssueDetails> {
    // Need to ask user for input here to chose which ticket to use
    if (issues.length === 0) {
        throw new Error(`No issues matches.`);
    }
    if (issues.length === 1) {
        return issues[0];
    }

    const { choice } = await inquirer.prompt<{ choice: IssueDetails }>([
        {
            type: 'list',
            name: 'choice',
            message: `Select issue:`,
            choices: issues.map(issue => issue.identifier + ' - ' + issue.title)
        }
    ]);
    return choice;
}