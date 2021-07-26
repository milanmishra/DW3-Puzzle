import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  addToReadingList,
  clearSearch,
  getAllBooks,
  searchBooks
} from '@tmo/books/data-access';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Book, okReadsConstants } from '@tmo/shared/models';
@Component({
  selector: 'tmo-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.scss']
})
export class BookSearchComponent {
  constants = okReadsConstants;
  books$ = this.store.select(getAllBooks);

  searchForm = this.fb.group({
    term: new FormControl(null, [Validators.required]),
  });

  constructor(
    private readonly store: Store,
    private readonly fb: FormBuilder
  ) {}

  get searchTerm(): string {
    return this.searchForm.value.term;
  }

  addBookToReadingList = (book: Book) => {
    this.store.dispatch(addToReadingList({ book }));
  }

  searchExample = () => {
    this.searchForm.controls.term.setValue('javascript');
    this.searchBooks();
  }

  searchBooks = () => {
    if (this.searchTerm)
      this.store.dispatch(searchBooks({ term: this.searchTerm }));
  }

  resetSearch() {
    this.searchForm.controls.term.setValue('');
    this.store.dispatch(clearSearch());
  }
}
