// prepack: snapshot ../src/ui into ./registry (the published component sources) and validate manifests.
import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, '../src/ui');
const registry = join(root, 'registry');

rmSync(registry, { recursive: true, force: true });
cpSync(source, registry, { recursive: true });
cpSync(join(root, '../LICENSE'), join(root, 'LICENSE'));

const names = readdirSync(registry);
for (const name of names) {
  const file = join(registry, name, 'component.json');
  if (!existsSync(file)) throw new Error(`${name}: missing component.json`);
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  if (manifest.name !== name) throw new Error(`${name}: component.json "name" must be "${name}"`);
  for (const dep of manifest.registryDependencies ?? []) {
    if (!names.includes(dep)) throw new Error(`${name}: unknown registryDependency "${dep}"`);
  }
}
console.log(`registry: ${names.length} components (${names.join(', ')})`);
