#!/usr/bin/env node
// @ay-code/native-ui — copy native-first Expo UI components into your project. Zero config, zero dependencies.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const HERE = dirname(fileURLToPath(import.meta.url));
// Published package ships `registry/`; inside the repo we read `src/ui` directly.
const REGISTRY = [join(HERE, '../registry'), join(HERE, '../../src/ui')].find(existsSync);
const MANIFEST = 'component.json';
const PKG = JSON.parse(readFileSync(join(HERE, '../package.json'), 'utf8'));

const COLOR = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (open, close) => (s) => (COLOR ? `\x1b[${open}m${s}\x1b[${close}m` : String(s));
const c = { bold: paint(1, 22), dim: paint(2, 22), green: paint(32, 39), yellow: paint(33, 39), red: paint(31, 39) };

const HELP = `
${c.bold('@ay-code/native-ui')} ${c.dim(`v${PKG.version}`)} — native-first Expo UI components, copied into your project.

${c.bold('Usage')}
  npx @ay-code/native-ui add <component...>   Copy components + install their deps
  npx @ay-code/native-ui list                 Show available components
  npx @ay-code/native-ui diff <component...>  Compare your copy with the latest version

${c.bold('Options')}
  -p, --path <dir>   Target folder        ${c.dim('(default: src/ui, or ui/ without src/)')}
  -o, --overwrite    Replace existing files
  --no-install       Skip dependency install
  --dry-run          Print the plan, change nothing
  --cwd <dir>        Project root         ${c.dim('(default: current directory)')}
  -h, --help         Show help
`;

// ---------- registry ----------

function readManifest(name) {
  const file = join(REGISTRY, name, MANIFEST);
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
}

function allComponents() {
  return readdirSync(REGISTRY)
    .map(readManifest)
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Component files, relative to its folder (manifest excluded). */
function listFiles(dir, base = dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return listFiles(full, base);
    return entry === MANIFEST && dir === base ? [] : [relative(base, full)];
  });
}

/** Requested components + their registryDependencies, dependencies first. */
function resolveTree(names) {
  const ordered = [];
  const visit = (name, from) => {
    if (ordered.some((m) => m.name === name)) return;
    const manifest = readManifest(name);
    if (!manifest) fail(`Unknown component "${name}"${from ? ` (required by ${from})` : ''}. Run ${c.bold('npx @ay-code/native-ui list')}.`);
    (manifest.registryDependencies ?? []).forEach((dep) => visit(dep, name));
    ordered.push(manifest);
  };
  names.forEach((n) => visit(n));
  return ordered;
}

// ---------- project ----------

function readProject(cwd) {
  const file = join(cwd, 'package.json');
  if (!existsSync(file)) fail(`No package.json in ${cwd}. Run inside an Expo project or pass --cwd.`);
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (!deps.expo) fail('This is not an Expo project ("expo" is missing from package.json).');
  const sdk = Number(String(deps.expo).match(/\d+/)?.[0]);
  const tsconfig = join(cwd, 'tsconfig.json');
  const hasAtAlias = existsSync(tsconfig) && readFileSync(tsconfig, 'utf8').includes('"@/*"');
  return { deps, sdk, hasAtAlias };
}

function importHint(cwd, target, name, hasAtAlias) {
  const rel = relative(cwd, join(target, name)).split('\\').join('/');
  return hasAtAlias && rel.startsWith('src/') ? `@/${rel.slice(4)}` : `./${rel}`;
}

// ---------- commands ----------

function list() {
  console.log(`\n${c.bold('Available components')}\n`);
  for (const m of allComponents()) console.log(`  ${c.green(m.name.padEnd(18))} ${m.description}`);
  console.log(`\n${c.dim('npx @ay-code/native-ui add <component>')}\n`);
}

function add(names, opts) {
  const cwd = resolve(opts.cwd ?? '.');
  const project = readProject(cwd);
  const target = resolve(cwd, opts.path ?? (existsSync(join(cwd, 'src')) ? 'src/ui' : 'ui'));
  const components = resolveTree(names);
  const prefix = opts['dry-run'] ? c.yellow('[dry-run] ') : '';
  const toInstall = new Set();

  console.log();
  for (const m of components) {
    if (m.minSdk && project.sdk < m.minSdk) {
      console.log(c.yellow(`! ${m.name} is built for Expo SDK ${m.minSdk}+, this project uses SDK ${project.sdk}.`));
    }
    const dest = join(target, m.name);
    const rel = relative(cwd, dest);
    if (existsSync(dest) && !opts.overwrite) {
      console.log(`${prefix}${c.yellow('skip')}  ${rel} ${c.dim('(exists — use --overwrite)')}`);
      continue;
    }
    if (!opts['dry-run']) {
      const manifestPath = join(REGISTRY, m.name, MANIFEST);
      cpSync(join(REGISTRY, m.name), dest, { recursive: true, filter: (src) => src !== manifestPath });
    }
    console.log(`${prefix}${c.green('add')}   ${rel}`);
    (m.dependencies ?? []).filter((d) => !project.deps[d]).forEach((d) => toInstall.add(d));
  }

  if (toInstall.size > 0) {
    const cmd = ['expo', 'install', ...toInstall];
    if (opts['no-install'] || opts['dry-run']) {
      console.log(`${prefix}${c.dim('install')} npx ${cmd.join(' ')}`);
    } else {
      console.log(`\n${c.dim(`$ npx ${cmd.join(' ')}`)}`);
      const { status } = spawnSync('npx', cmd, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
      if (status !== 0) fail(`Install failed. Run it manually: npx ${cmd.join(' ')}`);
    }
  }

  console.log(`\n${c.green('✓')} Done — the code is yours, edit freely.`);
  for (const m of components) {
    console.log(`  import { … } from '${importHint(cwd, target, m.name, project.hasAtAlias)}';  ${c.dim(relative(cwd, join(target, m.name, 'README.md')))}`);
  }
  console.log();
}

function diff(names, opts) {
  const cwd = resolve(opts.cwd ?? '.');
  const target = resolve(cwd, opts.path ?? (existsSync(join(cwd, 'src')) ? 'src/ui' : 'ui'));
  const outdated = [];
  const missing = [];

  for (const m of resolveTree(names)) {
    const local = join(target, m.name);
    console.log(`\n${c.bold(m.name)} ${c.dim(relative(cwd, local))}`);
    if (!existsSync(local)) {
      console.log(`  ${c.yellow('not installed')}`);
      missing.push(m.name);
      continue;
    }
    for (const file of listFiles(join(REGISTRY, m.name))) {
      const mine = join(local, file);
      const status = !existsSync(mine)
        ? c.yellow('missing ')
        : readFileSync(mine).equals(readFileSync(join(REGISTRY, m.name, file)))
          ? c.dim('same    ')
          : c.yellow('changed ');
      if (!status.includes('same') && !outdated.includes(m.name)) outdated.push(m.name);
      console.log(`  ${status} ${file}`);
    }
  }
  console.log();
  if (outdated.length) console.log(c.dim(`Take the latest (replaces your edits): npx @ay-code/native-ui add ${outdated.join(' ')} --overwrite`));
  if (missing.length) console.log(c.dim(`Install: npx @ay-code/native-ui add ${missing.join(' ')}`));
  if (!outdated.length && !missing.length) console.log(`${c.green('✓')} Up to date.`);
  console.log();
}

// ---------- main ----------

function fail(message) {
  console.error(`\n${c.red('✗')} ${message}\n`);
  process.exit(1);
}

const { values: opts, positionals } = (() => {
  try {
    return parseArgs({
      allowPositionals: true,
      options: {
        path: { type: 'string', short: 'p' },
        cwd: { type: 'string' },
        overwrite: { type: 'boolean', short: 'o', default: false },
        'no-install': { type: 'boolean', default: false },
        'dry-run': { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    });
  } catch (error) {
    fail(`${error.message}\n${HELP}`);
  }
})();

const [command, ...names] = positionals;

if (!REGISTRY) fail('Registry not found — broken install.');
if (opts.help || !command) console.log(HELP);
else if (command === 'list' || command === 'ls') list();
else if (command === 'add' || command === 'diff') {
  if (names.length === 0) fail(`Which component? ${c.dim(`e.g. npx @ay-code/native-ui ${command} overflow-menu`)} — see ${c.bold('npx @ay-code/native-ui list')}.`);
  (command === 'add' ? add : diff)(names, opts);
} else fail(`Unknown command "${command}".\n${HELP}`);
