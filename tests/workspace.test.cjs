const assert = require('node:assert/strict');
const { test } = require('node:test');
const { LinearWorkspace } = require('../dist/utils/Linear');
const { linearFixture, TEAM, OTHER_TEAM, PROJECT } = require('./fixtures/linear.cjs');

test('checkout creates an issue in the configured team and project with the team label', async () => {
  const { api, calls } = linearFixture();
  const workspace = new LinearWorkspace(api, { team: 'da', project: PROJECT });
  const issue = await workspace.createIssue('Fix persistence', 'Retain state', 'Bug');
  await workspace.startIssue(issue.id);
  assert.deepEqual(calls.creates, [{ title: 'Fix persistence', description: 'Retain state', teamId: TEAM, projectId: PROJECT, assigneeId: 'user', labelIds: ['da-bug'] }]);
  assert.deepEqual(calls.updates, [{ id: 'issue', stateId: 'da-started', assigneeId: 'user' }]);
});

test('switch searches only the configured team and project, excluding completed and canceled work', async () => {
  const { api, calls } = linearFixture();
  await new LinearWorkspace(api, { team: TEAM, project: PROJECT }).searchIssues('persistence');
  assert.deepEqual(calls.searches, [{ query: 'persistence', filter: { team: { id: { eq: TEAM } }, project: { id: { eq: PROJECT } }, state: { type: { nin: ['completed', 'canceled'] } } } }]);
});

test('accepts a Linear project URL and validates its team membership', async () => {
  const { api } = linearFixture();
  const context = await new LinearWorkspace(api, { team: 'DA', project: 'https://linear.app/terse-inc/project/durable-actors-bb3798f5c3f1/issues' }).context();
  assert.equal(context.projectId, PROJECT);
});

test('uses a workspace label only when the selected team has no matching label', async () => {
  const { api, calls, data } = linearFixture();
  data.labels = data.labels.filter(label => label.team !== TEAM);
  await new LinearWorkspace(api, { team: 'DA' }).createIssue('Fix', '', 'bug');
  assert.deepEqual(calls.creates[0].labelIds, ['global-bug']);
});

test('supports a custom started-state name in the selected team', async () => {
  const { api, calls, data } = linearFixture();
  data.states[1].name = 'Building';
  await new LinearWorkspace(api, { team: 'DA' }).startIssue('issue');
  assert.equal(calls.updates[0].stateId, 'da-started');
});

test('a single membership works without repository targeting', async () => {
  const { api, data } = linearFixture();
  data.teams = data.teams.filter(team => team.id === TEAM);
  assert.equal((await new LinearWorkspace(api, {}).context()).teamId, TEAM);
});

for (const [name, config, change, pattern] of [
  ['multiple teams without configuration', {}, () => {}, /configure.*team/i],
  ['unknown configured team', { team: 'MISSING' }, () => {}, /team/i],
  ['unknown project', { team: 'DA', project: 'missing' }, () => {}, /project/i],
  ['project outside the team', { team: 'DA', project: PROJECT }, data => { data.projectTeams = [OTHER_TEAM]; }, /project.*team/i],
  ['missing applicable label', { team: 'DA' }, data => { data.labels = data.labels.filter(label => label.team === OTHER_TEAM); }, /label/i],
  ['ambiguous team labels', { team: 'DA' }, data => { data.labels.push({ id: 'duplicate', name: 'bug', team: TEAM }); }, /label/i],
  ['missing team started state', { team: 'DA' }, data => { data.states = data.states.filter(state => state.team !== TEAM); }, /state/i],
  ['ambiguous custom started states', { team: 'DA' }, data => { data.states[1].name = 'Building'; data.states.push({ id: 'review', name: 'Review', type: 'started', team: TEAM }); }, /state/i],
  ['a non-Linear project URL', { team: 'DA', project: 'https://example.com/team/project/test-bb3798f5c3f1' }, () => {}, /project/i],
]) {
  test(`rejects ${name} before mutating Linear`, async () => {
    const { api, calls, data } = linearFixture();
    change(data);
    await assert.rejects(new LinearWorkspace(api, config).createIssue('Fix', '', 'Bug'), pattern);
    assert.deepEqual(calls.creates, []);
    assert.deepEqual(calls.updates, []);
  });
}
