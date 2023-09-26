import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { objectMini, groupComplex } from '../../../services/shared-service';
import { slideInOutAnimation } from '../../../animations/index';

@Component({
    selector: 'build-slide-object',
    templateUrl: 'build-slide-object.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-object.css']
})

export class BuildSlideObjectComponent implements OnInit {
  @Input() itemSmall: boolean;
  @Input() title: string;
  @Input() controlName: string;
  @Input() mode: number;
  @Input() newFlag: boolean;

  @Input() minSelected = 0;

  @Input() groupId: string;
  @Input() userId: string;
  // @Input() single: boolean = false;

  @Input() preMembersInput: objectMini[];
  @Input() preCollaborationsInput: objectMini[];
  @Input() preFundingsInput: objectMini[];
  @Input() preProjectsInput: objectMini[];

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <objectMini[]> = new EventEmitter(true);

  members: objectMini[] = [];
  collaborations: objectMini[] = [];
  fundings: objectMini[] = [];
  projects: objectMini[] = [];

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;

  constructor() {}

  ngOnInit() {
    if (this.mode==4) {
      this.formModel = new FormGroup({
        users: new FormControl('', Validators.required),
      });
    } else {
      this.formModel = new FormGroup({});
    }
  }

  onSubmit() {
    if (this.formModel.valid) {
      let chosen: objectMini[]

      if (this.mode == 0) {
        chosen = this.members.filter((elem, index, arr) => this.formModel.value.members[index] === true);
      } else if (this.mode == 1) {
        chosen = this.collaborations.filter((elem, index, arr) => this.formModel.value.collaborations[index] === true);
      } else if (this.mode == 2) {
        chosen = this.fundings.filter((elem, index, arr) => this.formModel.value.fundings[index] === true);
      } else if (this.mode == 3) {
        chosen = this.projects.filter((elem, index, arr) => this.formModel.value.projects[index] === true);
      } else if (this.mode == 4) {
        chosen = this.formModel.value.users;
      }

      this.disableFlag = true;
      this.update.emit(chosen);

    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  membersFunc(event) {
    this.members = event;
  }

  collaborationsFunc(event) {
    this.collaborations = event;
  }

  fundingsFunc(event) {
    this.fundings = event;
  }

  projectsFunc(event) {
    this.projects = event;
  }

}
