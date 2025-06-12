import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';

import { Schema } from './schema';

export const defaultAppOptions = {
  name: 'bar',
  inlineStyle: false,
  inlineTemplate: false,
  viewEncapsulation: 'Emulated',
  routing: false,
  style: 'css',
  skipTests: false,
};

const defaultSchematicOptions: Schema = {
  skipInstall: false,
};

export const defaultWorkspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '0.0.0',
};

describe('StateAdapt ng-add Schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    '@state-adapt/angular',
    path.join(__dirname, '../collection.json'),
  );

  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await schematicRunner.runExternalSchematic(
      '@schematics/angular',
      'workspace',
      defaultWorkspaceOptions,
    );

    appTree = await schematicRunner.runExternalSchematic(
      '@schematics/angular',
      'application',
      defaultAppOptions,
      appTree,
    );
  });

  it('should update package.json', async () => {
    const tree = await schematicRunner.runSchematic(
      'ng-add',
      defaultSchematicOptions,
      appTree,
    );

    const packageJson = JSON.parse(tree.readContent('/package.json'));
    expect(packageJson.dependencies['@state-adapt/core']).toBeDefined();
    expect(packageJson.dependencies['@state-adapt/rxjs']).toBeDefined();
    expect(packageJson.dependencies['@state-adapt/angular']).toBeDefined();
  });
});
