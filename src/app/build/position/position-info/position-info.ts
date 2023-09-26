import {Component, Input} from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';
import {CustomValidators} from 'ng2-validation';

import {openPositionSelect} from '../../../shared/services/people-service';

import * as moment from 'moment';

@Component({
  selector: 'position-info',
  templateUrl: 'position-info.html',
  styleUrls: ['position-info.css']
})

export class PositionInfoComponent {
  @Input() parentGroup: FormGroup;
  @Input() submitStatus: boolean;
  @Input() invalid: string[] = [];

  typeSelect = ["Full-time", "Part-time", "Contract", "Internship", "Volunteer"];
  lengthSelect = ['Months', 'Years'];
  lengthLabel = ['(Months)', '(Years)'];
  spotSelect = [1, 2, 3, 4, 5];
  refereeSelect = [1, 2, 3, 4, 5];

  howSelect = ["Candidates apply with their Academig profile", "Send you an email directly", "Direct applicants to an external site to apply"];
  directSelect = ["", "Email address to apply", "External website to apply"]

  currencySelect = ['Dollar', 'Euro', 'Yen', 'British Pound'];
  // currencySelect = ['Dollar', 'Euro', 'Pound', 'Shekel', 'Won', 'Ruble', 'Rupee', 'Yen', 'Yuan'];

  // styleRadio = ["Short", "Detailed"];
  // asapSelect = ["As soon as possible"];
  // extendSelect = ["Including an option to extend the contract"];
  titleSelect = openPositionSelect;

  datesRangeValid: boolean = null;
  datesBeforeValid: boolean = null;

  lettersSelect = [
    {value: 0, viewValue: 'Curriculum vitae'},
    {value: 1, viewValue: 'Letter of motivation'},
    {value: 2, viewValue: 'Letter of interest'},
    {value: 3, viewValue: 'Cover letter'},
    {value: 4, viewValue: 'Project proposal'},
    {value: 5, viewValue: 'Teaching statement'},
  ];

  gradesSelect = [
    {value: 0, viewValue: 'GPA'},
    {value: 1, viewValue: 'GRE'},
    {value: 2, viewValue: 'TOEFL'},
  ];

  periodFunc() {
    (<FormGroup>this.parentGroup.controls['contract']).controls['length'].enable();
    (<FormGroup>this.parentGroup.controls['contract']).controls['length'].setValidators([Validators.required]);
    (<FormGroup>this.parentGroup.controls['contract']).controls['length'].updateValueAndValidity();
  }

  howFunc() {
    switch ((<FormGroup>this.parentGroup.controls['apply']).controls['how'].value) {
      case 0: {
        (<FormGroup>this.parentGroup.controls['apply']).controls['direct'].setValue('');
        (<FormGroup>this.parentGroup.controls['apply']).controls['direct'].clearValidators();
        (<FormGroup>this.parentGroup.controls['apply']).controls['direct'].disable();
        break;
      }
      case 1: {
        (<FormGroup>this.parentGroup.controls['apply']).controls['direct'].enable();
        (<FormGroup>this.parentGroup.controls['apply']).controls['direct'].setValidators([Validators.required]);
        break;
      }
      case 2: {
        (<FormGroup>this.parentGroup.controls['apply']).controls['direct'].enable();
        (<FormGroup>this.parentGroup.controls['apply']).controls['direct'].setValidators([Validators.required, CustomValidators.url]);
        break;
      }
    }
    (<FormGroup>this.parentGroup.controls['apply']).controls['direct'].updateValueAndValidity();
  }

  datesValidatelFunc() {
    const datesArray: string[] = [];

    const jobEndDate = this.parentGroup.controls['jobEndDate'].value ? moment(this.parentGroup.controls['jobEndDate'].value).format("YYYY-MM-DD") : null;
    const jobDescisionDate = this.parentGroup.controls['jobDescisionDate'].value ? moment(this.parentGroup.controls['jobDescisionDate'].value).format("YYYY-MM-DD") : null;
    const jobStartDate = this.parentGroup.controls['jobStartDate'].value ? moment(this.parentGroup.controls['jobStartDate'].value).format("YYYY-MM-DD") : null;

    if (jobEndDate) datesArray.push(jobEndDate)
    if (jobDescisionDate) datesArray.push(jobDescisionDate)
    if (jobStartDate) datesArray.push(jobStartDate)

    const datesArraySort = Array.prototype.slice.call(datesArray).sort() // sort and nonMutating

    if (
        (jobEndDate!=null && jobDescisionDate!=null && jobEndDate==jobDescisionDate) ||
        (jobEndDate!=null && jobStartDate!=null && jobEndDate==jobStartDate) ||
        (jobDescisionDate!=null && jobStartDate!=null && jobDescisionDate==jobStartDate)
       ) {
      this.datesRangeValid = false;
    } else {
      this.datesRangeValid = (JSON.stringify(datesArray) == JSON.stringify(datesArraySort))
    }

    if (moment(jobEndDate).isBefore() || moment(jobDescisionDate).isBefore() || moment(jobStartDate).isBefore()) {
      this.datesBeforeValid = false;
    } else {
      this.datesBeforeValid = true;
    }
  }

}
