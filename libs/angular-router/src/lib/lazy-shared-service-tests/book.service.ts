import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BOOKS_TOKEN } from './book.token';
import { ScopedInjectable } from '@state-adapt/angular';

export const bookServiceInstances = {
  count: 0,
};

@ScopedInjectable({ providedIn: BOOKS_TOKEN.token })
export class BookService {
  bookId = inject(ActivatedRoute).snapshot.paramMap.get('bookId');

  constructor() {
    bookServiceInstances.count++;
  }
}
