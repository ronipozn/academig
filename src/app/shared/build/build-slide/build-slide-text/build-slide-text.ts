import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { UserService } from '../../../../user/services/user-service';
import { slideInOutAnimation } from '../../../animations/index';

@Component({
    selector: 'build-slide-text',
    templateUrl: 'build-slide-text.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-text.css']
})

export class BuildSlideTextComponent implements OnInit {
  @Input() title: string;
  @Input() text: string;
  @Input() itemExplain: string;
  @Input() fieldType = 20;
  @Input() textAreaRows = 5;
  @Input() typeSelected: string = null;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;

  constructor(
    private datepipe: DatePipe,
    public userService: UserService
  ) {
    this.formModel = new FormGroup({
      text: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.formModel.controls['text'].setValue(this.text);
  }

  onSubmit() {
    if (this.formModel.valid) {
      if (this.typeSelected!='date') this.formModel.value.text = this.formModel.value.text.trim();
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
