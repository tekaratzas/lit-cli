import { LinearClient, User } from "@linear/sdk";

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
    const viewer = await client.viewer;
    const organization = await client.organization;
    const teams = await viewer.teams();

    const labels = await organization.labels();

    const labeled = labels.nodes.reduce((acc, label) => {
        acc[label.name] = label.id;
        return acc;
    }, {} as Record<string, string>)

    return {
        id: viewer.id,
        displayName: viewer.displayName,
        email: viewer.email,
        organizationSlug: "ter",
        organizationId: organization.id,
        teamId: teams.nodes[0].id,
        labels: labeled,
    };
}

async function getURLForIssue(client: LinearClient, issueIdentifier: string): Promise<string> {
    const issue = await client.issue(issueIdentifier);
    return issue.url;
}

export default getCurrentUserContext;