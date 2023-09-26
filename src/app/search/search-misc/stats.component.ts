import { Component, Input, Inject, forwardRef } from '@angular/core';
import { BaseWidget, NgAisInstantSearch } from 'angular-instantsearch';
import { connectStats } from 'instantsearch.js/es/connectors';

@Component({
  selector: 'app-stats',
  template: `
            <b>
              <ng-container *ngIf="mode==0">
                {{state.page*state.hitsPerPage+1}}-{{((state.page+1)*state.hitsPerPage)>state.nbHits ? state.nbHits : (state.page+1)*state.hitsPerPage}}
              </ng-container>
              <ng-container *ngIf="mode==1">
                {{state.page*state.hitsPerPage+1}}-{{state.nbHits>6 ? (state.page*state.hitsPerPage+6) : state.nbHits}}
              </ng-container>
              <ng-container *ngIf="mode==0 || mode==1">
                of {{state.nbHits}} results found in {{state.processingTimeMS}}ms.
              </ng-container>
              <ng-container *ngIf="mode==2">
                {{state.nbHits}} results
              </ng-container>
            </b>
            `
})

export class StatsComponent extends BaseWidget {
  @Input() mode: number = 0;

  public state: {
     hitsPerPage: number;
     nbHits: number;
     nbPages: number;
     page: number;
     processingTimeMS: number;
     query: string;
     widgetParams: object;
  };
  constructor(
    @Inject(forwardRef(() => NgAisInstantSearch))
    public instantSearchParent
  ) {
    super('Stats');
  }
  ngOnInit() {
    this.createWidget(connectStats, {
      // instance options
    });
    super.ngOnInit();
  }
}
