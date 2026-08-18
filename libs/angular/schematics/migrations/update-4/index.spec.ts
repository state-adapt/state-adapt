import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';

describe('StateAdapt 4 migration', () => {
  it('runs', async () => {
    const runner = new SchematicTestRunner(
      '@state-adapt/angular',
      path.join(__dirname, '../../migration-collection.json'),
    );
    await expect(runner.runSchematic('update-4')).resolves.toBeDefined();
  });
});
