import {Component, Input} from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from 'ng2-validation';

import * as moment from 'moment';

@Component({
  selector: 'mentor-info',
  templateUrl: 'mentor-info.html',
  styleUrls: ['mentor-info.css']
})

export class MentorInfoComponent {
  @Input() parentGroup: FormGroup;
  @Input() submitStatus: boolean;
  @Input() invalid: string[] = [];

  @Input() labFlag: boolean;
  @Input() userId: string;
}
