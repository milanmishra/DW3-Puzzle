import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  addToReadingList,
  clearSearch,
  getAllBooks,
  searchBooks,
} from '@tmo/books/data-access';
import { FormBuilder } from '@angular/forms';
import { Book, okReadsConstants } from '@tmo/shared/models';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  takeUntil,
} from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'tmo-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.scss']
})
export class BookSearchComponent implements OnInit, OnDestroy {
  constants = okReadsConstants;
  books$ = this.store.select(getAllBooks);
  
  private notifier: Subject<boolean> = new Subject();

  searchForm = this.fb.group({
    term: ''
  });

  constructor(
    private readonly store: Store,
    private readonly fb: FormBuilder
  ) {}

  get searchTerm(): string {
    return this.searchForm.value.term;
  }

  ngOnInit(): void {
    this.searchForm.valueChanges
      .pipe(
        map((val) => val.term),
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.notifier)
      )
      .subscribe(() => {
        this.searchBooks();
      });
  }

  addBookToReadingList = (book: Book) => {
    this.store.dispatch(addToReadingList({ book, showSnackBar:true  }));
  }

  searchExample = () => {
    this.searchForm.controls.term.setValue('javascript');
    this.searchBooks();
  }

  searchBooks = () => {
    if (this.searchTerm) {
      this.store.dispatch(searchBooks({ term: this.searchTerm }))
    }
  }
  
  resetSearch = () => {
    this.searchForm.controls.term.setValue('');
    this.store.dispatch(clearSearch());
  }

  ngOnDestroy = () => {
    this.notifier.next(true);
    this.notifier.complete();
  };
}
