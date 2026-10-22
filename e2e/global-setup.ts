import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

export default function globalSetup(): void {
  const root = join(__dirname, '..');
  execFileSync(
    process.execPath,
    [join(root, 'scripts', 'db.mjs'), 'rebuild', '--test'],
    { cwd: root, stdio: 'inherit' },
  );
}
