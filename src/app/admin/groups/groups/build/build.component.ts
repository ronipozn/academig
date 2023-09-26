import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { slideInOutAnimation } from '../../../../shared/animations/index';
import { CustomValidators } from 'ng2-validation';

import { complexName } from '../../../../shared/services/shared-service';

@Component({
    selector: 'admin-build',
    templateUrl: 'build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build.css']
})

export class BuildLabComponent implements OnInit {
  @Input() title: string;
  @Input() groupName: string;
  @Input() action: number;

  @Input() university: complexName;
  @Input() department: complexName;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus = false;

  ngOnInit() {
    var universityAbbr = this.university.name ? this.university.name.replace(/ /g,"_").toLowerCase() : '';
    var departmentAbbr = this.department.name ? this.department.name.replace(/ /g,"_").toLowerCase() : '';

    // console.log('university',this.university)
    // console.log('department',this.department)

    if (this.action == 1 || this.action == 0) {

      this.formModel = new FormGroup({
        university: new FormControl(this.university.name, (!this.university._id) ? Validators.required : null),
        universityAbbr: new FormControl(universityAbbr),
        department: new FormControl(this.department.name, (!this.department._id) ? Validators.required : null),
        departmentAbbr: new FormControl(departmentAbbr),
        text: new FormControl(null, Validators.required),
      });

    } else {

      this.formModel = new FormGroup({
        text: new FormControl(null, Validators.required),
      });

    }

  }

  onSubmit() {
    if (this.formModel.valid) {
      if (this.action>1) this.formModel.value.pics = [];  // DELETE?
      this.update.emit(this.formModel.value);

    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  abbrGenerate(type: number) {
    let value, link: string;

    if (type==0) {
      value = this.formModel.controls['university'].value;
      link = value ? value.replace(/ /g,"_").toLowerCase() : '';
      this.formModel.controls['universityAbbr'].setValue(link);
    } else {
      value = this.formModel.controls['department'].value;
      link = value ? value.replace(/ /g,"_").toLowerCase() : '';
      this.formModel.controls['departmentAbbr'].setValue(link);
    }
  }

}
