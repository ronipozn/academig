import {Component, Input} from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from 'ng2-validation';

@Component({
  selector: 'mentor-self-asses',
  templateUrl: 'mentor-self-asses.html',
  styleUrls: ['mentor-self-asses.css']
})

export class MentorSelfAssesComponent {
  @Input() parentGroup: FormGroup;
  @Input() submitStatus: boolean;
  @Input() invalid: string[] = [];

  @Input() labFlag: boolean;
  @Input() userId: string;

  autoTicks = true;
  disabled = false;
  invert = false;
  max = 5;
  min = 0;
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
