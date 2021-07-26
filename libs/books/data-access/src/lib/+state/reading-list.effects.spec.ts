import { TestBed } from '@angular/core/testing';
import { ReplaySubject } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import {
  createBook,
  createReadingListItem,
  SharedTestingModule
} from '@tmo/shared/testing';
import { ReadingListEffects } from './reading-list.effects';
import * as ReadingListActions from './reading-list.actions';
import { Book, okReadsConstants, ReadingListItem } from '@tmo/shared/models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

describe('ToReadEffects', () => {
  let actions: ReplaySubject<any>;
  let effects: ReadingListEffects;
  let httpMock: HttpTestingController;
  let matSnackBar: MatSnackBar;
  let store: MockStore;
  let item: ReadingListItem;
  let book: Book;
  const snackBar: any = {};
  beforeAll(() => {
    book = createBook('A');
    item = createReadingListItem('B');
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule, MatSnackBarModule],
      providers: [
        ReadingListEffects,
        provideMockActions(() => actions),
        provideMockStore()
      ]
    });

    effects = TestBed.inject(ReadingListEffects);
    httpMock = TestBed.inject(HttpTestingController);
    matSnackBar = TestBed.inject(MatSnackBar);
    store = TestBed.inject(MockStore);
    jest.spyOn(store, 'dispatch');
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
      actions.next(ReadingListActions.addToReadingList({ book, showSnackBar: true }));

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
      actions.next(ReadingListActions.addToReadingList({ book: book, showSnackBar: false }));

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
    it('should remove book from the reading list successfully when remove button is clicked and no snackbar action is performed', (done) => {
      const item: ReadingListItem = createReadingListItem('A');
      actions.next(ReadingListActions.confirmedRemoveFromReadingList({ item }));

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
      actions.next(ReadingListActions.removeFromReadingList({ item, showSnackBar: true }));

      effects.removeBook$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.failedRemoveFromReadingList({ item })
        );
        done();
      });

      httpMock
        .expectOne(`${okReadsConstants.API_LINKS.READING_API}/${item.bookId}`)
        .error(null);
    it('should remove book from the reading list successfully when remove button is clicked and no snackbar action is performed', () => {
      actions.next(ReadingListActions.confirmedRemoveFromReadingList({ item }));

      effects.removeBook$.subscribe(() => {
        expect(store.dispatch).toHaveBeenCalledWith(
          ReadingListActions.confirmedRemoveFromReadingList({ item })
        );
      });
    });

    it('should undo remove book from the reading list when snackbar action is clicked', () => {
      actions.next(
        ReadingListActions.removeFromReadingList({ item, showSnackBar: true })
      );

      effects.removeBook$.subscribe(() => {
        matSnackBar._openedSnackBarRef.dismissWithAction();

        expect(store.dispatch).toHaveBeenCalledWith(
          ReadingListActions.addToReadingList({
            book: { id: item.bookId, ...item },
            showSnackBar: false,
          })
        );
      });
    });
  });

  it('should not open snackbar when snackbar undo remove from list action is performed once', () => {
    actions.next(
      ReadingListActions.removeFromReadingList({ item, showSnackBar: false })
    );

    effects.addBook$.subscribe(() => {
      expect(snackBar.open).not.toHaveBeenCalled();
    });
  });
})
});
