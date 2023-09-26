import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';

import { slideInOutAnimation } from '../../../shared/animations/index';

import {Unit} from '../../../shared/services/university-service';

declare var uploadcare: any;

@Component({
    selector: 'department-build',
    templateUrl: 'build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build.css']
})

export class UniversityDepartmentBuildComponent implements OnInit {
  @Input() universityId: string;
  @Input() units: Unit[];

  @Input() unitIndex: number = 0;
  @Input() departmentIndex: number = 0;

  @Input() newFlag: boolean = true;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;

  departmentId: string;

  errorFlag: boolean;

  uploadFlag: boolean = false;
  file: string;

  unitsStrings: string[];

  departmentField;

  ngOnInit() {
    this.unitsStrings = this.units.map(p => p.name)

    if (this.newFlag) {

      this.formModel = new FormGroup({
        unit: new FormControl('0', Validators.required),
        department: new FormControl('', Validators.required),
        link: new FormControl('', Validators.required),
        website: new FormControl('', CustomValidators.url),
        description: new FormControl('', Validators.required),
        source: new FormControl('', CustomValidators.url)
      });

      this.formModel.controls['website'].valueChanges.subscribe((value: string) => {
        this.formModel.controls['website'].setValue(value.trim(), {emitEvent: false});
      });

    } else {

      this.formModel = new FormGroup({
        unit: new FormControl(this.unitIndex, Validators.required),
      });

    }
  }

  ngAfterViewInit() {
    if (this.newFlag) {
      const that = this;
      that.uploadFlag = true;

      const widget = uploadcare.Widget('#file');
      widget.onChange(function(value) {
        if (value) {
          value.promise().done(function(info) {
            that.file = info.cdnUrl;
            that.uploadFlag = false;
          });
        } else {
          that.file = '';
        }
      });
    }
  }

  onSubmit() {
    if (this.newFlag) {
      if (this.formModel.get('department').invalid) {
        this.errorFlag = true;
      }
    }

    this.formModel.value.pic = this.file;

    if (this.formModel.valid) {
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  keyUp(): void {
    this.departmentField = this.formModel.get('department').value;
    this.departmentId = this.departmentField ? this.departmentField._id : null;
    this.errorFlag = false;

    if (this.departmentField && this.departmentField.name) {
      this.formModel.controls['link'].setValue(this.departmentField.name.replace(/ /g,"_").toLowerCase());
    }
  }

  abbrGenerate() {
    const value: string = this.formModel.controls['department'].value;
    const link: string = value ? value.replace(/ /g,"_").toLowerCase() : '';
    this.formModel.controls['link'].setValue(link);
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
