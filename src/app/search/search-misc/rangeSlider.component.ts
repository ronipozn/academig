import { Component, Input, Inject, forwardRef } from '@angular/core';
import { BaseWidget, NgAisInstantSearch } from 'angular-instantsearch';
import { connectRange } from 'instantsearch.js/es/connectors';

import {MissionService} from '../services/mission-service';

@Component({
  selector: 'app-range-slider',
  template: `
            <div *ngIf="initFlag && state.range.min!=state.range.max" class="ml-3 py-2">
              <nouislider class="slider slider-info"
                          [connect]="true"
                          [min]="state.range.min"
                          [max]="state.range.max"
                          [step]="1"
                          [(ngModel)]="doubleSlider"
                          (ngModelChange)="onChange($event)"
                          [tooltips]="true">
              </nouislider>
            </div>
            <p *ngIf="initFlag && state.range.min==state.range.max" class="text-muted small mb-0">
              <i>Empty</i>
            </p>
            `
})
export class RangeSliderComponent extends BaseWidget {
  @Input() att: string;

  initFlag: boolean = false;
  doubleSlider: number[] = [];

  attRefined: string;

  public state: {
    start: number[];
    // range: object;
    range: any;
    refine: Function;
    widgetParams: object;
  };

  constructor(
    private missionService: MissionService,
    @Inject(forwardRef(() => NgAisInstantSearch))
    public instantSearchParent
  ) {
    super('RangeSlider');
  }

  onChange(event) {

    switch (this.att) {
      case 'rank.times': this.attRefined = "times"; break;
      case 'rank.shanghai': this.attRefined = "shanghai"; break;
      case 'rank.top': this.attRefined = "top"; break;
      case 'rank.usnews': this.attRefined = "usnews"; break;
      case 'rank.facebook': this.attRefined = "facebook"; break;
      case 'rank.twitter': this.attRefined = "twitter"; break;
      case 'rank.linkedin': this.attRefined = "linkedin"; break;
      case 'rank.instagram': this.attRefined = "instagram"; break;
      case 'rank.youtube': this.attRefined = "youtube"; break;
      default: this.attRefined = this.att;
    }

    this.missionService.refinements[this.attRefined] = (event[0]>this.state.range.min || event[1]<this.state.range.max) ? ([event[0], event[1]]) : null;
    this.missionService.currentPage = 0;
    this.state.refine([event[0], event[1]])
    // this.doubleSlider=event;
  }

  ngOnInit() {
    this.createWidget(connectRange, {
      attribute: this.att,
    });
    super.ngOnInit();
  }

  // ngAfterViewChecked() {
  //   this.stateRefineMulti();
  // }

  ngDoCheck() {
    if (this.initFlag==false && this.state.range && this.state.range.min>0) {
      if (this.missionService.refinements[this.attRefined]) {
        this.doubleSlider= this.missionService.refinements[this.attRefined]
        this.state.refine(this.doubleSlider);
      } else {
        this.doubleSlider= [this.state.range.min,this.state.range.max];
      }
      // this.missionService.refinements[this.attRefined]=this.doubleSlider;
      this.initFlag=true;
    }
  }

}

// <div *ngIf="state.range">
//   <input
//     type="range"
//     class="custom-range"
//     #input
//     [min]="state.range.min"
//     [max]="state.range.max"
//     (change)="state.refine([state.range.min, input.value])"
//   />
//   {{input.value}}
// </div>

// <span *ngIf="state.range">
//    {{state.range.min}}<br>
//    {{state.range.max}}
// </span>
