import { LinearClient, User } from "@linear/sdk";

export type UserContext = {
    id: string;
    organizationId: string;
    displayName: string;
    email: string;
    teamId: string;
};

async function getCurrentUserContext(client: LinearClient): Promise<UserContext> {
    const viewer = await client.viewer;
    const organization = await client.organization;
    const teams = await viewer.teams();

    return {
        id: viewer.id,
        displayName: viewer.displayName,
        email: viewer.email,
        organizationId: organization.id,
        teamId: teams.nodes[0].id,
    };
}

export default getCurrentUserContext;