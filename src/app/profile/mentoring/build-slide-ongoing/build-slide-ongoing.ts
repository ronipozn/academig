import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { UserService } from '../../../user/services/user-service';

import { OnGoing } from '../../../shared/services/mentor-service';

import { slideInOutAnimation } from '../../../shared/animations/index';

@Component({
    selector: 'build-slide-ongoing',
    templateUrl: 'build-slide-ongoing.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-ongoing.css']
})

export class BuildSlideOngoingComponent implements OnInit {
  @Input() newFlag: boolean;
  @Input() ongoing: OnGoing;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus = false;

  constructor(
    public userService: UserService
  ) {
    this.formModel = new FormGroup({
      price: new FormControl(null),
      hours: new FormControl(null),
      details: new FormControl(null),
    });
  }

  ngOnInit() {
    if (!this.newFlag) {
      this.formModel.controls['price'].setValue(this.ongoing.price);
      this.formModel.controls['hours'].setValue(this.ongoing.hours);
      this.formModel.controls['details'].setValue(this.ongoing.details);
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
