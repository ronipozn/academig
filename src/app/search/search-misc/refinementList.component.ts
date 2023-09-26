import { Component, Input, OnInit, Inject, forwardRef, DoCheck, IterableDiffers, Output, EventEmitter } from '@angular/core';
import { BaseWidget, NgAisInstantSearch } from 'angular-instantsearch';
import { connectRefinementList } from 'instantsearch.js/es/connectors';

import {MissionService} from '../services/mission-service';

import {GroupSize} from '../../shared/services/group-service';
import {EventType, ProductType, PodcastType} from '../../items/services/item-service';
import {DealType} from '../../items/services/deal-service';
import {titlesTypes} from '../../shared/services/people-service';

@Component({
  selector: 'app-refinement-list',
  template: `
    <div>
      <p *ngFor="let item of state.items; let i=index" class="mb-2">
        <input type="checkbox" (click)="clickRefine(item.value,item.isRefined,i)" [checked]="item.isRefined" class="mr-1">
        <span [ngSwitch]="att">
          <span *ngSwitchCase="'size'">{{groupSize[item.label].name}}</span>
          <span *ngSwitchCase="'positions.titles'">{{titlesSelect[item.label]}}</span>
          <span *ngSwitchCase="'type'">
            <span [ngSwitch]="index">
              <span *ngSwitchCase="601">{{trendType[item.label]}}</span>
              <span *ngSwitchCase="700">{{podcastType[item.label]}}</span>
              <span *ngSwitchCase="800">{{eventType[item.label]}}</span>
              <span *ngSwitchCase="900">{{productType[item.label]}}</span>
              <span *ngSwitchCase="1001">{{item.label}}</span>
            </span>
          </span>
          <span *ngSwitchCase="'deal.status'">{{dealStatus[item.label]}}</span>
          <span *ngSwitchCase="'deal.type'">{{dealType[item.label]}}</span>
          <span *ngSwitchDefault>{{item.label}}</span>
        </span>
        ({{ item.count }})
      </p>

      <p *ngIf="state.items && state.items.length==0" class="text-muted small">
        <i>Empty</i>
      </p>

      <p *ngIf="state.items && (state.items.length>=5 || state.isShowingMore)" class="mb-1">
        <a style="cursor:pointer; color:blue;" (click)="state.toggleShowMore()" class="small">
         Show {{state.isShowingMore ? 'less' : 'more' }}
        </a>
      </p>

    </div>
   `
})

// style="max-height: 15.4rem; overflow-y: scroll";

// <input type="checkbox" (click)="state.refine(item.value)" [checked]="item.isRefined"> {{ item.label }} ({{ item.count }})

// <span class="form-check">
//   <label class="form-check-label">
//     <input class="form-check-input" type="checkbox" (click)="state.refine(item.value)" [checked]="item.isRefined"> {{ item.label }} ({{ item.count }})
//     <span class="form-check-sign"><span class="check"></span></span>
//   </label>
// </span>

export class RefinementListComponent extends BaseWidget {
  @Input() missionFlag: boolean = true;
  @Input() att: string;
  @Input() plan: number;
  @Input() index: number;

  @Output() upgrage: EventEmitter <number> = new EventEmitter();

  @Input() set refineSelect(value: string) {
    // this.refine = value;
  }

  @Input() set refinesSelect(value: string[]) {
    this.refines = value;
    // this.stateRefine();
    // this.stateRefineMulti();
  }

  trendType: string[] = [];
  podcastType: string[] = PodcastType;
  eventType: string[] = EventType;
  productType: string[] = ProductType;

  dealType: string[] = DealType;
  dealStatus: string[] = ["Current", "Ending", "Expired"];

  groupSize = GroupSize;
  titlesSelect = titlesTypes;

  differ: any;

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
    private missionService: MissionService,
    private differs: IterableDiffers,
    @Inject(forwardRef(() => NgAisInstantSearch))
    public instantSearchParent
  ) {
    super('RefinementList');
    this.differ = differs.find([]).create(null);
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

  ngAfterViewChecked() {
    // this.stateRefine();
    this.stateRefineMulti();
  }

  clickRefine(value: string, refined: boolean, i: number) {
    this.changeFlagMulti=true;

    const sum = this.missionFlag ? this.missionService.totalRefinements.reduce((a, b) => a + b, 0) : 0;

    let attRefined: string;

    if (((sum==3 && this.plan==0) || (sum==25 && this.plan>0)) && refined==false) {
      this.state.refine(value);
      this.state.refine(value);
      this.upgrage.emit();
    } else {
      switch (this.att) {
        case 'country': attRefined = "countries"; break;
        case 'state': attRefined = "states"; break;
        case 'city': attRefined = "cities"; break;
        case 'groupIndex.university.name': attRefined = "universities"; break;
        case 'groupIndex.department.name': attRefined = "disciplines"; break;
        case 'discipline': attRefined = "disciplines"; break;
        case 'facility': attRefined = "facilities"; break;
        case 'control': attRefined = "controls"; break;
        case 'entity': attRefined = "entities"; break;
        case 'campus': attRefined = "campuses"; break;
        case 'positions.positionName': attRefined = "positions"; break;
        case 'peoples.title': attRefined = "head"; break;
        case 'interests': attRefined = "interests"; break;
        case 'size': attRefined = "size"; break;
        case 'language': attRefined = "languages"; break;
        case 'category': attRefined = "categories"; break;
        case 'type': attRefined = "types"; break;
        case 'sub': attRefined = "subs"; break;
        case 'tag': attRefined = "tags"; break;
        case 'author.name': attRefined = "authors"; break;
        default: attRefined = this.att;
      }

      if (this.att=="positions.positionName") {
        this.missionService.jobFilters += refined ? -1 : +1;
      }

      if (this.missionFlag) {
        if (this.missionService.totalRefinements[this.index]==null) {
          this.missionService.totalRefinements[this.index] = refined ? -1 : +1;
        } else {
          this.missionService.totalRefinements[this.index] += refined ? -1 : +1;
        }
        if (refined) {
          if (this.missionService.refinements[attRefined]) {
            this.missionService.refinements[attRefined] = this.missionService.refinements[attRefined].filter(v => v!=value);
          }
        } else {
          if (this.missionService.refinements[attRefined]) {
            this.missionService.refinements[attRefined].push(value);
          }
        }
        this.missionService.currentPage = 0;
      }

      this.state.refine(value);
    }
  }

  stateRefine() {
    this.state.isShowingMore = true;

    // if (this.att=="groupIndex.department.name" || this.att=="categoryName" || this.att=="positionName" || this.att=="country" || this.att=="state" || this.att=="city" || this.att=="intrests" || this.att=="researchInterests" || this.att=="tags") {
      this.items = this.state.items;
      const change = this.differ.diff(this.items);

      if (change && this.refine && this.changeFlag==false) {
        this.changeFlag=true;
        if (this.state && this.state.items) {
          // this.state.refine(this.state.items.filter(r => r.value=="Modeling & Simulation")[0].value)
          const valueArr = this.state.items.filter(r => r.value==this.refine);
          if (valueArr[0]) this.state.refine(valueArr[0].value).value;
        }
      }
    // }
  }

  stateRefineMulti() {
    this.items = this.state.items;
    const change = this.differ.diff(this.items);
    // console.log("change",change)
    // console.log("this.state.items",this.state.items)
    if (change && ((this.refines || []).length>0) && this.changeFlagMulti==false) {
      this.changeFlagMulti=true;
      if (this.state && this.state.items) {
        this.refines.forEach((refine, index) => {
          const valueArr = this.state.items.filter(r => r.value==refine);
          if (valueArr[0]) this.state.refine(valueArr[0].value).value;
        })
      }
    }
  }

  // stateRefineSetter(selectValue: string) {
  //   this.state.isShowingMore = true;
  //
  //   if (this.att=="groupIndex.department.name" || this.att=="categoryName" || this.att=="positionName" || this.att=="interests" || this.att=="researchInterests" || this.att=="country") {
  //     var updateRefine: boolean = false;
  //     var indexRefine: number;
  //
  //     this.items = this.state.items;
  //     if (this.state && this.state.items) {
  //       this.state.items.forEach((item, index) => {
  //         if (item.isRefined) {
  //           if (item.value!=selectValue) this.state.refine(item.value)
  //         } else {
  //           if (item.value==selectValue) {
  //             indexRefine = index;
  //             updateRefine = true
  //           }
  //         }
  //       });
  //       if (updateRefine) this.state.refine(this.state.items[indexRefine].value)
  //     }
  //   }
  // }

}
