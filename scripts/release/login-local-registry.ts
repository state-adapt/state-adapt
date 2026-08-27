import fs from 'node:fs';
import path from 'node:path';

import { localRegistry, localRegistryNpmrc } from './config';

const username = 'state-adapt-release';
const password = 'local-registry-only';
const userUrl = `${localRegistry}/-/user/org.couchdb.user:${username}`;

async function main() {
  const response = await fetch(userUrl, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      _id: `org.couchdb.user:${username}`,
      name: username,
      password,
      type: 'user',
      roles: [],
      email: 'local-registry@state-adapt.invalid',
      date: new Date().toISOString(),
    }),
  });

  const result = (await response.json()) as { token?: string };
  if (!response.ok) throw new Error(JSON.stringify(result));

  fs.mkdirSync(path.dirname(localRegistryNpmrc), { recursive: true });
  fs.writeFileSync(localRegistryNpmrc, `//127.0.0.1:4873/:_authToken=${result.token}\n`, {
    mode: 0o600,
  });
  console.log('Created disposable credentials in .local-registry/npmrc.');
}

main();
