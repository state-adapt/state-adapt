import 'jest-preset-angular/setup-jest';

import { getTestBed, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { IS_STORE_LOCAL } from '@state-adapt/angular';

getTestBed().resetTestEnvironment();
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  { teardown: { destroyAfterEach: true } },
);

// Root-provided `adapt()` stores otherwise wait for a post-render probe before
// activating; that leaves path-keyed stores uninitialized during TestBed clicks.
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [{ provide: IS_STORE_LOCAL, useValue: true }],
  });
});
