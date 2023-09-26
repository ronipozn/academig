import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UserService } from '../../../user/services/user-service';

import { slideInOutAnimation } from '../../animations/index';

@Component({
    selector: 'terms-build',
    templateUrl: 'terms-build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['terms-build.css']
})

export class TermsBuildComponent implements OnInit {
  @Input() mode: number;
  @Input() more: string;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  termsSelect = [
    'None',
    'GNU AGPLv3',
    'GNU GPLv3',
    'GNU LGPLv3',
    'Mozilla Public License 2.0',
    'Apache License 2.0',
    'MIT License',
    'The Unlicense',
  ];

  formModel: FormGroup;
  submitStatus = false;
  newFlag = false;

  constructor(
    public userService: UserService
  ) {
    this.formModel = new FormGroup({
      mode: new FormControl(0, Validators.required),
      more: new FormControl(''),
    });

  }

  ngOnInit() {
    this.newFlag = (this.mode == 0 && this.more == null)

    if (!this.newFlag) {
      this.formModel.setValue({
        mode: this.mode,
        more: this.more,
      });
    }
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
