import { Rule, SchematicContext, Tree, chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { Schema } from './schema';

const version = '^2.0.0';
const corePackages = ['@state-adapt/core', '@state-adapt/rxjs', '@state-adapt/angular'];

/** Represents an entry in the package.json */
type PackageJsonEntry = {
  type: 'dependencies' | 'devDependencies' | 'peerDependencies';
  pkg: string;
  version: string;
};

/**
 * Add a set of packages to the package.json
 * @param host The current workspace's host
 * @param entries A collection of {@link PackageJsonEntry} to add
 * @returns The resulting workspace's {@link Tree}
 */
function addPackageToPackageJson(host: Tree, entries: PackageJsonEntry[]): Tree {
  if (!host.exists('package.json')) {
    console.error('Unable to locate package.json');
    return host;
  }

  const packageJsonContent = host.read('package.json')?.toString('utf-8') ?? '{}';
  const json = JSON.parse(packageJsonContent);

  entries.forEach(({ type, pkg, version }: PackageJsonEntry) => {
    if (!json[type]) {
      json[type] = {};
    }

    if (!json[type][pkg]) {
      json[type][pkg] = version;
    }
  });

  host.overwrite('package.json', JSON.stringify(json, null, 2));

  return host;
}

/**
 * Add StateAdapt Angular's packages to the package.json
 * @returns The rule to be executed to add the StateAdapt's dependencies
 */
function addPackagesToPackageJson(options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const packages = corePackages.map(
      (pkg: string): PackageJsonEntry => ({
        type: 'dependencies',
        pkg,
        version,
      }),
    );

    addPackageToPackageJson(host, packages);

    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }

    return host;
  };
}

/**
 * Entrypoint for the `ng add` schematic
 * @param options Additional configuration and flags for the schematic
 * @returns The rule to be executed to add the StateAdapt's dependencies
 */
export default function (options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    return chain([addPackagesToPackageJson(options)])(host, context);
  };
}
