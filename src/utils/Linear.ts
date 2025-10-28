import { LinearClient, User } from "@linear/sdk";
import ora from "ora";

export type UserContext = {
    id: string;
    organizationId: string;
    organizationSlug: string;
    displayName: string;
    email: string;
    teamId: string;
    labels: Record<string, string>;
};

async function getCurrentUserContext(client: LinearClient): Promise<UserContext> {
    const spinner = ora("Fetching Linear user context...").start();

    try {
        const viewer = await client.viewer;
        const organization = await client.organization;
        const teams = await viewer.teams();

        const labels = await organization.labels();

        const labeled = labels.nodes.reduce((acc, label) => {
            acc[label.name] = label.id;
            return acc;
        }, {} as Record<string, string>)

        spinner.succeed("User context loaded");

        return {
            id: viewer.id,
            displayName: viewer.displayName,
            email: viewer.email,
            organizationSlug: "ter",
            organizationId: organization.id,
            teamId: teams.nodes[0].id,
            labels: labeled,
        };
    } catch (error) {
        spinner.fail("Failed to fetch user context");
        throw error;
    }
}

export async function getURLForIssue(client: LinearClient, issueIdentifier: string): Promise<string> {
    const spinner = ora(`Fetching URL for issue ${issueIdentifier}...`).start();

    try {
        const issue = await client.issue(issueIdentifier);
        spinner.succeed(`Issue URL retrieved`);
        return issue.url;
    } catch (error) {
        spinner.fail(`Failed to fetch issue ${issueIdentifier}`);
        throw error;
    }
}

// Expected format: username/ISSUE-123-description
// We need to extract "ISSUE-123" from the branch name
export function getIssueIdentifierFromBranch(branch: string): string | null {
    if (!branch || typeof branch !== 'string') {
        return null;
    }
    
    const parts = branch.split('/');
    if (parts.length < 2) {
        // Branch doesn't have a '/' separator
        return null;
    }
    
    const afterSlash = parts[1];
    if (!afterSlash) {
        return null;
    }
    
    const dashParts = afterSlash.split('-');
    if (dashParts.length < 2) {
        // No issue identifier format found (needs at least PROJECT-NUMBER)
        return null;
    }
    
    // Return PROJECT-NUMBER (e.g., "ISSUE-123")
    const identifier = `${dashParts[0]}-${dashParts[1]}`;
    
    if (!identifier || identifier === '-') {
        return null;
    }
    
    return identifier;
}

export default getCurrentUserContext;