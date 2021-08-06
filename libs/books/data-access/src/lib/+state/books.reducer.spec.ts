import { initialState, reducer, State } from './books.reducer';
import * as BooksActions from './books.actions';
import { createBook } from '@tmo/shared/testing';

const bookResponse = {
  book: {
    id: "ptiYBAAAQBAJ",
    title: "JavaScript & jQuery: The Missing Manua",
    authors: "David Sawyer McFarland",
    description: "JavaScript lets you supercharge your HTML with animation, interactivity, and visual effects—but many web designers find the language hard to learn.",
    publisher: "O'Reilly Media, Inc.",
    publishedDate: "2014-09-18T00:00:00.000Z",
    coverUrl: "http://books.google.com/books/content?id=ptiYBAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
  },
};

describe('Books Reducer', () => {
  describe('valid Books actions', () => {
    it('should return set of list of known Books when searchBooksSuccess action is dispatched', () => {
      const books = [createBook('A'), createBook('B'), createBook('C')];
      const action = BooksActions.searchBooksSuccess({ books });

      const result: State = reducer(initialState, action);

      expect(result.loaded).toBe(true);
      expect(result.ids.length).toBe(3);
    });

    it('should show error when there is a book search failure', () => {
        const error = '';
        const action = BooksActions.searchBooksFailure({error})

        const result: State = reducer(initialState, action);

        expect(result.loaded).toBe(false);
        expect(result.ids.length).toBe(0);
    })

    it('should return an empty set when clearSearch action is dispatched', () => {
      const books = [createBook('A'), createBook('B'), createBook('C')];
      BooksActions.searchBooksSuccess({ books });
      const action = BooksActions.clearSearch();
  
      const result: State = reducer(initialState, action);
  
      expect(result.loaded).toBe(false);
      expect(result.ids.length).toBe(0);
    });
  });

  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
  
  describe('setMockDataForBook', () => {
    it('should set mock data for book', () => {
      const mockData = bookResponse;
      const action = BooksActions.setMockDataForBook({
        mockData
      });

      const result = reducer(initialState, action);

      expect(result).not.toBeUndefined();
    });
  });
});
