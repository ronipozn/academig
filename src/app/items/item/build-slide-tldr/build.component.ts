import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { slideInOutAnimation } from '../../../shared/animations/index';
import { AuthService } from '../../../auth/auth.service';

import { objectMini } from '../../../shared/services/shared-service';
import { serviceSelect, serviceTypes, Resource, Category } from '../../../shared/services/resource-service';

declare var uploadcare: any;

@Component({
    selector: 'build-slide-tldr',
    templateUrl: 'build-slide-tldr.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-tldr.css']
})

export class BuildSlideTldrComponent implements OnInit {
  @Input() tldr: string[];

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.formModel = new FormGroup({
      feature_1: new FormControl(this.tldr ? this.tldr[0] : null, Validators.required),
      feature_2: new FormControl(this.tldr ? this.tldr[1] : null, Validators.required),
      best_for: new FormControl(this.tldr ? this.tldr[2] : null, Validators.required),
      alternative_to: new FormControl(this.tldr ? this.tldr[3] : null, Validators.required),
    });
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
