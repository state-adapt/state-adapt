import { InjectionToken } from '@angular/core';

/**
 * Overrides whether stores in the current Angular injection context are local.
 *
 * Local stores activate immediately and deactivate when their injection context is
 * destroyed. Non-local stores activate only while an Angular template or effect
 * consumes them. When this token is not provided, a store is local when Angular makes
 * a `ViewContainerRef` available in its current injection context.
 *
 * Use an Angular factory provider to determine the value with `inject`:
 *
 * @example
 * ```ts
 * import { inject } from '@angular/core';
 * import { bootstrapApplication } from '@angular/platform-browser';
 * import { IS_STORE_LOCAL } from '@state-adapt/angular';
 *
 * import { AppComponent } from './app/app.component';
 * import { MyLocalContext } from './app/my-local-context';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     {
 *       provide: IS_STORE_LOCAL,
 *       useFactory: () => !!inject(MyLocalContext, { optional: true }),
 *     },
 *   ],
 * });
 * ```
 */
export const IS_STORE_LOCAL = new InjectionToken<boolean>('StateAdapt IS_STORE_LOCAL');
