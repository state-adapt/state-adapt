import { Component, inject } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter, withRouterConfig } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BookService, bookServiceInstances } from './book.service';
import { BOOKS_TOKEN } from './book.token';

describe('Shared non-root modules', () => {
  const setup = async () => {
    @Component({
      selector: 'sa-child',
      standalone: true,
      template: `
        <p id="bookId">{{ bookService.bookId }}</p>
      `,
    })
    class ChildComponent {
      bookService = inject(BookService);
      bookId = this.bookService.bookId;
    }

    @Component({
      selector: 'sa-child2',
      standalone: true,
      template: `
        <p id="bookId">{{ bookService.bookId }}</p>
      `,
    })
    class Child2Component {
      bookService = inject(BookService);
      bookId = this.bookService.bookId;
    }

    @Component({
      selector: 'sa-parent',
      imports: [ChildComponent, Child2Component],
      providers: [BOOKS_TOKEN.provider],
      template: `
        @defer (on timer(1000ms)) {
        <sa-child></sa-child>
        } @defer (on timer(2000ms)) {
        <sa-child2></sa-child2>
        }
      `,
    })
    class ParentComponent {}

    @Component({
      standalone: false,
    })
    class HomeComponent {}

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideRouter(
          [
            {
              path: 'home',
              component: HomeComponent,
            },
            {
              path: 'parent/:bookId',
              component: ParentComponent,
              data: { a: 1 },
            },
            { path: '**', redirectTo: '/home' },
          ],
          withRouterConfig({
            paramsInheritanceStrategy: 'always',
          }),
        ),
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create('/');

    return {
      harness,
      HomeComponent,
      ParentComponent,
      getText: (sel: string) =>
        harness.fixture.nativeElement.querySelector(sel)?.textContent,
    };
  };

  it('Scoped provider should instantiate lazily once per provision and inherit route params from injector its token is provided in', fakeAsync(async () => {
    const { harness, getText } = await setup();

    await harness.navigateByUrl('/parent/5');
    harness.detectChanges();

    expect(bookServiceInstances.count).toBe(0);
    expect(getText('sa-child #bookId')).toBeFalsy();

    tick(1500);
    harness.detectChanges();

    expect(bookServiceInstances.count).toBe(1);
    expect(getText('sa-child #bookId')).toBe('5');
    expect(getText('sa-child2 #bookId')).toBeFalsy();

    tick(1000);
    harness.detectChanges();

    expect(bookServiceInstances.count).toBe(1);
    expect(getText('sa-child #bookId')).toBe('5');
    expect(getText('sa-child2 #bookId')).toBe('5');
  }));
});
