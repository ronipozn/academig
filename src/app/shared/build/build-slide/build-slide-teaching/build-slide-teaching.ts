import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { AuthService } from '../../../../auth/auth.service';
import { slideInOutAnimation } from '../../../../shared/animations/index';

import { objectMini, ValidatorsService } from '../../../../shared/services/shared-service';
import { Teaching } from '../../../../shared/services/teaching-service';

@Component({
    selector: 'build-slide-teaching',
    templateUrl: 'build-slide-teaching.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-teaching.css']
})

export class BuildSlideTeachingComponent implements OnInit {
  @Input() groupId: string;
  @Input() userId: string;
  @Input() modeNum: number;
  @Input() newFlag: boolean;

  @Input() teaching: Teaching;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;
  // file: string;

  members: objectMini[] = [];
  collaborations: objectMini[] = [];
  fundings: objectMini[] = [];

  teachingRoleRadio = ['Lecturer',
                       'Guest Lecturer',
                       'Teaching Assistant'];

  adminFlag: boolean = false;

  constructor(private datepipe: DatePipe,
              private authService: AuthService,
              private validatorsService: ValidatorsService) {
    this.formModel = new FormGroup({
      title: new FormControl('', Validators.required),
      id: new FormControl(''),
      location: new FormControl(''),
      role: new FormControl(0, Validators.required),
      university: new FormControl(''),
      description: new FormControl(''),
    });
  }

  ngOnInit() {
    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:groups'])
      if (this.adminFlag && this.newFlag && this.groupId) this.formModel.addControl('intelligence', new FormArray([new FormControl()]));
    });

    if (!this.newFlag) {
      this.formModel.controls['title'].setValue(this.teaching.name);
      this.formModel.controls['id'].setValue(this.teaching.id);
      this.formModel.controls['location'].setValue(this.teaching.location);
      this.formModel.controls['role'].setValue(this.teaching.role);
      this.formModel.controls['university'].setValue({"name": this.teaching.university});
      this.formModel.controls['description'].setValue(this.teaching.description);
    }

    this.formModel.addControl('start', (this.newFlag) ?
                              new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]) :
                              new FormControl(this.datepipe.transform(this.teaching.period.start, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required]));
    // this.formModel.addControl('start', (this.newFlag) ?
    //                           new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]) :
    //                           new FormControl(this.datepipe.transform(this.teaching.period.start, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required]));

    if (this.modeNum == 1) { // Past Teaching
      this.formModel.addControl('end', (this.newFlag) ?
                                new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]) :
                                new FormControl(this.datepipe.transform(this.teaching.period.end, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required]));

      this.formModel.controls['end'].valueChanges.subscribe((value: string) => {
        this.formModel.controls['start'].updateValueAndValidity({emitEvent: false});
      });
    } else if (this.modeNum == 2) { // Profile Teaching
      this.formModel.addControl('end', (this.newFlag) ?
                                new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]) :
                                new FormControl(this.datepipe.transform(this.teaching.period.end, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}),, Validators.required]));

      this.formModel.controls['end'].valueChanges.subscribe((value: string) => {
        this.formModel.controls['start'].updateValueAndValidity({emitEvent: false});
      });

      this.formModel.addControl('active',
        new FormArray([
          new FormControl(this.newFlag ? false : (this.teaching.period.mode==2))
        ]),
      );
    }

    this.controlStatusFunc(false);
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

  onSubmit() {
    if (this.formModel.valid) {
      if (this.formModel.value.university.name) this.formModel.value.university = this.formModel.value.university.name;
      this.disableFlag = true;
      // this.formModel.value.members = this.members.filter((elem, index, arr) => this.formModel.value.members[index] === true);
      // if (this.file) this.formModel.value.pic = this.file;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  controlStatusFunc(flag: boolean) {
    if (flag==false && this.modeNum==2) {
      this.formModel.controls['active'].value[0] ? this.formModel.controls['end'].disable() : this.formModel.controls['end'].enable();
    }
  }

}
