import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedTestingModule, createBook } from '@tmo/shared/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { BooksFeatureModule } from '../books-feature.module';
import { BookSearchComponent } from './book-search.component';
import {
  addToReadingList,
  clearSearch,
  getAllBooks,
  searchBooks,
} from '@tmo/books/data-access';

describe('BookSearchComponent', () => {
  let component: BookSearchComponent;
  let fixture: ComponentFixture<BookSearchComponent>;
  let store: MockStore;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BookSearchComponent],
      imports: [BooksFeatureModule, NoopAnimationsModule, SharedTestingModule],
      providers: [
        provideMockStore({ initialState: { books: { entities: [] } } }),
      ],
    }).compileComponents();
    store = TestBed.inject(MockStore);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookSearchComponent);
    component = fixture.componentInstance;
    store.overrideSelector(getAllBooks, [
      { ...createBook('A'), isAdded: false, publishedDate: null },
      { ...createBook('B'), isAdded: false },
      {
        ...createBook('C'),
        isAdded: true,
        finished: true,
        finishedDate: new Date().toISOString(),
      }
    ]);
    fixture.detectChanges();
    spyOn(store, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should test search form validity', () => {
    const form = component.searchForm;
    expect(form.valid).toBeFalsy();

    const term = component.searchForm.controls['term'];
    term.setValue('javascript');

    expect(form.valid).toBeTruthy();
  });

  it('should disable the search button when search term is not provided', () => {
    const term = component.searchForm.controls['term'];
    term.setValue(null);

    const searchBtn = fixture.nativeElement.querySelector(
      '[data-testing="search-button"]'
    );

    expect(searchBtn.disabled).toBeTruthy();
  });

  it('should enable the search button when search term is provided', () => {
    const term = component.searchForm.controls['term'];
    term.setValue('javascript');
    fixture.detectChanges();

    const searchBtn = fixture.nativeElement.querySelector(
      '[data-testing="search-button"]'
    );

    expect(searchBtn.disabled).toBeFalsy();
  });

  it('should show clear button', () => {
    const clearbtn = fixture.nativeElement.querySelector(
      '[data-testing="clear-button"]'
    );

    expect(clearbtn).not.toBeNull();
  });

  it('should dispatch searchBooks action and show list of books when search keyword is provided and search button is clicked', () => {
    const term = component.searchForm.controls['term'];
    term.setValue('javascript');
    fixture.detectChanges();

    const searchBtn = fixture.nativeElement.querySelector(
      '[data-testing="search-button"]'
    );
    searchBtn.click();

    expect(store.dispatch).toHaveBeenCalledWith(
      searchBooks({ term: 'javascript' })
    );
  });

  it('should dispatch addToReadingList action and add book to the reading list when Want To Add button is clicked', () => {
    const bookToRead = { ...createBook('A'), isAdded: false };

    store.overrideSelector(getAllBooks, [
      { ...bookToRead },
      { ...createBook('B'), isAdded: false },
    ]);

    const term = component.searchForm.controls['term'];
    term.setValue('javascript');
    fixture.detectChanges();

    const searchBtn = fixture.nativeElement.querySelector(
      '[data-testing="search-button"]'
    );
    searchBtn.click();
    store.refreshState();
    fixture.detectChanges();

    const wantToReadBtn = fixture.nativeElement.querySelector(
      '[data-testing="want-to-read-btn"]'
    );
    wantToReadBtn.click();
    expect(store.dispatch).toHaveBeenCalledWith(
      addToReadingList({ book: { ...bookToRead, isAdded: true } })
    );
  });

  it('should dispatch clearSearch action and clear the search bar when clear button is clicked', () => {
    const term = component.searchForm.controls['term'];
    term.setValue('javascript');
    fixture.detectChanges();

    const clearbtn = fixture.nativeElement.querySelector(
      '[data-testing="clear-button"]'
    );
    clearbtn.click();

    expect(store.dispatch).toHaveBeenCalledWith(clearSearch());
  });

  it('should show disabled Want to add button when book is already added to the reading list', () => {
    const bookToRead = { ...createBook('A'), isAdded: true };

    store.overrideSelector(getAllBooks, [
      { ...bookToRead },
      { ...createBook('B'), isAdded: true },
    ]);

    const term = component.searchForm.controls['term'];
    term.setValue('A');
    fixture.detectChanges();

    const searchBtn = fixture.nativeElement.querySelector(
      '[data-testing="search-button"]'
    );
    searchBtn.click();
    store.refreshState();
    fixture.detectChanges();

    const wantToReadBtn = fixture.nativeElement.querySelector(
      '[data-testing="want-to-read-btn"]'
    );
    expect(wantToReadBtn.disabled).toBeTruthy();
  });

  it('should show disabled Finished button when book is already added to the reading list and is marked as finished', () => {
    const bookToRead = {
      ...createBook('D'),
      isAdded: true,
      finished: true,
      finishedDate: new Date().toISOString(),
    };

    store.overrideSelector(getAllBooks, [
      { ...bookToRead },
      {
        ...createBook('C'),
        isAdded: true,
        finished: true,
        finishedDate: new Date().toISOString(),
      },
    ]);

    const term = component.searchForm.controls['term'];
    term.setValue('D');
    fixture.detectChanges();

    const searchBtn = fixture.nativeElement.querySelector(
      '[data-testing="search-button"]'
    );
    searchBtn.click();
    store.refreshState();
    fixture.detectChanges();

    const finishedButton = fixture.nativeElement.querySelector(
      '[data-testing="want-to-read-btn"]'
    );
    
    expect(finishedButton.disabled).toBeTruthy();
  });
});
