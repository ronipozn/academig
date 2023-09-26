import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { slideInOutAnimation } from '../../../../shared/animations/index';

import { objectMini, ValidatorsService } from '../../../../shared/services/shared-service';
import { Project } from '../../../../shared/services/project-service';

import { AuthService } from '../../../../auth/auth.service';

declare var uploadcare: any;

@Component({
    selector: 'build-slide-project',
    templateUrl: 'build-slide-project.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-project.css']
})

export class BuildSlideProjectComponent implements OnInit {
  @Input() groupId: string;
  @Input() userId: string;
  @Input() modeNum: number;
  @Input() newFlag: boolean;

  @Input() project: Project;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;
  disableFlag: boolean = false;
  uploadFlag: boolean = false;
  file: string;

  members: objectMini[] = [];
  collaborations: objectMini[] = [];
  fundings: objectMini[] = [];

  adminFlag: boolean = false;

  // goalsBuild = ["Perform well-designed experiments that lead us to exciting and novel discoveries",
  //               "Communicate these findings within and beyond the greater scientific community",
  //               "Mentor trainees to become some of the best neuroscientists of their generation"
  //              ];

  constructor(private datepipe: DatePipe,
              private validatorsService: ValidatorsService,
              private authService: AuthService) {
    this.formModel = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit() {
    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:groups'])
      if (this.adminFlag && this.newFlag) this.formModel.addControl('intelligence', new FormArray([new FormControl()]));
    });

    if (!this.newFlag) {
      this.formModel.controls['title'].setValue(this.project.name);
      this.formModel.controls['description'].setValue(this.project.description);
      this.file = this.project.pic;
    }

    this.formModel.addControl('start', (this.newFlag) ?
                              new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]) :
                              new FormControl(this.datepipe.transform(this.project.period.start, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required]));
    // this.formModel.addControl('start', (this.newFlag) ?
    //                           new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]) :
    //                           new FormControl(this.datepipe.transform(this.project.period.start, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required]));

    if (this.modeNum == 1) { // Past Project
      this.formModel.addControl('end', (this.newFlag) ?
                                new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]) :
                                new FormControl(this.datepipe.transform(this.project.period.end, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required]));

      this.formModel.controls['end'].valueChanges.subscribe((value: string) => {
        this.formModel.controls['start'].updateValueAndValidity({emitEvent: false});
      });
    } else if (this.modeNum == 2) { // Profile Project
      this.formModel.addControl('end', (this.newFlag) ?
                                new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]) :
                                new FormControl(this.datepipe.transform(this.project.period.end, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required]));

      this.formModel.controls['end'].valueChanges.subscribe((value: string) => {
        this.formModel.controls['start'].updateValueAndValidity({emitEvent: false});
      });

      this.formModel.addControl('active',
        new FormArray([
          new FormControl(this.newFlag ? false : (this.project.period.mode==2))
        ]),
      );
    }

    if (this.modeNum==2) this.controlStatusFunc(false);
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

  ngAfterViewInit() {
    const that = this;
    const widget = uploadcare.Widget('#file');

    if (!this.newFlag) {
      widget.value(this.project.pic);
      this.formModel.value.pic = this.project.pic;
    };

    widget.onChange(function(value) {
      if (value) {
        that.uploadFlag = true;
        value.promise().done(function(info) {
          that.file = info.cdnUrl;
          that.uploadFlag = false;
        });
      } else {
        that.file = '';
      }
    });
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.formModel.value.members = this.members.filter((elem, index, arr) => this.formModel.value.members[index] === true);
      this.formModel.value.collaborations = this.collaborations.filter((elem, index, arr) => this.formModel.value.fundings[index] === true);
      this.formModel.value.fundings = this.fundings.filter((elem, index, arr) => this.formModel.value.fundings[index] === true);

      if (this.file) this.formModel.value.pic = this.file;

      this.disableFlag = true;
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  controlStatusFunc(flag: boolean) {
    if (flag==false) {
      (this.formModel.controls['active'].value[0]) ? this.formModel.controls['end'].disable() : this.formModel.controls['end'].enable();
    }
  }

}
