import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';

import { UserService } from '../../../user/services/user-service';
import { slideInOutAnimation } from '../../../shared/animations/index';

import { Expertise, ExpertisesSelect } from '../../../shared/services/mentor-service';

@Component({
    selector: 'build-slide-expertise',
    templateUrl: 'build-slide-expertise.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-expertise.css']
})

export class BuildSlideExpertiseComponent implements OnInit {
  @Input() expertise: Expertise;
  @Input() newFlag: boolean;
  @Input() type = 0;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;

  expertisesSelect = ExpertisesSelect;

  constructor(
    public userService: UserService
  ) {
    this.formModel = new FormGroup({
      name: new FormControl(null, Validators.required),
      years: new FormControl(null, Validators.required),
      description: new FormControl(null, Validators.required),
    });
  }

  ngOnInit() {
    if (!this.newFlag) {
      this.formModel.controls['name'].setValue(this.expertise.name);
      this.formModel.controls['years'].setValue(this.expertise.years);
      this.formModel.controls['description'].setValue(this.expertise.description);
    }
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.disableFlag = true;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
