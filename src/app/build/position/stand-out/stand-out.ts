import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

import {featuresStandard, featuresGood, featuresBetter, featuresBest} from '../../../shared/services/position-service';

import * as moment from 'moment';

@Component({
  selector: 'stand-out',
  templateUrl: 'stand-out.html',
  styleUrls: ['stand-out.css']
})
export class StandOutComponent {
  @Input() parentGroup: FormGroup;
  @Input() prices: number[];

  mode: number = 0;

  featuresStandard = featuresStandard;
  featuresGood = featuresGood;
  featuresBetter = featuresBetter;
  featuresBest = featuresBest;

  moment: any = moment;

  standoutFunc(i: number) {
    // this.mode = (this.mode==i) ? null : i;
    this.mode = i;
    this.parentGroup.controls['standout'].setValue(this.mode);
  }
}
