import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { ValidatorsService } from '../../../shared/services/shared-service';

import { slideInOutAnimation } from '../../../shared/animations/index';

import { AuthService } from '../../../auth/auth.service';

import {Topic} from '../../../shared/services/project-service';

function groupValidator(control: FormControl): {[key: string]: any} {
  const value: string = control.value._id || '';
  const valid = value;
  return valid ? null : {ssn: true};
}

@Component({
    selector: 'research-build',
    templateUrl: 'build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build.css']
})

export class GroupResearchBuildComponent implements OnInit {
  @Input() name: string;
  @Input() topics: Topic[];

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  submitStatus: boolean = false;
  existFlag: boolean = false;
  formModel: FormGroup;

  adminFlag: boolean = false;

  constructor(private validatorsService: ValidatorsService,
              private authService: AuthService) { }

  ngOnInit() {
    this.formModel = new FormGroup({
      name: new FormControl(this.name, [Validators.required, Validators.maxLength(40), Validators.minLength(5)]),
    });

    this.authService.token.subscribe(token => this.adminFlag = this.authService.userHasScopes(token, ['write:groups']));

    if (this.adminFlag) this.formModel.addControl('intelligence', new FormArray([new FormControl()]));
  }

  onCancel() {
    this.cancel.emit(false);
  }

  keyUp(): void {
    const topicField = this.formModel.get('name').value;

    this.existFlag = this.topics.findIndex(r => r.name==topicField && r.name!=this.name)>-1;
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

}
