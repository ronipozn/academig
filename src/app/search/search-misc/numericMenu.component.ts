import { Component, Input, Inject, forwardRef } from '@angular/core';
import { BaseWidget, NgAisInstantSearch } from 'angular-instantsearch';
import { connectNumericMenu } from 'instantsearch.js/es/connectors';

import {MissionService} from '../services/mission-service';

@Component({
  selector: 'app-numeric-menu',
  template: `
             <p *ngFor="let item of state.items; index as i" class="ml-4 mb-2">
               <input (click)="clickRefine(item.value, i)" class="form-check-input" type="radio" [checked]="item.isRefined" [value]="item.value">
               <label class="form-check-label">
                 {{ state.widgetParams.items[i].name }}
               </label>
             </p>
            `
})
export class NumericMenuComponent extends BaseWidget {
  // <select (change)="onChange(select.selectedOptions[0].value)" #select>
  //   <option *ngFor="let item of state.items; index as i" [value]="item.value">
  //     {{ state.widgetParams.items[i].name }}
  //   </option>
  // </select>

  @Input() att: string;

  public state: {
     items: object[];
     hasNoResults: boolean;
     refine: Function;
     createURL: Function;
     widgetParams: object;
  };

  constructor(
    private missionService: MissionService,
    @Inject(forwardRef(() => NgAisInstantSearch))
    public instantSearchParent
  ) {
    super('NumericMenu');
  }

  ngOnInit() {
    this.createWidget(connectNumericMenu, {
      attribute: this.att,
      items: [
        { end: 0, name: "Less than 5" },
        { start: 1, end: 1, name: "Between 6 and 10" },
        { start: 2, end: 2, name: "Between 11 and 20" },
        { start: 3, end: 3, name: "Between 21 and 30" },
        { start: 4, end: 4, name: "Between 31 and 40" },
        { start: 5, end: 5, name: "Between 41 and 50" },
        { start: 6, end: 6, name: "More than 51" },
        { name: "All" }
      ],
    });
    super.ngOnInit();
  }

  clickRefine(value: string, i: number) {
    // if (refined) {
      // this.missionService.refinements[this.att] = 'All';
    // } else {
      this.missionService.refinements[this.att] = i;
    // }
    this.state.refine(value)
  }

  // export let CompanySize = [
  //   { "id": 0, "name": "1-10", "low": 1, "high": 10 },
  //   { "id": 1, "name": "11-50", "low": 11, "high": 50 },
  //   { "id": 2, "name": "51-100", "low": 51, "high": 100 },
  //   { "id": 3, "name": "101-250", "low": 101, "high": 250 },
  //   { "id": 4, "name": "251-500", "low": 251, "high": 500 },
  //   { "id": 5, "name": "501-1000", "low": 501, "high": 1000 },
  //   { "id": 6, "name": "1001-5000", "low": 1001, "high": 5000 },
  //   { "id": 7, "name": "5001-10000", "low": 5001, "high": 10000 },
  //   { "id": 8, "name": "10001+", "low": 10001, "high": null },
  // ];
}
