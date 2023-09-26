import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';

import { objectMini } from '../../services/shared-service';
import { OpenPosition, OpenPositionApplyInfo } from '../../services/position-service';

import { slideInOutAnimation } from '../../animations/index';

declare var uploadcare: any;

@Component({
    selector: 'position-apply',
    templateUrl: 'position-apply.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['position-apply.css']
})

export class PositionApplyComponent implements OnInit {
  @Input() titleType: string;
  @Input() title: string;

  @Input() apply: OpenPositionApplyInfo;

  @Input() lettersGuidelines: string;
  @Input() lettersRequired: number[];
  @Input() gradesRequired: number[];
  @Input() numReferees: number;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  submitStatus: boolean = false;

  controlStatus: boolean[] = [];
  formModel: FormGroup;

  lettersSelect = ['Curriculum vitae', 'Letter of motivation', 'Letter of interest', 'Cover letter', 'Project proposal', 'Teaching statement'];
  letters: string[] = [];

  gradesSelect = ['GPA', 'GRE', 'TOEFL'];
  gradesMin = [0, 260, 0];
  gradesMax = [5, 340, 120];

  ngOnInit() {
    this.formModel = new FormGroup({});

    // https://stackoverflow.com/questions/45952487/maximum-value-validator-with-dynamic-value
    // GPA: new FormControl((this.apply && this.apply[0].status>9) ? this.apply[0].grades[0] : null),
    if (this.gradesRequired) {
      this.gradesRequired.forEach((i) => {
        this.formModel.addControl(
          this.gradesSelect[i],
          new FormControl(
            null,
            [
              Validators.required,
              (control: AbstractControl) => Validators.max(this.gradesMax[i])(control),
              (control: AbstractControl) => Validators.min(this.gradesMin[i])(control)
            ]
          )
        );
      });
    }

    // console.log('lettersGuidelines',this.lettersGuidelines)
    // console.log('lettersRequired',this.lettersRequired)
    // console.log('gradesRequired',this.gradesRequired)
    // console.log('numReferees',this.numReferees)
    // console.log('apply',this.apply)
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.formModel.value.letters = this.letters;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  ngAfterViewInit() {
    const that = this;
    var widget: any[] = []

    if (this.lettersRequired) {
      this.lettersRequired.forEach((_i, j) => {
        widget[j] = uploadcare.Widget('#letter' + j);

        // if (this.apply && this.apply[0].letters) {
        //   widget[_i].value(this.apply[0].letters[_i]);
        //   this.formModel.value.letters = this.apply[0].letters;
        // };

        widget[j].onChange(function(value) {
          if (value) {
            value.promise().done(function(info) {
              that.letters[j] = info.cdnUrl;
            });
          } else {
            that.letters[j] = null;
          }
        })
      });
    }

  }

}
