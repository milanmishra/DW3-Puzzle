import { TestBed } from '@angular/core/testing';
import { ReplaySubject } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import {
  createBook,
  createReadingListItem,
  SharedTestingModule,
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
        provideMockStore(),
      ],
    });

    effects = TestBed.inject(ReadingListEffects);
    httpMock = TestBed.inject(HttpTestingController);
    matSnackBar = TestBed.inject(MatSnackBar);
    store = TestBed.inject(MockStore);
    jest.spyOn(store, 'dispatch');
    actions = new ReplaySubject();
  });

  describe('loadReadingList$', () => {
    it('should work', (done) => {
      actions.next(ReadingListActions.init());

      effects.loadReadingList$.subscribe((action) => {
        expect(action).toEqual(
          ReadingListActions.loadReadingListSuccess({ list: [] })
        );
        done();
      });

      httpMock.expectOne(`${okReadsConstants.API_LINKS.READING_API}`).flush([]);
    });
  });

  describe('addBook$', () => {
    it('should add book to the reading list successfully when Want To Add button is clicked and no snackbar action is performed', () => {
      actions.next(ReadingListActions.confirmedAddToReadingList({ book }));

      effects.addBook$.subscribe(() => {
        expect(store.dispatch).toHaveBeenCalledWith(
          ReadingListActions.confirmedAddToReadingList({ book })
        );
      });
    });

    it('should undo add book to the reading list when snackbar action is clicked', () => {
      actions.next(
        ReadingListActions.addToReadingList({ book, showSnackBar: true })
      );

      effects.addBook$.subscribe(() => {
        matSnackBar._openedSnackBarRef.dismissWithAction();
        expect(store.dispatch).toHaveBeenCalledWith(
          ReadingListActions.removeFromReadingList({
            item: {
              bookId: book.id,
              ...book,
            },
            showSnackBar: false,
          })
        );
      });
    });

    it('should not open snackbar when snackbar undo add to list action is performed once', () => {
      actions.next(
        ReadingListActions.addToReadingList({ book, showSnackBar: true })
      );

      effects.removeBook$.subscribe(() => {
        expect(snackBar.open).not.toHaveBeenCalled();
      });
    });
  });

  describe('removeBook$', () => {
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
      ReadingListActions.removeFromReadingList({ item, showSnackBar: true })
    );

    effects.addBook$.subscribe(() => {
      expect(snackBar.open).not.toHaveBeenCalled();
    });
  });
});
