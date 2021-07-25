import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, exhaustMap, map } from 'rxjs/operators';
import { ReadingListItem } from '@tmo/shared/models';
import * as ReadingListActions from './reading-list.actions';
import { okReadsConstants } from '@tmo/shared/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';

@Injectable()
export class ReadingListEffects implements OnInitEffects {
  loadReadingList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.init),
      exhaustMap(() =>
        this.http
          .get<ReadingListItem[]>(`${okReadsConstants.API_LINKS.READING_API}`)
          .pipe(
            map((data) =>
              ReadingListActions.loadReadingListSuccess({ list: data })
            ),
            catchError((error) =>
              of(ReadingListActions.loadReadingListError({ error }))
            )
          )
      )
    )
  );

  addBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.addToReadingList),
      concatMap(({ book, showSnackBar }) =>
        this.http.post(`${okReadsConstants.API_LINKS.READING_API}`, book).pipe(
          map(() => {
            if (showSnackBar) {
              const snackBarRef = this.snackBar.open(
                `${book.title} - ${okReadsConstants.SNACKBAR_ACTIONS.BOOK_ADDED}`,
                `${okReadsConstants.SNACKBAR_ACTIONS.ACTION}`,
                {
                  duration: 3000,
                  panelClass: `${okReadsConstants.SNACKBAR_ACTIONS.BOOK_ADDED_CLASS}`,
                }
              );
              snackBarRef.onAction().subscribe(() =>
                this.store.dispatch(
                  ReadingListActions.removeFromReadingList({
                    item: {
                      bookId: book.id,
                      ...book,
                    },
                    showSnackBar: false,
                  })
                )
              );
            }
            return ReadingListActions.confirmedAddToReadingList({ book });
          }),
          catchError(() =>
            of(ReadingListActions.failedAddToReadingList({ book }))
          )
        )
      )
    )
  );

  removeBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.removeFromReadingList),
      concatMap(({ item, showSnackBar }) =>
        this.http
          .delete(`${okReadsConstants.API_LINKS.READING_API}/${item.bookId}`)
          .pipe(
            map(() => {
              if (showSnackBar) {
                const snackBarRef = this.snackBar.open(
                  `${item.title} - ${okReadsConstants.SNACKBAR_ACTIONS.BOOK_REMOVED}`,
                  `${okReadsConstants.SNACKBAR_ACTIONS.ACTION}`,
                  {
                    duration: 3000,
                    panelClass: `${okReadsConstants.SNACKBAR_ACTIONS.BOOK_REMOVED_CLASS}`,
                  }
                );
                snackBarRef
                  .onAction()
                  .subscribe(() =>
                    this.store.dispatch(
                      ReadingListActions.addToReadingList({
                        book: { id: item.bookId, ...item },
                        showSnackBar: false,
                      })
                    )
                  );
              }
              return ReadingListActions.confirmedRemoveFromReadingList({
                item,
              });
            }),
            catchError(() =>
              of(ReadingListActions.failedRemoveFromReadingList({ item }))
            )
          )
      )
    )
  );

  ngrxOnInitEffects() {
    return ReadingListActions.init();
  }

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private store: Store
  ) {}
}
