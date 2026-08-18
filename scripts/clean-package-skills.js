const fs = require('fs/promises');
const path = require('path');

// ---------------------------------------------------------------------------
// StateAdapt-specific configuration
// ---------------------------------------------------------------------------

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const DIST_LIBS_ROOT = path.join(WORKSPACE_ROOT, 'dist/libs');
const SKILLS_DIRECTORY_NAME = 'skills';

// ---------------------------------------------------------------------------

async function main() {
  const packageEntries = await fs.readdir(DIST_LIBS_ROOT, {
    withFileTypes: true,
  });
  let removedCount = 0;

  for (const packageEntry of packageEntries) {
    if (!packageEntry.isDirectory()) continue;

    const packageDirectory = path.join(DIST_LIBS_ROOT, packageEntry.name);
    const packageJsonPath = path.join(packageDirectory, 'package.json');
    let packageJson;

    try {
      packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }

    const skillsDirectory = path.join(
      packageDirectory,
      SKILLS_DIRECTORY_NAME,
    );
    const skillName = toSkillName(packageJson.name || packageEntry.name);
    const skillDirectory = path.join(skillsDirectory, skillName);

    try {
      await fs.access(skillDirectory);
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }

    await fs.rm(skillDirectory, { recursive: true, force: true });
    removedCount += 1;
    console.log(`Removed ${path.relative(WORKSPACE_ROOT, skillDirectory)}.`);

    const remainingEntries = await fs.readdir(skillsDirectory);
    if (remainingEntries.length === 0) await fs.rmdir(skillsDirectory);
  }

  console.log(`Cleaned ${removedCount} generated skill(s).`);
}

function toSkillName(packageName) {
  return packageName
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
