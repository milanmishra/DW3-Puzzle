import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  getReadingList,
  markBookAsFinished,
  removeFromReadingList,
} from '@tmo/books/data-access';
import { okReadsConstants } from '@tmo/shared/models';
@Component({
  selector: 'tmo-reading-list',
  templateUrl: './reading-list.component.html',
  styleUrls: ['./reading-list.component.scss'],
})
export class ReadingListComponent {
  constants = okReadsConstants;
  readingList$ = this.store.select(getReadingList);

  constructor(private readonly store: Store) {}

  removeFromReadingList = (item) => {
    this.store.dispatch(removeFromReadingList({ item }));
  };

  markBookAsFinished = (item) => {
    this.store.dispatch(
      markBookAsFinished({
        item: { ...item, finished: true, finishedDate: new Date().toISOString() },
      })
    );
  };
}
