import { Component, Input, Inject, forwardRef, Output, EventEmitter } from '@angular/core';
import { BaseWidget, NgAisInstantSearch } from 'angular-instantsearch';
import { connectPagination } from 'instantsearch.js/es/connectors';

import { MissionService } from '../services/mission-service';

import {ViewportScroller} from '@angular/common';

@Component({
  selector: 'app-pagination',
  template: `
            <nav aria-label="Search navigation" class="mt-4">
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
            <ais-configure [searchParameters]=searchParameters></ais-configure>
            `
})

// <mat-paginator [length]=state.nbHits
//                [hidePageSize]=true
//                [pageSize]="searchParameters.hitsPerPage"
//                [pageSizeOptions]="[20, 40, 100]"
//                (page)="refineNewOp($event)">
// </mat-paginator>

export class PaginationComponent extends BaseWidget {
  @Input() upgradeFlag: boolean;
  @Output() upgrade: EventEmitter <boolean> = new EventEmitter();

  searchParameters = {
     hitsPerPage: 40
   };

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
    private missionService: MissionService
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
    if (this.upgradeFlag && i>1) {
      this.upgrade.emit(true);
    } else {
      this.missionService.currentPage = i;
      this.viewportScroller.scrollToPosition([0, 0]);
      this.state.refine(i)
    }
  }

  refineNewOp(event) {
    // console.log('event',event)
    if (event.previousPageIndex==event.pageIndex) {
      this.missionService.isLoading = true;
      this.viewportScroller.scrollToPosition([0, 0]);
      this.searchParameters = {
        hitsPerPage: event.pageSize
      };
      this.missionService.hitsPerPage = event.pageSize;
      this.state.refine(0);
    } else {
      if (this.upgradeFlag && event.pageIndex>4) {
        this.upgrade.emit();
      } else {
        // console.log('222')
        this.missionService.isLoading = true;
        this.viewportScroller.scrollToPosition([0, 0]);
        this.searchParameters = {
          hitsPerPage: event.pageSize
        };
        this.state.refine(event.pageIndex);
      }
    }
  }
}
