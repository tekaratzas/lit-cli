const TEAM = '11111111-1111-4111-8111-111111111111';
const OTHER_TEAM = '22222222-2222-4222-8222-222222222222';
const PROJECT = '33333333-3333-4333-8333-333333333333';

function linearFixture() {
  const calls = { creates: [], updates: [], searches: [] };
  const data = {
    teams: [{ id: OTHER_TEAM, key: 'TER' }, { id: TEAM, key: 'DA' }],
    projectTeams: [TEAM],
    labels: [
      { id: 'other-bug', name: 'Bug', team: OTHER_TEAM },
      { id: 'global-bug', name: 'Bug', team: null },
      { id: 'da-bug', name: 'Bug', team: TEAM },
    ],
    states: [
      { id: 'other-started', name: 'In Progress', type: 'started', team: OTHER_TEAM },
      { id: 'da-started', name: 'In Progress', type: 'started', team: TEAM },
    ],
  };
  const connection = nodes => ({ nodes });
  const api = {
    viewer: Promise.resolve({ id: 'user', displayName: 'dev', teams: async () => connection(data.teams) }),
    teams: async ({ filter }) => connection(data.teams.filter(team =>
      filter.id ? team.id === filter.id.eq : team.key.toLowerCase() === filter.key.eqIgnoreCase.toLowerCase())),
    project: async id => {
      if (id !== PROJECT && id !== 'bb3798f5c3f1') throw new Error('Project not found');
      return { id: PROJECT, teams: async ({ filter }) => connection(data.projectTeams.filter(id => id === filter.id.eq).map(id => ({ id }))) };
    },
    issueLabels: async ({ filter }) => connection(data.labels.filter(label =>
      label.name.toLowerCase() === filter.name.eqIgnoreCase.toLowerCase() &&
      (filter.team.null ? label.team === null : label.team === filter.team.id.eq))),
    workflowStates: async ({ filter }) => connection(data.states.filter(state =>
      state.team === filter.team.id.eq && state.type === filter.type.eq &&
      (!filter.name || state.name.toLowerCase() === filter.name.eqIgnoreCase.toLowerCase()))),
    searchIssues: async (query, options) => { calls.searches.push({ query, ...options }); return connection([]); },
    createIssue: async input => {
      calls.creates.push(input);
      return { success: true, issue: Promise.resolve({ id: 'issue', identifier: 'DA-1', title: input.title, url: 'https://linear.app/example/issue/DA-1' }) };
    },
    updateIssue: async (id, input) => { calls.updates.push({ id, ...input }); return { success: true }; },
  };
  return { api, calls, data };
}

module.exports = { linearFixture, TEAM, OTHER_TEAM, PROJECT };
