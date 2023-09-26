import {Component, Input} from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from 'ng2-validation';

import * as moment from 'moment';

@Component({
  selector: 'mentor-experience-expectations',
  templateUrl: 'mentor-experience-expectations.html',
  styleUrls: ['mentor-experience-expectations.css']
})

export class MentorExperienceExpectationsComponent {
  @Input() parentGroup: FormGroup;
  @Input() submitStatus: boolean;
  @Input() invalid: string[] = [];

  @Input() labFlag: boolean;
  @Input() userId: string;

  autoTicks = true;
  disabled = false;
  invert = false;
  max = 20;
  min = 1;
  showTicks = true;
  step = 1;
  thumbLabel = true;
  value = 0;
  vertical = false;
  tickInterval = 1;

  getSliderTickInterval(): number | 'auto' {
    if (this.showTicks) return this.autoTicks ? 'auto' : this.tickInterval;
    return 0;
  }
}
