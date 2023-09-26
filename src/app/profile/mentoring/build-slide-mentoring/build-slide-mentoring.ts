import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { UserService } from '../../../user/services/user-service';

import { PricesSelect, DurationsSelect, TimesSelect, DaysSelect, AvailabilitySelect, ToolsSelect, Availability } from '../../../shared/services/mentor-service';

import { slideInOutAnimation } from '../../../shared/animations/index';

@Component({
    selector: 'build-slide-mentoring',
    templateUrl: 'build-slide-mentoring.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-mentoring.css']
})

export class BuildSlideMentoringComponent implements OnInit {
  @Input() newFlag: boolean;
  @Input() availability: Availability;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus = false;

  newString: string;

  pricesSelect = PricesSelect;
  durationsSelect = DurationsSelect;
  timesSelect = TimesSelect;
  daysSelect = DaysSelect;
  availabilitySelect = AvailabilitySelect;
  toolsSelect = ToolsSelect;

  constructor(
    public userService: UserService
  ) {
    this.formModel = new FormGroup({
      price: new FormControl(null),
      times: new FormControl(null),
      durations: new FormControl(null),
      days: new FormControl(null),
      availability: new FormControl(null),
      tools: new FormControl(null),
    });
  }

  ngOnInit() {
    if (!this.newFlag) {
      this.formModel.controls['price'].setValue(this.availability.price);
      this.formModel.controls['times'].setValue(this.availability.times);
      this.formModel.controls['durations'].setValue(this.availability.durations);
      this.formModel.controls['days'].setValue(this.availability.days);
      this.formModel.controls['availability'].setValue(this.availability.availability);
      this.formModel.controls['tools'].setValue(this.availability.tools);
    }
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
