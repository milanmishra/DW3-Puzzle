import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  createReadingListItem,
  SharedTestingModule,
} from '@tmo/shared/testing';
import { ReadingListComponent } from './reading-list.component';
import { BooksFeatureModule } from '@tmo/books/feature';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  getReadingList,
  markBookAsFinished,
  removeFromReadingList,
} from '@tmo/books/data-access';

describe('ReadingListComponent', () => {
  let component: ReadingListComponent;
  let fixture: ComponentFixture<ReadingListComponent>;
  let store: MockStore;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BooksFeatureModule, SharedTestingModule],
      providers: [provideMockStore({ initialState: { items: {} } }),]
    }).compileComponents();
    store = TestBed.inject(MockStore);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadingListComponent);
    component = fixture.componentInstance;
    store.overrideSelector(getReadingList, [
      { ...createReadingListItem('A'), isAdded: true },
      { ...createReadingListItem('B'), isAdded: true },
    ]);
    fixture.detectChanges();
    spyOn(store, 'dispatch')
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch removeFromReadingList action when remove button is clicked', () => {
    const readingList = { ...createReadingListItem('A'), isAdded: true };
    store.overrideSelector(getReadingList, [{ ...readingList }]);
    const removeBtn = fixture.nativeElement.querySelector(
      '[data-testing="remove-book"]'
    );

    removeBtn.click();

    expect(store.dispatch).toHaveBeenCalledWith(
      removeFromReadingList({ item: readingList })
    );
  });

  it('should dispatch markedAsFinished action when check button is clicked', () => {
    const readingList = createReadingListItem('A');
    const markAsFinishedBtn = fixture.nativeElement.querySelector(
      '[data-testing="mark-as-finished"]'
    );

    markAsFinishedBtn.click();

    expect(store.dispatch).toHaveBeenCalledWith(
      markBookAsFinished({
        item: {
          ...readingList,
          isAdded: true,
          finished: true,
          finishedDate: new Date().toISOString()
        },
      })
    );
  });
});
