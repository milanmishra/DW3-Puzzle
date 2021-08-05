import * as ReadingListActions from './reading-list.actions';
import {
  initialState,
  readingListAdapter,
  reducer,
  State
} from './reading-list.reducer';
import { createBook, createReadingListItem } from '@tmo/shared/testing';

const readingResponse = {
  reading: {
    bookId: 'ptiYBAAAQBAJ',
  },
};

describe('Reading List Reducer', () => {
  describe('valid Reading List actions', () => {
    let state: State;

    beforeEach(() => {
      state = readingListAdapter.setAll(
        [createReadingListItem('A'), createReadingListItem('B')],
        initialState
      );
    });

    it('should load books from reading list when loadBooksSuccess action is dispatched', () => {
      const list = [
        createReadingListItem('A'),
        createReadingListItem('B'),
        createReadingListItem('C')
      ];
      const action = ReadingListActions.loadReadingListSuccess({ list });

      const result: State = reducer(initialState, action);

      expect(result.loaded).toBe(true);
      expect(result.ids.length).toEqual(3);
    });

    it('should add book addition to the state when confirmedAddToReadingList action is dipatched', () => {
      const action = ReadingListActions.confirmedAddToReadingList({
        book: createBook('C')
      });

      const result: State = reducer(state, action);

      expect(result.ids).toEqual(['A', 'B', 'C']);
    });

    it('should remove book addition from the state when confirmedRemoveFromReadingList action is dispatched', () => {
      const action = ReadingListActions.confirmedRemoveFromReadingList({
        item: createReadingListItem('B')
      });

      const result: State = reducer(state, action);

      expect(result.ids).toEqual(['A']);
    });

    it('should not add book to the state when failedAddToReadingList action is dispatched', () => {
      const action = ReadingListActions.failedAddToReadingList({
        book: createBook('D')
      });

      const result: State = reducer(state, action);

      expect(result.ids).toEqual(['A', 'B']);
    });

    it('should not remove book from the state when failedRemoveFromReadingList action is dispatched', () => {
      const action = ReadingListActions.failedRemoveFromReadingList({
        item: createReadingListItem('C')
      });

      const result: State = reducer(state, action);

      expect(result.ids).toEqual(['A', 'B', 'C']);
    });

    it('should mark book as finished in the state when confirmedMarkBookAsFinished action is dispatched', () => {
      const bookFinished = {
        ...createReadingListItem('A'),
        finished: true,
        finishedDate: new Date().toISOString()    
      }
      const action = ReadingListActions.confirmedMarkBookAsFinished({
        item: bookFinished
      });

      const result: State = reducer(state, action);

      expect(result.entities['A']?.finished).toBeTruthy();
    });

    it('should not mark book as finished in the state when failedMarkAsFinished action is dispatched', () => {
      const action = ReadingListActions.failedMarkBookAsFinished({
        error: 'API error'
      });

      const result: State = reducer(state, action);

      expect(result.error).toEqual('API error');
    });
  });

  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toEqual(initialState);
    });
  });
});
