// Prepares a throwaway stage for recording a Worktabs demo, then starts the installed Worktabs on it.
// Everything lives in C:\wt-demo (a short path: long ones break the webview cache). The everyday
// Worktabs, its data, and the real repositories are not touched or shown.
// usage: node demo-stage.js [--locale en|ja] [--setup-only]
const { execFileSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\wt-demo';
const MARK = path.join(ROOT, '.worktabs-demo');
const DATA = path.join(ROOT, 'data');
const CONFIG = path.join(ROOT, 'config.json');
const EXE = path.join(process.env.LOCALAPPDATA, 'Programs', 'Worktabs', 'Worktabs.exe');
const PORT = 39871;

const argument = (name, fallback) => {
  const at = process.argv.indexOf(name);
  return at < 0 ? fallback : process.argv[at + 1];
};
const locale = argument('--locale', 'en');

const webApp = {
  'README.md': '# web-app\n\nA small example web app.\n',
  'package.json': `${JSON.stringify({ name: 'web-app', version: '1.0.0', private: true, scripts: { test: 'node --test' } }, null, 2)}\n`,
  'src/theme.js': `// The color theme: the saved choice, or the OS's when there is none.
const STORAGE_KEY = 'theme';

export function currentTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.dataset.theme = theme;
}
`,
  'src/settings/page.js': `// The settings page.
export function renderSettings(root, user) {
  root.innerHTML = \`
    <h1>Settings</h1>
    <section>
      <label>Display name <input name="name" value="\${user.name}"></label>
      <label>Email <input name="email" value="\${user.email}"></label>
    </section>
  \`;
}
`,
  'src/auth/redirect.js': `// Where to send a user after they sign in.
function afterSignIn(next) {
  return '/';
}

module.exports = { afterSignIn };
`,
  'test/redirect.test.js': `const assert = require('node:assert');
const test = require('node:test');
const { afterSignIn } = require('../src/auth/redirect.js');

test('returns to the page the user came from', () => {
  assert.strictEqual(afterSignIn('/settings'), '/settings');
});

test('goes home without a page to return to', () => {
  assert.strictEqual(afterSignIn(undefined), '/');
});

test('does not leave the site', () => {
  assert.strictEqual(afterSignIn('https://example.com/'), '/');
});
`,
};

const apiServer = {
  'README.md': '# api-server\n\nA small example API server.\n',
  'package.json': `${JSON.stringify({ name: 'api-server', version: '1.0.0', private: true, scripts: { test: 'node --test' } }, null, 2)}\n`,
  'src/server.js': `const http = require('node:http');
const { handlePublic } = require('./routes/public.js');

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/public/')) return handlePublic(req, res);
  res.writeHead(404).end();
});

if (require.main === module) server.listen(3000);
module.exports = { server };
`,
  'src/routes/public.js': `// The routes anyone can call, without signing in.
function handlePublic(req, res) {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ path: req.url, time: Date.now() }));
}

module.exports = { handlePublic };
`,
  'test/public.test.js': `const assert = require('node:assert');
const test = require('node:test');
const { handlePublic } = require('../src/routes/public.js');

test('answers with the path', () => {
  let body = '';
  handlePublic({ url: '/public/ping' }, { writeHead() {}, end(text) { body = text; } });
  assert.strictEqual(JSON.parse(body).path, '/public/ping');
});
`,
};

function git(cwd, ...args) {
  execFileSync('git', args, { cwd, stdio: 'pipe' });
}

function makeRepo(name, files, branches) {
  const repo = path.join(ROOT, name);
  fs.mkdirSync(repo, { recursive: true });
  git(repo, 'init', '-q', '-b', 'main');
  // Local to the demo repositories: no real name or address goes into their commits.
  git(repo, 'config', 'user.name', 'Demo');
  git(repo, 'config', 'user.email', 'demo@example.com');
  for (const [file, text] of Object.entries(files)) {
    const target = path.join(repo, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
  }
  git(repo, 'add', '-A');
  git(repo, 'commit', '-q', '-m', 'Initial commit');
  const folders = branches.map((branch) => {
    const folder = path.join(ROOT, `${name}-${branch.replace(/\//g, '-')}`);
    git(repo, 'worktree', 'add', '-q', folder, '-b', branch);
    return folder;
  });
  return { repo, folders };
}

function setup() {
  if (fs.existsSync(ROOT)) {
    if (!fs.existsSync(MARK)) throw new Error(`${ROOT} exists and is not a stage made by this script; not touching it`);
    console.log(`using the existing stage in ${ROOT}`);
    return;
  }
  fs.mkdirSync(ROOT);
  fs.writeFileSync(MARK, 'A stage for recording a Worktabs demo. Safe to delete.\n');
  makeRepo('web-app', webApp, ['feat/dark-mode', 'fix/login-redirect']);
  makeRepo('api-server', apiServer, ['feat/rate-limits']);
  fs.mkdirSync(DATA);
  // Bottom right of the 2560 x 1440 display, so that a notification toast lands inside the recording.
  fs.writeFileSync(path.join(DATA, 'window.json'), JSON.stringify({ x: 960, y: 430, width: 1600, height: 960, maximized: false }));
}

function writeConfig() {
  fs.writeFileSync(CONFIG, `${JSON.stringify({
    repos: ['C:/wt-demo/web-app', 'C:/wt-demo/api-server'],
    // Nothing from ghq, WSL, or the GitHub account: only the two repositories above are listed.
    repoSources: [],
    unclonedRepos: false,
    updateCheck: false,
    locale,
    // Edits go through and commands ask, so that a conversation stops for approval at a natural moment.
    permissionMode: 'acceptEdits',
    idleSuspendMinutes: 0,
    // Wider than the default 260, so that the conversations' titles show in the recording.
    sidebarWidth: 340,
  }, null, 2)}\n`);
}

function start() {
  if (!fs.existsSync(EXE)) throw new Error(`not found: ${EXE}`);
  // This may run inside the everyday Worktabs, whose hook values and ELECTRON_RUN_AS_NODE must not leak in.
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^(ELECTRON_|WORKTABS_)/i.test(key)));
  Object.assign(env, { WORKTABS_DATA_DIR: DATA, WORKTABS_CONFIG: CONFIG, WORKTABS_CONTROL_PORT: String(PORT) });
  spawn(EXE, [], { env, detached: true, stdio: 'ignore' }).unref();
  console.log(`started ${EXE}\ndata: ${DATA}\ncontrol port: ${PORT}`);
}

setup();
writeConfig();
if (!process.argv.includes('--setup-only')) start();
