import { Component, Input, Inject, forwardRef } from '@angular/core';
import { BaseWidget, NgAisInstantSearch } from 'angular-instantsearch';
import { connectCurrentRefinements } from 'instantsearch.js/es/connectors';

import {MissionService} from '../services/mission-service';

import {GroupSize} from '../../shared/services/group-service';
import {EventType, ProductType, PodcastType} from '../../items/services/item-service';
import {titlesTypes} from '../../shared/services/people-service';

@Component({
  selector: 'current-refinements',
  template: `
            <div class="ais-CurrentRefinements">
              <ul class="ais-CurrentRefinements-list">
                <ng-container *ngFor="let item of state.items; let i=index">
                  <li *ngIf="item.attribute!='interests'" class="ais-CurrentRefinements-item mb-2">
                    <span class="ais-CurrentRefinements-label" [ngSwitch]="item.attribute">
                      <span *ngSwitchCase="'country'">Country:</span>
                      <span *ngSwitchCase="'state'">State:</span>
                      <span *ngSwitchCase="'city'">City:</span>
                      <span *ngSwitchCase="'groupIndex.university.name'">University:</span>
                      <span *ngSwitchCase="'groupIndex.department.name'">Discipline:</span>
                      <span *ngSwitchCase="'size'">Lab size:</span>
                      <span *ngSwitchCase="'peoples.title'">Lab Head:</span>
                      <span *ngSwitchCase="'positions.positionName'">Position:</span>
                      <span *ngSwitchCase="'establish'">Year of establishment:</span>
                      <span *ngSwitchCase="'rank.times'">Times Higher Education:</span>
                      <span *ngSwitchCase="'rank.shanghai'">Shanghai Jiao Tong University:</span>
                      <span *ngSwitchCase="'rank.top'">TopUniversities:</span>
                      <span *ngSwitchCase="'rank.usnews'">U.S. News & World Report:</span>
                      <span *ngSwitchCase="'rank.facebook'">Facebook fans:</span>
                      <span *ngSwitchCase="'rank.twitter'">Twitter followers:</span>
                      <span *ngSwitchCase="'rank.linkedin'">LinkedIn fans:</span>
                      <span *ngSwitchCase="'rank.instagram'">Instagram fans:</span>
                      <span *ngSwitchCase="'rank.youtube'">YouTube fans:</span>
                      <span *ngSwitchCase="'type'">Type:</span>
                    </span>
                    <span *ngFor="let refinement of item.refinements" class="ais-CurrentRefinements-category mr-2">
                      <span class="ais-CurrentRefinements-categoryLabel" [ngSwitch]="item.attribute">
                        <span *ngSwitchCase="'size'">{{groupSize[refinement.label].name}}</span>
                        <span *ngSwitchCase="'positions.titles'">{{titlesSelect[refinement.label]}}</span>
                        <span *ngSwitchCase="'type'">
                          <span [ngSwitch]="sourceType">
                            <span *ngSwitchCase="4">{{trendType[refinement.label]}}</span>
                            <span *ngSwitchCase="5">{{podcastType[refinement.label]}}</span>
                            <span *ngSwitchCase="6">{{eventType[refinement.label]}}</span>
                            <span *ngSwitchCase="7">{{productType[refinement.label]}}</span>
                          </span>
                        </span>
                        <span *ngSwitchDefault>{{refinement.label}}</span>
                      </span>
                      <button class="ais-CurrentRefinements-delete" (click)="clickRefine(refinement, item.attribute, i)">✕</button>
                    </span>
                  </li>
                </ng-container>
              </ul>
            </div>
            `
})
export class CurrentRefinements extends BaseWidget {
  // <div class="ais-CurrentRefinements my-2" [ngClass]="{'mb-4': state.items?.length>0}">

  @Input() sourceType: number = 0;

  // <div class="ais-CurrentRefinements my-2">
  //   <ul class="ais-CurrentRefinements-list">
  //     <li *ngFor="let item of state.items; let i=index" class="ais-CurrentRefinements-item">
  //       <span *ngFor="let refinement of item.refinements" class="ais-CurrentRefinements-category mr-2">
  //         <span class="ais-CurrentRefinements-categoryLabel">
  //           <span *ngIf="item.attribute!='size'">{{ refinement.label }}</span>
  //           <span *ngIf="item.attribute=='size'">{{ groupSize[refinement.label].name }}</span>
  //         </span>
  //         <button class="ais-CurrentRefinements-delete" (click)="clickRefine(refinement, item.attribute, i)">✕</button>
  //       </span>
  //     </li>
  //   </ul>
  // </div>

  // <ul>
  //   <li *ngFor="let item of state.items">
  //     {{ item.attribute }}:
  //     <span *ngFor="let refinement of item.refinements">
  //       {{ refinement.label }}
  //     </span>
  //   </li>
  // </ul>

  trendType: string[] = [];
  podcastType: string[] = PodcastType;
  eventType: string[] = EventType;
  productType: string[] = ProductType;
  groupSize = GroupSize;
  titlesSelect = titlesTypes;

  public state: {
     items: any[];
     refine: Function;
     createURL: Function;
     widgetParams: object;
  };

  constructor(
    // private userService: UserService,
    private missionService: MissionService,
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
      case 'state': attRefined = "states"; break;
      case 'city': attRefined = "cities"; break;

      case 'positions.group.university.name': attRefined = "universities"; break;
      case 'groupIndex.university.name': attRefined = "universities"; break;

      case 'positions.group.department.name': attRefined = "disciplines"; break;
      case 'groupIndex.department.name': attRefined = "disciplines"; break;

      case 'positions.titles': attRefined = "positions"; break;
      case 'positions.positionName': attRefined = "positions"; break;

      case 'peoples.title': attRefined = "head"; break;

      case 'size': attRefined = "size"; break;
      case 'establish': attRefined = "establish"; break;

      case 'rank.times': attRefined = "times"; break;
      case 'rank.shanghai': attRefined = "shanghai"; break;
      case 'rank.top': attRefined = "top"; break;
      case 'rank.usnews': attRefined = "usnews"; break;
      case 'rank.facebook': attRefined = "facebook"; break;
      case 'rank.twitter': attRefined = "twitter"; break;
      case 'rank.linkedin': attRefined = "linkedin"; break;
      case 'rank.instagram': attRefined = "instagram"; break;
      case 'rank.youtube': attRefined = "youtube"; break;

      default: attRefined = att; break;
    }

    if (att=="positions.positionName") this.missionService.jobFilters -= 1;

    this.missionService.currentPage = 0;
    this.missionService.refinements[attRefined] = this.missionService.refinements[attRefined].filter(v => v!=refinement.value);

    this.missionService.totalRefinements.forEach((refine, index) => {
      this.missionService.totalRefinements[index] = 0;
    })
    // if (this.missionService.totalRefinements[this.index]==null) {
    //   this.missionService.totalRefinements[this.index] = refined ? -1 : +1;
    // } else {
    //   this.missionService.totalRefinements[this.index] += refined ? -1 : +1;
    // }

    this.state.items[i].refine(refinement);
  }
}
