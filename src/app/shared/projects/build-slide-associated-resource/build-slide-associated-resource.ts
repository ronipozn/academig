import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UserService } from '../../../user/services/user-service';

import { slideInOutAnimation } from '../../animations/index';

@Component({
    selector: 'build-slide-associated-resource',
    templateUrl: 'build-slide-associated-resource.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-associated-resource.css']
})

export class BuildSlideAssociatedResourceComponent {
  @Input() title: string;
  @Input() userId: string;
  @Input() projId: string;
  @Input() itemExplain: string;
  @Input() itemSmall = true;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus = false;

  constructor(
    public userService: UserService
  ) {
    this.formModel = new FormGroup({
      resource: new FormControl('', Validators.required),
    });
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
