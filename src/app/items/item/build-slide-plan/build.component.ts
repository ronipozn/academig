import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { slideInOutAnimation } from '../../../shared/animations/index';
import { objectMini } from '../../../shared/services/shared-service';
import { serviceSelect, serviceTypes, Resource, Category } from '../../../shared/services/resource-service';

declare var uploadcare: any;

@Component({
    selector: 'build-slide-plan',
    templateUrl: 'build-slide-plan.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-plan.css']
})

export class BuildSlidePlanComponent implements OnInit {
  @Input() index: number;
  @Input() plan: any;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;

  constructor() { }

  ngOnInit() {
    this.formModel = new FormGroup({
      features: new FormControl(this.plan ? this.plan.features : null, Validators.required),
      reducedPrice: new FormControl(this.plan ? this.plan.reducedPrice : null, Validators.required),
      fullPrice: new FormControl(this.plan ? this.plan.fullPrice : null, Validators.required)
    });
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
