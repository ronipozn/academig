import {Component, Input} from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'extras-lab',
  templateUrl: 'extras.html',
  styleUrls: ['extras.css']
})
export class ExtrasLabComponent {
  @Input() parentGroup: FormGroup;
  @Input() prices: number[];

  sameClubFunc() {
    this.parentGroup.controls['clubEmailSame'].value ? this.parentGroup.controls['clubEmail'].disable() : this.parentGroup.controls['clubEmail'].enable();
    if (this.parentGroup.controls['clubEmailSame'].value) this.parentGroup.controls['clubEmail'].setValue('')
  }

  flagClubFunc() {
    if (this.parentGroup.controls['clubStatus'].value) {
      this.parentGroup.controls['clubEmail'].setValidators(Validators.required);
    } else {
      this.parentGroup.controls['clubEmail'].setValidators(null);
      // this.parentGroup.controls['clubEmail'].clearValidators();
    }
    this.parentGroup.controls['clubEmail'].updateValueAndValidity();
  }

  sameInterviewFunc() {
    this.parentGroup.controls['interviewEmailSame'].value ? this.parentGroup.controls['interviewEmail'].disable() : this.parentGroup.controls['interviewEmail'].enable();
    if (this.parentGroup.controls['interviewEmailSame'].value) this.parentGroup.controls['interviewEmail'].setValue('')
  }

  flagInterviewFunc() {
    if (this.parentGroup.controls['interviewStatus'].value) {
      this.parentGroup.controls['interviewEmail'].setValidators(Validators.required);
    } else {
      this.parentGroup.controls['interviewEmail'].setValidators(null);
    }
    this.parentGroup.controls['interviewEmail'].updateValueAndValidity();
  }
}
