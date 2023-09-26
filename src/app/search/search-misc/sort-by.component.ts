import { Component, Inject, forwardRef } from '@angular/core';
import { BaseWidget, NgAisInstantSearch } from 'angular-instantsearch';
import { connectSortBy } from 'instantsearch.js/es/connectors';

@Component({
  selector: 'app-sort-by',
  template: `
             <select (change)="state.refine($event.target.value)">
              <option *ngFor="let option of state.options" [value]="option.value">
                 {{ option.label }}
               </option>
             </select>
            `
})
export class SortByComponent extends BaseWidget {
  public state: {
     options: object[];
     currentRefinement: string;
     hasNoResults: boolean;
     refine: Function;
     widgetParams: object;
  };
  constructor(
    @Inject(forwardRef(() => NgAisInstantSearch))
    public instantSearchParent
  ) {
    super('SortBy');
  }
  ngOnInit() {
    this.createWidget(connectSortBy, {
      // instance options
      items: [
        { label: 'Featured', value: 'dev_companies' },
        { label: 'Price (asc)', value: 'dev_companies_price_asc' },
        { label: 'Price (desc)', value: 'dev_companies_price_desc' },
      ],
    });
    super.ngOnInit();
  }
}
