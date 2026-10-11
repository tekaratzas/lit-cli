import { LinearClient, Team } from '@linear/sdk';
import { RepositoryConfig } from './repositoryConfig';

type LinearApi = Pick<LinearClient, 'viewer' | 'teams' | 'project' | 'issueLabels' | 'workflowStates' | 'searchIssues' | 'createIssue' | 'updateIssue'>;

interface WorkspaceContext {
    userId: string;
    displayName: string;
    teamId: string;
    projectId?: string;
    stateId: string;
}

export class LinearWorkspace {
    private resolvedContext?: Promise<WorkspaceContext>;

    constructor(private readonly client: LinearApi, private readonly config: RepositoryConfig) {}

    async createIssue(title: string, description: string, type: string) {
        const context = await this.context();
        const labelId = await this.resolveLabel(context.teamId, type);
        const payload = await this.client.createIssue({
            title,
            description,
            teamId: context.teamId,
            projectId: context.projectId,
            assigneeId: context.userId,
            labelIds: [labelId],
        });
        const issue = await payload.issue;
        if (!payload.success || !issue) throw new Error('Failed to create Linear issue.');
        return issue;
    }

    async searchIssues(query: string) {
        const context = await this.context();
        return this.client.searchIssues(query, {
            filter: {
                team: { id: { eq: context.teamId } },
                ...(context.projectId ? { project: { id: { eq: context.projectId } } } : {}),
                state: { type: { nin: ['completed', 'canceled'] } },
            },
        });
    }

    async startIssue(issueId: string): Promise<void> {
        const context = await this.context();
        const result = await this.client.updateIssue(issueId, { stateId: context.stateId, assigneeId: context.userId });
        if (!result.success) throw new Error('Failed to start Linear issue.');
    }

    context(): Promise<WorkspaceContext> {
        return this.resolvedContext ??= this.resolveContext();
    }

    private async resolveContext(): Promise<WorkspaceContext> {
        const viewer = await this.client.viewer;
        const team = await this.resolveTeam(viewer);
        const projectId = await this.resolveProject(team.id);
        const stateId = await this.resolveState(team.id);
        return { userId: viewer.id, displayName: viewer.displayName, teamId: team.id, projectId, stateId };
    }

    private async resolveTeam(viewer: Awaited<LinearApi['viewer']>): Promise<Team> {
        const target = this.config.team?.trim();
        const teams = target
            ? await this.client.teams({ first: 2, filter: isUuid(target) ? { id: { eq: target } } : { key: { eqIgnoreCase: target } } })
            : await viewer.teams({ first: 2 });
        if (teams.nodes.length !== 1) {
            throw new Error(target ? `Cannot resolve Linear team '${target}'. Use its key or UUID.` : 'Configure a team with: lit config set team <key> --local');
        }
        return teams.nodes[0];
    }

    private async resolveProject(teamId: string): Promise<string | undefined> {
        if (!this.config.project) return undefined;
        const project = await this.client.project(projectIdentifier(this.config.project.trim()));
        const teams = await project.teams({ first: 1, filter: { id: { eq: teamId } } });
        if (teams.nodes.length === 0) throw new Error('Configured project does not belong to the selected team.');
        return project.id;
    }

    private async resolveState(teamId: string): Promise<string> {
        const filter = { team: { id: { eq: teamId } }, type: { eq: 'started' } };
        let states = await this.client.workflowStates({ first: 2, filter: { ...filter, name: { eqIgnoreCase: 'In Progress' } } });
        if (states.nodes.length === 0) states = await this.client.workflowStates({ first: 2, filter });
        if (states.nodes.length !== 1) throw new Error('Selected team needs an In Progress state or a single started workflow state.');
        return states.nodes[0].id;
    }

    private async resolveLabel(teamId: string, name: string): Promise<string> {
        const filter = { name: { eqIgnoreCase: name }, isGroup: { eq: false } };
        let labels = await this.client.issueLabels({ first: 2, filter: { ...filter, team: { id: { eq: teamId } } } });
        if (labels.nodes.length === 0) labels = await this.client.issueLabels({ first: 2, filter: { ...filter, team: { null: true } } });
        if (labels.nodes.length !== 1) throw new Error(`Expected one '${name}' label in the selected team or workspace.`);
        return labels.nodes[0].id;
    }
}

function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function projectIdentifier(value: string): string {
    if (isUuid(value) || /^[0-9a-f]{12}$/i.test(value)) return value;
    try {
        const url = new URL(value);
        const slug = url.pathname.match(/^\/[^/]+\/project\/([^/]+)(?:\/|$)/)?.[1];
        const id = slug?.match(/-([0-9a-f]{12})$/i)?.[1];
        if (url.protocol === 'https:' && url.hostname === 'linear.app' && id) return id;
    } catch {}
    throw new Error('Configure project with its UUID, short ID, or Linear project URL.');
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
