import { Component, computed } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { concat, defer, NEVER, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { adapt } from './adapt.function';

describe('adapt signals', () => {
  it('delegates a component-local store lifecycle to toSignal', () => {
    let subscriptions = 0;

    @Component({
      standalone: true,
      template: `
        {{ count() }}
      `,
    })
    class LocalComponent {
      count = adapt(0, {
        sources: defer(() => {
          subscriptions++;
          return concat(of(1), NEVER).pipe(finalize(() => subscriptions--));
        }),
      });
    }

    TestBed.configureTestingModule({ imports: [LocalComponent] });
    const fixture = TestBed.createComponent(LocalComponent);

    expect(subscriptions).toBe(1);
    // Local; subscribes immediately
    expect(fixture.componentInstance.count()).toBe(1);

    fixture.destroy();

    expect(subscriptions).toBe(0);
  });

  it('supplies an efficient computed for each selector', () => {
    TestBed.configureTestingModule({});
    TestBed.runInInjectionContext(() => {
      let doubleCallCount = 0;

      const count = adapt(1, {
        selectors: {
          double: state => {
            doubleCallCount++;
            return state * 2;
          },
        },
      });

      expect(count()).toBe(1);
      expect(count.double()).toBe(2);
      expect(count.double()).toBe(2);
      expect(doubleCallCount).toBe(1);

      const quad = computed(() => count.double() * 2);
      expect(quad()).toBe(4);
      expect(doubleCallCount).toBe(1);
    });
  });

  it('overrides signal function properties with selectors of the same name', () => {
    TestBed.configureTestingModule({});
    TestBed.runInInjectionContext(() => {
      const count = adapt(1, {
        selectors: {
          // Check that OUR toString type and value are used
          toString: (state: number) => state, // toString is special apparently; needs number type
          // Check that OUR lenght type and value are used
          length: state => state.toString(),
          // Check that OUR name type and value are used
          name: state => state,
        },
      });

      // Check that OUR toString type and value are used
      const toString = count.toString();
      expect(toString).toBe(1);
      // @ts-expect-error: should be a number from the selector
      const getToStringError = () => toString.split('');

      // Check that OUR lenght type and value are used
      const length = count.length();
      expect(length).toBe('1');
      // @ts-expect-error: should be a string from the selector
      const getLengthError = () => Math.pow(length, 2);

      // Check that OUR name type and value are used
      const name = count.name();
      expect(name).toBe(1);
      // @ts-expect-error: should be a number from the selector
      const getNameError = () => name.toUpperCase();

      expect(getToStringError).toBeDefined();
      expect(getLengthError).toBeDefined();
      expect(getNameError).toBeDefined();
    });
  });
});
