const assert = require('node:assert/strict');
const { test } = require('node:test');
const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');

const cli = resolve(__dirname, '../dist/index.js');
const configModule = resolve(__dirname, '../dist/utils/config.js');

function repository(t) {
  const root = mkdtempSync(join(tmpdir(), 'lit-config-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q', root]);
  mkdirSync(join(root, 'src'));
  const env = { ...process.env, XDG_CONFIG_HOME: join(root, 'user-config'), LINEAR_API_KEY: 'test-api-key' };
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { cwd: join(root, 'src'), env, encoding: 'utf8' });
  const load = () => spawnSync(process.execPath, ['-e', `console.log(JSON.stringify(require(${JSON.stringify(configModule)}).loadConfig()))`], { cwd: join(root, 'src'), env, encoding: 'utf8' });
  return { root, run, load };
}

test('local settings are written at the Git root and loaded from subdirectories', t => {
  const { root, run, load } = repository(t);
  assert.equal(run('config', 'set', 'team', 'DA', '--local').status, 0);
  assert.equal(run('config', 'set', 'project', 'bb3798f5c3f1', '--local').status, 0);
  assert.deepEqual(JSON.parse(readFileSync(join(root, '.lit.json'))), { team: 'DA', project: 'bb3798f5c3f1' });
  assert.deepEqual(JSON.parse(load().stdout), { linearApiKey: 'test-api-key', team: 'DA', project: 'bb3798f5c3f1' });
  assert.match(run('config', 'get', 'team', '--local').stdout, /DA/);
  assert.match(run('config', 'list', '--local').stdout, /bb3798f5c3f1/);
  assert.equal(existsSync(join(root, 'src', '.lit.json')), false);
});

test('local configuration never stores API keys', t => {
  const { root, run } = repository(t);
  const result = run('config', 'set', 'linear-api-key', 'test-secret', '--local');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /team|project|api.key/i);
  assert.equal(existsSync(join(root, '.lit.json')), false);
});

test('team and project configuration requires explicit local scope', t => {
  const { root, run } = repository(t);
  assert.notEqual(run('config', 'set', 'team', 'DA').status, 0);
  assert.equal(existsSync(join(root, 'user-config', 'lit-cli', 'config.json')), false);
});

for (const content of ['{', '{"team":123}', '{"team":" "}', '{"linearApiKey":"secret"}', '[]']) {
  test(`rejects invalid repository configuration: ${content}`, t => {
    const { root, load } = repository(t);
    writeFileSync(join(root, '.lit.json'), content);
    const result = load();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /\.lit\.json/);
    assert.doesNotMatch(result.stderr, /secret/);
  });
}

test('local configuration requires a Git repository', t => {
  const { root, run } = repository(t);
  rmSync(join(root, '.git'), { recursive: true });
  const result = run('config', 'set', 'team', 'DA', '--local');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /git repository/i);
});

test('a linked worktree reads its own committed repository configuration', t => {
  const { root } = repository(t);
  writeFileSync(join(root, '.lit.json'), JSON.stringify({ team: 'DA' }));
  execFileSync('git', ['-C', root, 'add', '.lit.json']);
  execFileSync('git', ['-C', root, '-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-qm', 'Configure team']);
  const worktree = join(root, 'linked');
  execFileSync('git', ['-C', root, 'worktree', 'add', '-qb', 'linked', worktree]);
  const result = spawnSync(process.execPath, [cli, 'config', 'get', 'team', '--local'], { cwd: worktree, encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /DA/);
});

test('switching repositories does not inherit the previous repository destination', t => {
  const first = repository(t);
  const second = repository(t);
  first.run('config', 'set', 'team', 'DA', '--local');
  second.run('config', 'set', 'team', 'TER', '--local');
  assert.equal(JSON.parse(first.load().stdout).team, 'DA');
  assert.equal(JSON.parse(second.load().stdout).team, 'TER');
});
