import { Component, Input, Inject, forwardRef } from '@angular/core';
import { BaseWidget, NgAisInstantSearch } from 'angular-instantsearch';
import { connectMenu } from 'instantsearch.js/es/connectors';

import {UserService} from '../user/services/user-service';
import {GroupSize} from '../shared/services/group-service';

@Component({
  selector: 'landing-refinement-list',
  template: `
            <div style="height: 10rem; overflow-y: scroll;">
              <p *ngFor="let item of state.items; index as i" class="ml-1 mb-2">
                <input (change)="clickRefine(item.value,item.isRefined)" type="radio" [checked]="item.isRefined" [value]="item.value">
                <span *ngIf="att!='size'" class="ml-2">{{ item.value }}</span>
                <span *ngIf="att=='size'" class="ml-2">{{ groupSize[item.value].name }}</span>
              </p>
            </div>
            `
})
export class LandingRefinementListComponent extends BaseWidget {
  // <label class="ml-2 form-check-label">{{ item.value }}</label>

  // class="form-check-input"

  // <select class="menu-select" (change)="state.refine($event.target.value)">
  //   <option
  //     *ngFor="let item of state.items"
  //     [value]="item.value"
  //     [selected]="item.isRefined">
  //     {{ item.label }}
  //   </option>
  // </select>

  @Input() att: string;

  groupSize = GroupSize;

  public state: {
     items: object[];
     refine: Function;
     createURL: Function;
     isShowingMore: boolean;
     canToggleShowMore: boolean;
     toggleShowMore: Function;
     widgetParams: object;
  };
  constructor(
    private userService: UserService,
    @Inject(forwardRef(() => NgAisInstantSearch))
    public instantSearchParent
  ) {
    super('Menu');
  }
  ngOnInit() {
    this.createWidget(connectMenu, {
      // instance options
      attribute: this.att,
      showMore: true,
      limit: 500,
      showMoreLimit: 501,
      sortBy: ['name:asc'],
    });
    super.ngOnInit();
  }

  clickRefine(value: string, refined: boolean) {
    // this.changeFlagMulti=true;
    // const sum = this.userService.totalRefinements.reduce((a, b) => a + b, 0);
    let attRefined: string;

    switch (this.att) {
      case 'country': attRefined = "countries"; break;
      case 'groupIndex.university.name': attRefined = "universities"; break;
      case 'groupIndex.department.name': attRefined = "disciplines"; break;
      case 'positions.positionName': attRefined = "positions"; break;
      case 'size': attRefined = "size"; break;
    }
    // this.missionService.totalRefinements[this.index] += refined ? -1 : +1;
    // if (refined) {
    //   this.userService.searchRefinements[attRefined] = this.userService.searchRefinements[attRefined].filter(v => v!=value);
    // } else {
    //   this.userService.searchRefinements[attRefined].push(value);
    // }
    this.userService.searchRefinements[attRefined] = [value];
    this.state.refine(value);
  }
}
