import { Component, Inject, forwardRef } from '@angular/core';
import { BaseWidget, NgAisInstantSearch } from 'angular-instantsearch';
import { connectCurrentRefinements } from 'instantsearch.js/es/connectors';

import {UserService} from '../user/services/user-service';
import {GroupSize} from '../shared/services/group-service';

@Component({
  selector: 'landing-current-refinements',
  template: `
            <div class="ais-CurrentRefinements mb-3">
              <ul class="ais-CurrentRefinements-list">
                <li *ngFor="let item of state.items; let i=index" class="ais-CurrentRefinements-item">
                  <span class="ais-CurrentRefinements-label" [ngSwitch]="item.attribute">
                    <span *ngSwitchCase="'country'">Country:</span>
                    <span *ngSwitchCase="'groupIndex.university.name'">University:</span>
                    <span *ngSwitchCase="'groupIndex.department.name'">Department:</span>
                    <span *ngSwitchCase="'size'">Lab size:</span>
                    <span *ngSwitchCase="'positions.positionName'">Position:</span>
                  </span>
                  <span *ngFor="let refinement of item.refinements" class="ais-CurrentRefinements-category">
                    <span class="ais-CurrentRefinements-categoryLabel">
                      <span *ngIf="item.attribute!='size'">{{ refinement.label }}</span>
                      <span *ngIf="item.attribute=='size'">{{ groupSize[refinement.label].name }}</span>
                    </span>
                    <button class="ais-CurrentRefinements-delete" (click)="clickRefine(refinement, item.attribute, i)">✕</button>
                  </span>
                </li>
              </ul>
            </div>
            `
})
export class LandingCurrentRefinements extends BaseWidget {
  // <ul>
  //   <li *ngFor="let item of state.items">
  //     {{ item.attribute }}:
  //     <span *ngFor="let refinement of item.refinements">
  //       {{ refinement.label }}
  //     </span>
  //   </li>
  // </ul>

  groupSize = GroupSize;

  public state: {
     items: any[];
     refine: Function;
     createURL: Function;
     widgetParams: object;
  };
  constructor(
    private userService: UserService,
    @Inject(forwardRef(() => NgAisInstantSearch))
    public instantSearchParent
  ) {
    super('CurrentRefinements');
  }
  ngOnInit() {
    this.createWidget(connectCurrentRefinements, {
      // instance options
    });
    super.ngOnInit();
  }

  clickRefine(refinement, att: string, i: number) {
    let attRefined: string;

    switch (att) {
      case 'country': attRefined = "countries"; break;
      case 'groupIndex.university.name': attRefined = "universities"; break;
      case 'groupIndex.department.name': attRefined = "disciplines"; break;
      case 'positions.positionName': attRefined = "positions"; break;
    }

    this.userService.searchRefinements[attRefined] = this.userService.searchRefinements[attRefined].filter(v => v!=refinement.value);
    this.state.items[i].refine(refinement);
  }
}
