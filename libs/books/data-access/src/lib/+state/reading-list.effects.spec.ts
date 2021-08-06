import { TestBed } from '@angular/core/testing';
import { ReplaySubject } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import {
  createBook,
  createReadingListItem,
  SharedTestingModule,
} from '@tmo/shared/testing';
import { ReadingListEffects } from './reading-list.effects';
import * as ReadingListActions from './reading-list.actions';
import { Book, okReadsConstants, ReadingListItem } from '@tmo/shared/models';

describe('ToReadEffects', () => {
  let actions: ReplaySubject<any>;
  let effects: ReadingListEffects;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
      providers: [
        ReadingListEffects,
        provideMockActions(() => actions),
        provideMockStore()
      ]
    });

    effects = TestBed.inject(ReadingListEffects);
    httpMock = TestBed.inject(HttpTestingController);
    actions = new ReplaySubject();
  });

  describe('loadReadingList$', () => {
    it('should work', done => {
      actions.next(ReadingListActions.init());

      effects.loadReadingList$.subscribe(action => {
        expect(action).toEqual(
          ReadingListActions.loadReadingListSuccess({ list: [] })
        );
        done();
      });

      httpMock.expectOne(`${okReadsConstants.API_LINKS.READING_API}`).flush([]);
    });
  });

  describe('addBook$', () => {
    it('should add book to reading list when confirmedAddToReadingList action is dispatched', (done) => {
      const book: Book = createBook('A');
      actions.next(ReadingListActions.addToReadingList({ book }));

      effects.addBook$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.confirmedAddToReadingList({ book })
        );
        done();
      });

      httpMock
        .expectOne(`${okReadsConstants.API_LINKS.READING_API}`)
        .flush([book]);
    });

    it('should dispatch failedAddToReadingList when api throws an error', (done) => {
      const book: Book = createBook('A');
      actions.next(ReadingListActions.addToReadingList({ book: book }));

      effects.addBook$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.failedAddToReadingList({ book })
        );
        done();
      });

      httpMock
        .expectOne(`${okReadsConstants.API_LINKS.READING_API}`)
        .error(null);
    });
  });

  describe('removeBook$', () => {
    it('should remove book from the reading list successfully when confirmedRemoveFromReadingList action is dispatched', (done) => {
      const item: ReadingListItem = createReadingListItem('A');
      actions.next(ReadingListActions.removeFromReadingList({ item }));

      effects.removeBook$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.confirmedRemoveFromReadingList({ item })
        );
        done();
      });

      httpMock
        .expectOne(`${okReadsConstants.API_LINKS.READING_API}/${item.bookId}`)
        .flush([item]);
    });

    it('should dispatch failedRemoveFromReadingList when api throws an error', (done) => {
      const item: ReadingListItem = createReadingListItem('A');
      actions.next(ReadingListActions.removeFromReadingList({ item }));

      effects.removeBook$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.failedRemoveFromReadingList({ item })
        );
        done();
      });

      httpMock
        .expectOne(`${okReadsConstants.API_LINKS.READING_API}/${item.bookId}`)
        .error(null);
    });
  });
});
