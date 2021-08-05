import { TestBed } from '@angular/core/testing';
import { ReplaySubject } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import {
  createReadingListItem,
  SharedTestingModule,
} from '@tmo/shared/testing';
import { ReadingListEffects } from './reading-list.effects';
import * as ReadingListActions from './reading-list.actions';
import { okReadsConstants } from '@tmo/shared/models';

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
  });

  describe('loadReadingList$', () => {
    it('should work', done => {
      actions = new ReplaySubject();
      actions.next(ReadingListActions.init());

      effects.loadReadingList$.subscribe(action => {
        expect(action).toEqual(
          ReadingListActions.loadReadingListSuccess({ list: [] })
        );
        done();
      });

      httpMock.expectOne(`${okReadsConstants.API_LINKS.READING_API}`).flush([]);
    });

    describe('markBookAsFinished$', () => {
      it('should mark book as finished when confirmedMarkAsFinished action is dispatched', (Promise) => {
        actions = new ReplaySubject();
        const updatedData = {
          ...createReadingListItem('test'),
          finished: true,
          finishedDate: new Date().toISOString(),
        };
        actions.next(
          ReadingListActions.markBookAsFinished({
            item: updatedData ,
          })
        );
        effects.markBookAsFinished$.subscribe((action) => {
          expect(action).toEqual(
            ReadingListActions.confirmedMarkBookAsFinished({
              item: updatedData,
            })
          );
          Promise();
        });
        httpMock
          .expectOne(`/api/reading-list/test/finished`)
          .flush({ ...updatedData });
      });

      it('should not mark book as finished when api fails', (Promise) => {
        actions = new ReplaySubject();
        actions.next(
          ReadingListActions.markBookAsFinished({
            item: createReadingListItem('test'),
          })
        );
        effects.markBookAsFinished$.subscribe((action) => {
          expect(action).toEqual(
            ReadingListActions.failedMarkBookAsFinished({
              error: 'API error',
            })
          );
          Promise();
        });
        httpMock
          .expectOne(
            `${okReadsConstants.API_LINKS.READING_API}/test/${okReadsConstants.CONSTANTS.FINISHED}`
          )
          .error(new ErrorEvent('HttpErrorResponse'), {
            status: 500,
            statusText: 'API error',
          });
      });
    });
  });
});
