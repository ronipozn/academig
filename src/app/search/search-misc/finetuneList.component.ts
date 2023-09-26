import { Component, Input, OnInit, Inject, forwardRef } from '@angular/core';
import { BaseWidget, NgAisInstantSearch } from 'angular-instantsearch';
import { connectRefinementList } from 'instantsearch.js/es/connectors';

import {MissionService} from '../services/mission-service';

@Component({
  selector: 'app-finetune-list',
  template: `
      <ng-container *ngIf="missionService.query && state.items?.length>0">

        <div class="mb-1 text-dark"><b>Fine-tune your search</b></div>

        <div class="ais-CurrentRefinements">
          <ul class="ais-CurrentRefinements-list">
            <li *ngFor="let item of state.items; let i=index" class="ais-CurrentRefinements-item">
              <span class="ais-CurrentRefinements-label d-flex align-items-center" [ngSwitch]="item.attribute">
                <input type="checkbox" (click)="clickRefine(item.value,item.isRefined,i)" [checked]="item.isRefined" class="mr-2">
                {{ item.label }}
                ({{ item.count }})
              </span>
            </li>
          </ul>
        </div>

        <p *ngIf="state.items && (state.items.length>=5 || state.isShowingMore)" class="mb-1">
          <a style="cursor:pointer; color:blue;" (click)="state.toggleShowMore()" class="small">
           Show {{state.isShowingMore ? 'less' : 'more' }}
          </a>
        </p>

      </ng-container>
   `
})

// || state.items?.length>0

// style="max-height: 15.4rem; overflow-y: scroll";

// <input type="checkbox" (click)="state.refine(item.value)" [checked]="item.isRefined"> {{ item.label }} ({{ item.count }})

// <span class="form-check">
//   <label class="form-check-label">
//     <input class="form-check-input" type="checkbox" (click)="state.refine(item.value)" [checked]="item.isRefined"> {{ item.label }} ({{ item.count }})
//     <span class="form-check-sign"><span class="check"></span></span>
//   </label>
// </span>

export class FinetuneListComponent extends BaseWidget {
  @Input() missionFlag: boolean = true;
  @Input() att: string;
  @Input() plan: number;
  @Input() index: number;

  refine: string;
  changeFlag: boolean = false;

  refines: string[] = [];
  changeFlagMulti: boolean = false;

  items: object[];

  public state: {
    // items: object[];
    items: any[];
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
    public missionService: MissionService,
    @Inject(forwardRef(() => NgAisInstantSearch))
    public instantSearchParent
  ) {
    super('FinetuneList');
  }

  public ngOnInit() {
     this.createWidget(connectRefinementList, {
       // instance options
       attribute: this.att,
       showMore: true,
       limit: 5,
       showMoreLimit: 15,
     });
     super.ngOnInit();
  }

  clickRefine(value: string, refined: boolean, i: number) {
    this.state.refine(value);
  }

}
