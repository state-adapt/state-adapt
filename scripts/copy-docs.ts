import { promises as fs } from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// adjust these two paths to match your workspace layout
// ---------------------------------------------------------------------------

// Where VitePress emitted the static site
const SRC = path.resolve(__dirname, '../apps/docs2/.vitepress/dist');
// Local clone of <user>.github.io
const DEST = path.resolve(__dirname, '../../state-adapt.github.io');

// Root‑level folders to keep intact in DEST\ n

const ROOT_KEEP = new Set(['.git', 'versions', 'v']);

// ---------------------------------------------------------------------------

async function rmIfExists(target: string) {
  try {
    await fs.rm(target, { recursive: true, force: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }
}

async function copyRecursive(srcDir: string, destDir: string) {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyRecursive(src, dest);
    } else if (entry.isFile()) {
      await fs.copyFile(src, dest);
    }
  }
}

async function syncDocs() {
  // 1. Clean unprotected items from DEST root
  const destEntries = await fs.readdir(DEST, { withFileTypes: true });
  for (const entry of destEntries) {
    if (ROOT_KEEP.has(entry.name)) continue;
    await rmIfExists(path.join(DEST, entry.name));
  }

  // 2. Copy root of SRC → DEST (skip /v for now)
  const srcEntries = await fs.readdir(SRC, { withFileTypes: true });
  for (const entry of srcEntries) {
    if (entry.name === 'v') continue;
    const srcPath = path.join(SRC, entry.name);
    const destPath = path.join(DEST, entry.name);
    await rmIfExists(destPath);
    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }

  // 3. Sync each version folder inside /v
  const srcV = path.join(SRC, 'v');
  try {
    const versions = await fs.readdir(srcV, { withFileTypes: true });
    await fs.mkdir(path.join(DEST, 'v'), { recursive: true });
    for (const entry of versions) {
      if (!entry.isDirectory()) continue;
      const srcVersion = path.join(srcV, entry.name);
      const destVersion = path.join(DEST, 'v', entry.name);
      await rmIfExists(destVersion);
      await copyRecursive(srcVersion, destVersion);
    }
  } catch (err) {
    // if src/v doesn't exist, nothing to do
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }

  console.log('✅ Docs synced to GitHub Pages repo');
}

syncDocs().catch(err => {
  console.error('❌ syncDocs failed:', err);
  process.exit(1);
});
