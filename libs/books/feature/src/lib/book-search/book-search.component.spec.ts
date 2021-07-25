import { async, ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
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
    ]);
    fixture.detectChanges();
    spyOn(store, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should show clear button', () => {
    const clearbtn = fixture.nativeElement.querySelector(
      '[data-testing="clear-button"]'
    );

    expect(clearbtn).not.toBeNull();
  });

  it('should dispatch searchBooks action and show list of books when search keyword is provided', fakeAsync(() => {
    component.ngOnInit();
    const term = component.searchForm.controls['term'];
    term.setValue('javascript');

    fixture.detectChanges();
    tick(500)

    expect(store.dispatch).toHaveBeenCalledWith(
      searchBooks({ term: 'javascript' })
    );
    discardPeriodicTasks();
  }));

  it('should not dispatch searchBooks action when time spent after entering search term is less than 500ms', fakeAsync(() => {
    component.ngOnInit();
    const term = component.searchForm.controls['term'];
    term.setValue('javascript');

    fixture.detectChanges();
    tick(400)

    expect(store.dispatch).not.toHaveBeenCalledWith();
    discardPeriodicTasks();
  }));

  it("should search book when book search value is javascript",  () => {
    component.searchExample();

    expect(component.searchForm.value.term).toEqual("javascript");
  });

  it('should dispatch addToReadingList action and add book to the reading list when Want To Add button is clicked', fakeAsync(() => {
    component.ngOnInit()
    const bookToRead = { ...createBook('A'), isAdded: false };
    store.overrideSelector(getAllBooks, [
      { ...bookToRead },
      { ...createBook('B'), isAdded: false },
    ]);

    const term = component.searchForm.controls['term'];
    term.setValue('javascript');
    fixture.detectChanges();
    tick(500)
    store.refreshState();
    fixture.detectChanges();

    const wantToReadBtn = fixture.nativeElement.querySelector(
      '[data-testing="add-book"]'
    );
    wantToReadBtn.click();

    expect(store.dispatch).toHaveBeenCalledWith(
      addToReadingList({ book: bookToRead, showSnackBar:true  })
    );
    discardPeriodicTasks();
  }));

  it('should dispatch clearSearch action and clear the search bar when clear button is clicked', fakeAsync(() => {
    component.ngOnInit()
    const term = component.searchForm.controls['term'];
    term.setValue('javascript');
    fixture.detectChanges();
    tick(500)

    const clearbtn = fixture.nativeElement.querySelector(
      '[data-testing="clear-button"]'
    );
    clearbtn.click();

    expect(store.dispatch).toHaveBeenCalledWith(clearSearch());
    discardPeriodicTasks();
  }));

  describe('ngOnDestroy()', () => {
    it('should unsubscribe to input stream when component is destroyed', fakeAsync(() => {
      component.ngOnDestroy();

      const term = component.searchForm.controls['term'];
      term.setValue('javascript');

      tick(500);

      expect(store.dispatch).not.toHaveBeenCalled();
    }));
  });
});
