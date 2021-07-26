import { initialState, readingListAdapter } from './reading-list.reducer';
import {
  booksAdapter,
  initialState as booksInitialState
} from './books.reducer';
import * as ToReadSelectors from './reading-list.selectors';
import { createBook, createReadingListItem } from '@tmo/shared/testing';

describe('ReadingList Selectors', () => {
  let state;

  beforeEach(() => {
    state = {
      books: booksAdapter.addMany(
        [createBook('A'), createBook('B'), createBook('C')],
        {
          ...booksInitialState,
          error: 'Unknown error',
          loaded: true
        }
      ),
      readingList: readingListAdapter.addMany(
        [
          createReadingListItem('A'),
          createReadingListItem('B'),
          createReadingListItem('C')
        ],
        {
          ...initialState,
          error: 'Unknown error',
          loaded: true
        }
      )
    };
  });

  describe('Books Selectors', () => {

    it('should return the list of Books when getAllBooks() gets invoked', () => {
      const results = ToReadSelectors.getAllBooks(state);
      
      expect(results.length).toBe(3);
    });
    
    it('should return the list of Books when getReadingList() gets invoked', () => {
      const results = ToReadSelectors.getReadingList(state);

      expect(results.length).toBe(3);

      expect(results.map(book => book.bookId)).toEqual(['A', 'B', 'C']);
    });

    it("should return the current 'loaded' status when getTotalUnread() gets invoked", () => {
      const result = ToReadSelectors.getTotalUnread(state);

      expect(result).toBe(3);
    });
  });
});
