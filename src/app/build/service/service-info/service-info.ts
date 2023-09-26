import {Component, Output, Input, EventEmitter} from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from 'ng2-validation';

import {openPositionSelect} from '../../../shared/services/people-service';
import {ServicePriceType, ServicePriceMode, serviceSelect, Resource, Category} from '../../../shared/services/resource-service';
import {objectMini} from '../../../shared/services/shared-service';

import * as moment from 'moment';

@Component({
  selector: 'service-info',
  templateUrl: 'service-info.html',
  styleUrls: ['service-info.css']
})

export class ServiceInfoComponent {
  @Input() parentGroup: FormGroup;
  @Input() submitStatus: boolean;
  @Input() invalid: string[] = [];

  @Input() labFlag: boolean;
  @Input() groupId: string;
  @Input() userId: string;

  @Output() membersOutput: EventEmitter <objectMini[]> = new EventEmitter();
  @Output() projectsOutput: EventEmitter <objectMini[]> = new EventEmitter();

  categorySelect = serviceSelect;
  priceTypeRadio = ServicePriceType;
  priceModeRadio = ServicePriceMode;

  howSelect = ["Request a service using Academig", "Send you an email directly", "Direct to an external site"];
  directSelect = ["", "Email address", "External website"]

  titleSelect = openPositionSelect;

  datesRangeValid: boolean = null;
  datesBeforeValid: boolean = null;

  howFunc() {
    switch ((<FormGroup>this.parentGroup.controls['request']).controls['how'].value) {
      case 0: {
        (<FormGroup>this.parentGroup.controls['request']).controls['direct'].setValue('');
        (<FormGroup>this.parentGroup.controls['request']).controls['direct'].clearValidators();
        (<FormGroup>this.parentGroup.controls['request']).controls['direct'].disable();
        break;
      }
      case 1: {
        (<FormGroup>this.parentGroup.controls['request']).controls['direct'].enable();
        (<FormGroup>this.parentGroup.controls['request']).controls['direct'].setValidators([Validators.required]);
        break;
      }
      case 2: {
        (<FormGroup>this.parentGroup.controls['request']).controls['direct'].enable();
        (<FormGroup>this.parentGroup.controls['request']).controls['direct'].setValidators([Validators.required, CustomValidators.url]);
        break;
      }
    }
    (<FormGroup>this.parentGroup.controls['request']).controls['direct'].updateValueAndValidity();
  }

  membersFunc(event: objectMini[]) {
    this.membersOutput.emit(event)
  }

}
