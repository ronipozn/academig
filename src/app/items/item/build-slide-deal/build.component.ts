import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { slideInOutAnimation } from '../../../shared/animations/index';
import { objectMini } from '../../../shared/services/shared-service';
import { serviceSelect, serviceTypes, Resource, Category } from '../../../shared/services/resource-service';

import {DealType} from '../../services/deal-service';

declare var uploadcare: any;

@Component({
    selector: 'build-slide-deal',
    templateUrl: 'build-slide-deal.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-deal.css']
})

export class BuildSlideDealComponent implements OnInit {
  @Input() newFlag: boolean = true;
  @Input() deal: any = null;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;

  dealType = DealType;

  constructor() { }

  ngOnInit() {
    this.formModel = new FormGroup({
      type: new FormControl(this.deal ? this.deal.type: 0),
      dateStart: new FormControl(this.deal ? this.deal.dateStart: null, Validators.required),
      // dateEnd: new FormControl(this.deal ? this.deal.dateEnd: null, Validators.required),
      webinarLink: new FormControl(this.deal ? this.deal.webinarLink: null, Validators.required),
      webinarDate: new FormControl(this.deal ? this.deal.webinarDate: null, Validators.required),
      terms: new FormControl(this.deal ? this.deal.terms: null),
      features: new FormControl(this.deal ? this.deal.features: null),
      plansTotal: new FormControl(this.deal ? this.deal.plansTotal: null),
      codesTotal: new FormControl(this.deal ? this.deal.codesTotal: null)
    });

    // if (!this.newFlag) this.formModel.controls['name'].setValue(this.resource.name);
  }

  onSubmit() {
    if (this.formModel.valid) {
      // this.disableFlag = true;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
