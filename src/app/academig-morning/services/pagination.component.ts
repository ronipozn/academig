import { Component, Input, Inject, forwardRef, Output, EventEmitter } from '@angular/core';
import { BaseWidget, NgAisInstantSearch } from 'angular-instantsearch';
import { connectPagination } from 'instantsearch.js/es/connectors';

import {ViewportScroller} from '@angular/common';

@Component({
  selector: 'app-pagination',
  template: `
            <nav aria-label="Search navigation">
              <ul class="pagination justify-content-center">
                <li class="page-item">
                  <button mat-button [disabled]="state.isFirstPage" class="page-link" (click)="refineOp(0)" tabindex="-1" aria-label="Previous">
                    <span aria-hidden="true"><i class="fa fa-angle-double-left" aria-hidden="true"></i></span>
                  </button>
                </li>
                <li class="page-item">
                  <button mat-button [disabled]="state.isFirstPage" class="page-link" (click)="refineOp(state.currentRefinement - 1)" tabindex="-1">
                    <span aria-hidden="true"><i class="fa fa-angle-left" aria-hidden="true"></i></span>
                  </button>
                </li>
                <li *ngFor="let page of state.pages" class="page-item" [ngClass]="{'active': page === state.currentRefinement}">
                  <a mat-button class="page-link" (click)="refineOp(page)">
                    {{ page + 1 }}
                  </a>
                </li>
                <li class="page-item">
                  <button mat-button [disabled]="state.isLastPage" class="page-link" (click)="refineOp(state.currentRefinement + 1)">
                    <span aria-hidden="true"><i class="fa fa-angle-right" aria-hidden="true"></i></span>
                  </button>
                </li>
                <li class="page-item">
                  <button mat-button [disabled]="state.isLastPage" class="page-link" (click)="refineOp(state.nbPages-1)">
                    <span aria-hidden="true"><i class="fa fa-angle-double-right" aria-hidden="true"></i></span>
                  </button>
                </li>
              </ul>
            </nav>
            `
})
export class PaginationComponent extends BaseWidget {
  public state: {
     pages: number[];
     currentRefinement: number;
     nbHits: number;
     nbPages: number;
     isFirstPage: boolean;
     isLastPage: boolean;
     refine: Function;
     createURL: Function;
     widgetParams: Function;
  };
  constructor(
    @Inject(forwardRef(() => NgAisInstantSearch))
    public instantSearchParent,
    public viewportScroller: ViewportScroller,
  ) {
    super('Pagination');
  }
  ngOnInit() {
    this.createWidget(connectPagination, {
      // instance options
    });
    super.ngOnInit();
  }

  refineOp(i: number) {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.state.refine(i)
  }
}
