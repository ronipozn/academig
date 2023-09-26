import { Component, Input, Inject, forwardRef } from '@angular/core';
import { BaseWidget, NgAisInstantSearch } from 'angular-instantsearch';
import { connectClearRefinements } from 'instantsearch.js/es/connectors';

import {MissionService} from '../services/mission-service';

@Component({
  selector: 'app-refinement-clear',
  template: `
             <a *ngIf="state.hasRefinements" style="cursor:pointer" [ngClass]="{'text-dark': att==null, 'text-danger': att!=null}" (click)="clickRefine()">
               <b>{{(att==null) ? 'Clear all filters' : 'Clear filters'}}</b>
               <p *ngIf="att!=null"></p>
             </a>
            `
})

// <div class="my-2" [ngClass]="{'mb-2': att==null}">
// <i class="fa fa-times" aria-hidden="true"></i>
// </div>

// <a *ngIf="state.hasRefinements" style="cursor:pointer" [ngClass]="{'text-black': att==null, 'text-danger': att!=null}" (click)="clickRefine()">
//  <i class="fa fa-times" aria-hidden="true"></i> Clear all
// </a>

// <a *ngIf="state.hasRefinements" style="cursor:pointer" [ngClass]="{'text-white': att==null, 'text-danger': att!=null}" (click)="clickRefine()">

export class ClearRefinementsComponent extends BaseWidget {
  @Input() att: string;
  @Input() index: number;

  public state: {
     hasRefinements: boolean;
     refine: Function;
     createURL: Function;
     widgetParams: object;
  };

  constructor(
    private missionService: MissionService,
    @Inject(forwardRef(() => NgAisInstantSearch))
    public instantSearchParent
  ) {
    super('ClearRefinements');
  }

  clickRefine() {
    this.state.refine();
    this.missionService.currentPage = 0;
    if (this.att==null) {
      this.missionService.totalRefinements.forEach((refine, index) => {
        this.missionService.totalRefinements[index] = 0;
        // refine = 0;
      })
    } else {
      this.missionService.currentPage = 0;
      this.missionService.totalRefinements[this.index] = 0;
      if (this.att=="positions.positionName") {
        this.missionService.jobFilters=0;
        // this.missionService.jobRemoveFlag = true;
      }
    }
  }

  ngOnInit() {
    if (this.att==null) {
      this.createWidget(connectClearRefinements, {

      });
    } else {
      this.createWidget(connectClearRefinements, {
        includedAttributes: [this.att]
      });
    }

    super.ngOnInit();
  }
}
