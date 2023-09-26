import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { AuthService } from '../../../auth/auth.service';

import { objectMini, ValidatorsService } from '../../../shared/services/shared-service';
import { Group } from '../../../shared/services/group-service';
import { Collaboration } from '../../../shared/services/collaboration-service';

import { slideInOutAnimation } from '../../../shared/animations/index';

function groupValidator(control: FormControl): {[key: string]: any} {
  const value: string = control.value._id || '';
  const valid = value;
  return valid ? null : {ssn: true};
}

@Component({
    selector: 'collaboration-build',
    templateUrl: 'build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build.css']
})

export class GroupCollaborationBuildComponent implements OnInit {
  @Input() modeNum: number;
  @Input() groupId: string;
  @Input() userId: string;
  @Input() newFlag: number;

  @Input() approveCollaborations: Collaboration[];
  @Input() currentCollaborations: Collaboration[];
  @Input() pastCollaborations: Collaboration[];

  @Input() collaboration: Collaboration;
  @Input() collaborationName: string;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  submitStatus = false;
  formModel: FormGroup;

  // projects: objectMini[] = [];
  // preProjects: objectMini[] = [];

  existIds: string[];

  adminFlag: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private datepipe: DatePipe,
    private router: Router,
    private validatorsService: ValidatorsService,
    private authService: AuthService
  ) {
    this.formModel = new FormGroup({
      group: new FormControl('', groupValidator),
      text: new FormControl(''),
    });
  }

  onSubmit() {
    // this.formModel.value.projects = this.projects.filter((elem, index, arr) => this.formModel.value.projects[index] === true);

    if (this.formModel.valid) {
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  ngOnInit() {
    this.authService.token.subscribe(token => this.adminFlag = this.authService.userHasScopes(token, ['write:groups']));

    this.existIds = this.currentCollaborations.map(r => r._id)
                    .concat(this.pastCollaborations.map(r => r._id))
                    .concat(this.approveCollaborations.map(r => r._id));

    if (this.newFlag == 1) {
      this.formModel.controls['text'].setValue(this.collaboration.text)
      // this.preProjects=this.collaboration.projects;
    };

    if (this.newFlag >= 1) {
      this.formModel.controls['group'].disable()
    };

    if (this.newFlag <= 1) {
      this.formModel.addControl('start',
      (this.newFlag == 0) ?
       new FormControl('', (this.modeNum == 1) ? [this.validatorsService.rangeValidator({'range': ''}), Validators.required] : [Validators.required]) :
       new FormControl(this.datepipe.transform(this.collaboration.period.start, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required])
      );

      if (this.modeNum == 1) {
        this.formModel.addControl('end',
        (this.newFlag == 0) ?
         new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]) :
         new FormControl(this.datepipe.transform(this.collaboration.period.end, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required])
        );

        this.formModel.controls['start'].valueChanges.subscribe((value: string) => {
          this.formModel.controls['end'].updateValueAndValidity({emitEvent: false});
        });

        this.formModel.controls['end'].valueChanges.subscribe((value: string) => {
          this.formModel.controls['start'].updateValueAndValidity({emitEvent: false});
        });
      }
    };

  }

  // projectsFunc(event) {
  //   this.projects=event;
  // }

}
