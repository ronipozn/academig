import { Component, Inject, forwardRef, Input } from '@angular/core';
import { BaseWidget, NgAisInstantSearch } from 'angular-instantsearch';
import { connectRefinementList } from 'instantsearch.js/es/connectors';

@Component({
  selector: 'app-refinement-list',
  template: `
            <p *ngFor="let item of state.items" class="mb-2">
              <mat-checkbox (click)="state.refine(item.value)" [checked]="item.isRefined">
                {{ item.label }} ({{ item.count }})
              </mat-checkbox>
            </p>
`
})
export class RefinementListComponent extends BaseWidget {
  @Input() att: string;

  public state: {
     items: object[];
     refine: Function;
     createURL: Function;
     isFromSearch: boolean;
     searchForItems: Function;
     isShowingMore: boolean;
     canToggleShowMore: boolean;
     toggleShowMore: Function;
     widgetParams: object;
  };
  constructor(
    @Inject(forwardRef(() => NgAisInstantSearch))
    public instantSearchParent
  ) {
    super('RefinementList');
  }
  ngOnInit() {
    this.createWidget(connectRefinementList, {
      // instance options
      attribute: this.att,
    });
    super.ngOnInit();
  }
}
