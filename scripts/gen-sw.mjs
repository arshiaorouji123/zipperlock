/**
 * Post-build: writes out/sw.js with a precache list of every exported file,
 * versioned by a content hash so updates roll out automatically.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const OUT = 'out';
const SKIP = [/\.txt$/, /^contact\.php$/, /^sw\.js$/, /\.htaccess$/, /\.map$/, /^og\.jpg$/, /^ads\.txt/];
const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(relative(OUT, p).split(sep).join('/'));
  }
};
walk(OUT);

const hash = createHash('sha256');
const urls = [];
for (const f of files.sort()) {
  if (SKIP.some((r) => r.test(f))) continue;
  hash.update(f).update(readFileSync(join(OUT, f)));
  // index.html → directory URL (trailingSlash export)
  if (f === 'index.html') urls.push('/');
  else if (f.endsWith('/index.html')) urls.push('/' + f.slice(0, -'index.html'.length));
  else urls.push('/' + f);
}
const version = hash.digest('hex').slice(0, 12);
const tpl = readFileSync('scripts/sw-template.js', 'utf8');
writeFileSync(join(OUT, 'sw.js'), tpl.replace('__VERSION__', version).replace('__PRECACHE__', JSON.stringify(urls)));
console.log(`sw.js: ${urls.length} files precached, version ${version}`);
