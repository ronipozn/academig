import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CustomValidators } from 'ng2-validation';

import { AuthService } from '../../../../auth/auth.service';

import { slideInOutAnimation } from '../../../../shared/animations/index';

import { objectMini } from '../../../../shared/services/shared-service';
import { Funding } from '../../../../shared/services/funding-service';

declare var uploadcare: any;

@Component({
    selector: 'build-slide-funding',
    templateUrl: 'build-slide-funding.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-funding.css']
})

export class BuildSlideFundingComponent implements OnInit {
  @Input() modeNum: number;
  @Input() groupId: string;
  @Input() userId: string;
  @Input() newFlag: number;
  @Input() roleIndex: number;
  @Input() groupStage: number;

  @Input() existRoles: number;

  @Input() funding: Funding;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean[] = [false, false, false];
  disableFlag: boolean = false;
  uploadFlag: boolean = false;
  file: string;

  controlStatus: boolean[] = [false, false, false, false];
  stepNum: number;
  stepTotal: number;

  meFlag: boolean;

  adminFlag: boolean = false;

  constructor (private datepipe: DatePipe,
               private authService: AuthService) { }

  ngOnInit() {
    // newFlag: 0 - update funding (Super Admin)
    //          1 - new funding (Super Admin)
    //          2 - update role (each people)
    //          3 - leave role (each people)
    //          4 - add role (Super Admin)

    if (this.newFlag <= 1) {
      this.formModel = new FormGroup({
        title: new FormControl('', Validators.required),
        officalId: new FormControl(''),
        abbr: new FormControl('', Validators.required),
        link: new FormControl('', CustomValidators.url),
        description: new FormControl(''),
      });
    } else {
      this.formModel = new FormGroup({ });
    }

    this.stepNum = (this.newFlag == 4) ? 2 : ((this.newFlag >= 2) ? this.newFlag : 0);

    this.stepTotal = (this.newFlag == 1) ? 3 : ( (this.newFlag == 0) ? 2 : 1 );

    if (this.newFlag == 0) {

      this.formModel.setValue({
        title: {name: this.funding.name},
        officalId: this.funding.officalId,
        abbr: this.funding.abbr,
        link: this.funding.link,
        description: this.funding.description,
      });

      // this.preProjects=this.funding.projects;

    } else if (this.newFlag == 3) {

      this.meFlag = (this.funding.roles[this.roleIndex].member._id == this.userId);

    }

    if (this.newFlag <= 1) {
      this.formModel.controls['link'].valueChanges.subscribe((value: string) => {
        this.formModel.controls['link'].setValue(value.trim(), {emitEvent: false});
      });
    }

    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:groups'])
      if (this.adminFlag && this.newFlag) this.formModel.addControl('intelligence', new FormArray([new FormControl()]));
    });

  }

  changeStep(upDown: boolean, updateStep: number) {
    if (updateStep != null) {
      this.stepNum = updateStep;
    } else if (upDown == false) {
      this.stepNum--;
    } else {
      if (this.stepNum==0 && !this.formModel.get('title').valid || !this.formModel.get('abbr').valid || !this.formModel.get('link').valid) {
        this.submitStatus[this.stepNum] = !this.submitStatus[this.stepNum];
      } else if (this.stepNum>0 && !this.formModel.valid) {
        this.submitStatus[this.stepNum] = !this.submitStatus[this.stepNum];
      } else {
        this.stepNum++;
      }
    }
  }

  ngAfterViewInit() {
    if (this.newFlag < 2) {
      const that = this;
      const widget = uploadcare.Widget('#file');

      if (this.funding) {
        widget.value(this.funding.pic);
        this.formModel.value.pic = this.funding.pic;
      }

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
  }

  onSubmit() {
    // if (this.newFlag!=3) {
    //   this.formModel.value.projects = this.projects.filter((elem, index, arr) => this.formModel.value.projects[index] === true);
    // };

    if (this.formModel.valid) {

      if (this.newFlag <= 1) {
        if (this.file) { this.formModel.value.pic = this.file; }
        this.formModel.value.name = (this.formModel.value.title.name) ? this.formModel.value.title.name : this.formModel.value.title;
      }

      if (this.newFlag <= 1 || this.newFlag == 4) {
        for (let _i = 0; _i < this.formModel.value.roles.length; _i++) {
          this.formModel.value.roles[_i].status = (this.formModel.value.roles[_i].member._id == this.userId) ? 2 : 0;
        };
      }

      this.disableFlag = true;
      this.update.emit(this.formModel.value);

    } else {
      this.submitStatus[this.stepNum] = !this.submitStatus[this.stepNum];
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  // projectsFunc(event) {
  //   this.projects=event;
  // }

  controlStatusFunc(event, i: number) {
    this.controlStatus[i] = event
  }

  controlTitleFunc(event) {
    const query = this.formModel.value.title;

    if (query.name) {
      if (query.id) { this.formModel.controls['officalId'].setValue(query.id); }
      if (query['alt-names'][0]) { this.formModel.controls['abbr'].setValue(query['alt-names'][0]); }
      if (query['uri']) { this.formModel.controls['link'].setValue(query['uri']); }
    }

  }

}
