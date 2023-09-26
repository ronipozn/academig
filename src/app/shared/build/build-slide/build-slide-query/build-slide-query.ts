import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { objectMini } from '../../../../shared/services/shared-service';
import { slideInOutAnimation } from '../../../animations/index';

@Component({
    selector: 'build-slide-query',
    templateUrl: 'build-slide-query.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-query.css']
})

export class BuildSlideQueryComponent implements OnInit {
  @Input() title: string;
  @Input() text: string;
  @Input() itemExplain: string;
  @Input() fieldType = 2;
  @Input() typeSelected: string = null;

  @Input() selectArray: objectMini[];

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;

  constructor(
    private datepipe: DatePipe
  ) {
    this.formModel = new FormGroup({
      text: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    if (this.typeSelected == 'date') {
      this.formModel.controls['text'].setValue(this.datepipe.transform(this.text, 'yyyy-MM-dd'));
    } else if (this.typeSelected == 'month') {
      this.formModel.controls['text'].setValue(this.datepipe.transform(this.text, 'yyyy-MM'));
    } else {
      this.formModel.controls['text'].setValue(this.text);
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
