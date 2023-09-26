import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';

import { UserService } from '../../../../user/services/user-service';
import { slideInOutAnimation } from '../../../animations/index';

import { Link } from '../../../services/shared-service';

@Component({
    selector: 'build-slide-link',
    templateUrl: 'build-slide-link.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-link.css']
})

export class BuildSlideLinkComponent implements OnInit {
  @Input() link: Link;
  @Input() newFlag: boolean;
  @Input() title = 'Link';
  @Input() type = 0;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;

  constructor(
    public userService: UserService
  ) {
    this.formModel = new FormGroup({
      link: new FormControl('', [CustomValidators.url, Validators.required]),
      name: new FormControl('', Validators.required)
    });

    this.formModel.controls['link'].valueChanges.subscribe((value: string) => {
      this.formModel.controls['link'].setValue(value ? value.trim() : null, {emitEvent: false});
    });

  }

  ngOnInit() {
    if (this.type == 0) {
      this.formModel.addControl('description', new FormControl(this.newFlag ? '' : this.link.description));
    };

    if (!this.newFlag) {
      this.formModel.controls['name'].setValue(this.link.name);
      this.formModel.controls['link'].setValue(this.link.link);
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
