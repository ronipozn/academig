import { Component, OnInit, Input, Output, EventEmitter, Injectable } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { AuthService } from '../../../auth/auth.service';

import { People, PeopleService, titleSelect, titlesTypes } from '../../../shared/services/people-service';
import { ValidatorsService } from '../../../shared/services/shared-service';

import { slideInOutAnimation } from '../../../shared/animations/index';

import * as moment from 'moment';

declare var uploadcare: any;

function endDateValidator(date: Date): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    // console.log('control',control)
    // console.log('date',date)
    const value: string = control.value || '';
    let valid: boolean;

    if (!value || moment(value).isAfter(moment(date), 'day')) { valid = true; }

    // const forbidden = nameRe.test(control.value);

    return valid ? null : {'end': true};

    // return forbidden ? {'forbiddenName': {value: control.value}} : null;
  };
}

function idValidator(control: FormControl): {[key: string]: any} {
  const value: string = control.value._id || '';
  const valid = value;
  return valid ? null : {ssn: true};
}

// function endDateValidator(control: FormControl): {[key: string]: any} {
//   const value: string = control.value || '';
//   var valid: boolean;
//   // console.log('value',value)
//
//   if (!value || moment(value).isAfter(moment(), 'day')) valid=true;
//
//   return valid ? null : {"start": true};
// }

@Component({
    selector: 'people-build',
    templateUrl: 'build.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build.css']
})

export class GroupPeopleBuildComponent implements OnInit {
  @Input() labFlag: boolean;
  @Input() activeTab: number;
  @Input() people: People;
  @Input() positionIndex: number;
  @Input() stage: number;
  @Input() typeFlag: number;
  // 0 - Add Member (Admin)
  // 1 - Edit Member
  // 2 - Join (User)
  // 3 - Rejoin (User)
  // 4 - Delete Member (Admin or User?)
  // 5 - Cancel Join Request (User)
  // 6 - Add Position
  // 7 - Edit Position
  // 8 - to Alumni (Admin or User?)
  // 9 - Invite Email
  @Input() userId: string;
  @Input() groupId: string;
  @Input() email: string;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  submitStatus: boolean = false;
  formModel: FormGroup;

  headline: string;
  streamRetrieved: boolean = false;

  educationSelect = [];

  titleSelect = titleSelect;
  titlesTypes = titlesTypes;

  uploadFlagFile = false;
  thesisFile: string;
  picFile: string;

  titleArray: [{display: string, value: number}];

  actionStatus: number;

  privilageRadio: string[];
  privilageStatus: number;

  endRelationText: string;
  endRelationTextMore: string;

  fieldPic: string;
  emailExplainText: string;

  privilageFlag: boolean = true;

  adminFlag: boolean = false;

  constructor(private datepipe: DatePipe,
              private peopleService: PeopleService,
              private validatorsService: ValidatorsService,
              private authService: AuthService) { }

  ngOnInit() {
    const type = ['New', 'Update', 'Join', 'Rejoin', 'End Relation', 'Cancel Request', 'Add Position or Degree', 'Update', 'To Alumni', 'Add Email'];
    const tab = ['Member', 'Visitor', 'Alumni'];

    let existTitles: number[];

    // if (this.adminFlag && this.newFlag) this.formModel.addControl('intelligence', new FormArray([new FormControl()]));

    this.formModel = new FormGroup({ });

    this.headline = type[this.typeFlag] + ' ';
    this.headline += (this.typeFlag == 0) ? tab[this.activeTab] : '';

    this.authService.token.subscribe(token => this.adminFlag = this.authService.userHasScopes(token, ['write:groups']));

    if (this.typeFlag == 0 || this.typeFlag == 2 || this.typeFlag == 3 || this.typeFlag == 6) {

      if (this.activeTab == 0 || this.activeTab == 2) {

        if (this.typeFlag == 6) {
          existTitles = this.people.positions.map(r => r.titles[0]);
          this.titleSelect = this.titleSelect.filter(x => (existTitles.findIndex(y => x.value == y) == -1));
        }

        this.formModel.addControl('titles', new FormControl(this.labFlag ? this.titleSelect[this.titleSelect.length - 1].value : '', Validators.required));
        this.formModel.addControl('start', new FormControl(null, [this.validatorsService.rangeValidator({'range': ''})])); // , Validators.required
        // this.formModel.addControl('start', new FormControl(this.datepipe.transform(new Date(), 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''})])); // , Validators.required

      }

      if (this.activeTab == 2 || this.typeFlag == 6) {
        this.formModel.addControl('end', new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]));
        this.formModel.addControl('present', new FormArray([new FormControl(false)]));

        this.formModel.controls['start'].valueChanges.subscribe((value: string) => {
          this.formModel.controls['end'].updateValueAndValidity({emitEvent: false});
        });

        this.formModel.controls['end'].valueChanges.subscribe((value: string) => {
          this.formModel.controls['start'].updateValueAndValidity({emitEvent: false});
        });
      }

    };

    // if (this.labFlag && this.thesisVisibleFunc()) {
    //   this.formModel.addControl('field', new FormControl(''));
    //
    //   if (this.people && this.people.positions[this.positionIndex] && this.people.positions[this.positionIndex].degree) {
    //     this.formModel.addControl('thesisTitle', new FormControl(this.people.positions[this.positionIndex].degree.thesis));
    //     this.thesisFile = this.people.positions[this.positionIndex].degree.file;
    //   } else {
    //     this.formModel.addControl('thesisTitle', new FormControl(''));
    //     this.thesisFile = '';
    //   }
    //   // this.formModel.addControl('honor', new FormControl(''));
    //   // this.formModel.addControl('thesisGrade', new FormControl(''));
    // }

    if (this.typeFlag < 2 && this.activeTab == 0) {
      this.formModel.addControl('privilage', new FormControl(0, Validators.required));
    };

    if (this.typeFlag < 2) {
      // this.formModel.addControl('text', new FormControl(this.people ? this.people.positions[0].text : '', Validators.maxLength(200)));
      this.formModel.addControl('text', new FormControl(this.people ? this.people.positions[0].text : ''));
    }

    if (this.typeFlag == 0) { // NEW Member

      this.privilageStatus = 0;
      this.privilageRadio = ['Regular', 'Admin'];
      this.formModel.addControl('member', new FormControl('', Validators.required)); // , idValidator
      this.formModel.addControl("email", new FormControl(''));
      if (this.stage<2) this.formModel.controls['email'].disable();

    } else if (this.typeFlag == 1) { // EDIT Member

      if (this.people.positions[0].status == 6) { // Super Admin - PI
        this.privilageStatus = 0;
        this.privilageRadio = ['Super Admin'];
      } else if (this.people.positions[0].status == 7) { // Super Admin - On Behalf
        // this.privilageStatus = 2;
        // this.privilageRadio = ['Regular', 'Admin', 'Super Admin'];
        this.privilageStatus = 0;
        this.privilageRadio = ['Super Admin'];
      } else {
        if (this.activeTab == 0) {
          // if (this.people._id == this.userId) this.formModel.controls['privilage'].disable(); // Normal user can't change his privilages
          if (this.people._id == this.userId) this.privilageFlag=false; // Normal user can't change his privilages
          this.privilageStatus = (this.people.positions[0].status == 5) ? 1 : 0; // Normal User
          this.privilageRadio = ['Regular', 'Admin'];
        };
      };

      if (this.activeTab == 0) {
        this.formModel.controls['privilage'].setValue(this.privilageStatus);
      }

    } else if (this.typeFlag == 2 || this.typeFlag == 3) { // JOIN GROUP

      // if (this.activeTab>=1) this.formModel.controls['end'].setValue(this.datepipe.transform(new Date(), 'yyyy-MM'));

    } else if (this.typeFlag == 4 || this.typeFlag == 8) { // MOVE, DELETE

      this.endRelationText = ((this.typeFlag == 8) ? 'Move' : 'Delete') + ' the ' + this.titlesTypes[this.people.positions[this.positionIndex].titles[0]] + ' Position' + ((this.typeFlag == 8) ? ' to Alumni' : '');
      this.endRelationTextMore = 'All upcoming private meetings and reports as well as contact items related to ' + this.people.name + ' will be deleted.';

      if (this.typeFlag == 8) {
        this.formModel.addControl('end', new FormControl('', [Validators.required, endDateValidator(this.people.positions[this.positionIndex].period.start)]));
      } else {
        this.endRelationTextMore += ' Also, ' + this.people.name +  ' will be pulled out from any project, resource or media item in the group.';
      }

      this.endRelationTextMore = (this.people.positions.length == 1) ? this.endRelationTextMore : null

    } else if (this.typeFlag == 7) { // Edit Position

      this.formModel.addControl('titles', new FormControl(this.people.positions[this.positionIndex].titles[0], Validators.required));

      const startDate = this.people.positions[this.positionIndex].period.start;
      this.formModel.addControl('start', new FormControl(startDate ? this.datepipe.transform(new Date(startDate), 'yyyy-MM') : null, [this.validatorsService.rangeValidator({'range': ''})]));

      if (this.people.positions[this.positionIndex].period.mode == 0) {
        this.formModel.addControl('end', new FormControl(this.datepipe.transform(new Date(this.people.positions[this.positionIndex].period.end), 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required]));

        this.formModel.controls['start'].valueChanges.subscribe((value: string) => {
          this.formModel.controls['end'].updateValueAndValidity({emitEvent: false});
        });

        this.formModel.controls['end'].valueChanges.subscribe((value: string) => {
          this.formModel.controls['start'].updateValueAndValidity({emitEvent: false});
        });
      }

      if (this.people.positions[this.positionIndex].status==6 && this.positionIndex==0) {
        this.titleSelect = this.titleSelect.filter(x => x.value<150);
      }

    } else if (this.typeFlag == 9) {

      this.formModel.addControl("email", new FormControl(this.people.email, Validators.required));

    };

    // this.thesisFlag(1)
  }

  onSubmit() {
    if (this.formModel.valid) {

      // if (this.labFlag && this.thesisVisibleFunc()) {
      //   this.formModel.value.thesisFile = this.thesisFile;
      // }

      if (this.typeFlag == 0 || this.typeFlag == 1) { // Add / Edit Member
        this.formModel.value.pic = this.picFile;
      }

      if (this.typeFlag == 2 || this.typeFlag == 3) { // Join / ReJoin (User)
        this.formModel.value.privilage = 0;
      } else if (this.typeFlag == 1) {
        if (this.people.positions[0].status == 6) { // Edit Member
          this.formModel.value.privilage = 2;
        }
      };

      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  controlStatusFunc(flag: boolean, i: number) {
    if (flag == false) {

      if (i == 0) {

        // this.thesisFlag(0)

      } else if (i == 1) {

        this.formModel.controls['present'].value[0] ?
          (this.formModel.controls['end'].disable()) :
          (this.formModel.controls['end'].enable())

        // this.thesisFlag(0)

      } else if (i == 2) {

        const nameField = this.formModel.get('member').value;

        const widgetPic = uploadcare.Widget('#picFile');
        const uploadBtn = widgetPic.inputElement.nextSibling.querySelector('.uploadcare--widget__button_type_open')

        if (this.stage<2) {
          this.formModel.controls['email'].disable();
          uploadBtn.disabled = true;
          this.fieldPic = null;
          this.emailExplainText = "You can invite lab members by email once your lab profile is approved. We usually approve new profiles in less than 12 hour.";
        } else if (nameField._id) {
          // this.formModel.controls['email'].setValue(nameField.privateInfo.email);
          this.formModel.controls['email'].setValue('');
          this.formModel.controls['email'].disable();
          this.emailExplainText = "You don't need to enter the email for exisiting Academig users.";
          uploadBtn.disabled = true;
          this.fieldPic = nameField.pic;
        } else {
          this.formModel.controls['email'].setValue('');
          this.formModel.controls['email'].enable();
          this.emailExplainText = nameField ? nameField + " don't have an Academig account. Enter the new member's email address and we'll send a validation link to invite him or her to your lab." : "";
          // this.emailExplainText = nameField.name + " don't have an Academig account. We'll send a validation link to the new member's email address to verify their identity.";
          uploadBtn.disabled = false;
        }

      }

    }
  }

  // thesisFlag(mode: number) {
  //   if (this.labFlag && this.thesisVisibleFunc()) {
  //     var title = this.formModel.get('titles') ? this.formModel.get('titles').value : 0;
  //     if ((title==300 || title==301 || title==303) && (
  //           (this.typeFlag==7 && this.people.positions[this.positionIndex].period.mode==0) ||
  //           (this.typeFlag!=7 && !this.formModel.controls['present'].value[0])
  //        )) {
  //       if (mode==0 || mode==1) this.thesisToggle(true);
  //       if (mode==0 || mode==2) this.thesisBtnToggle(true);
  //     } else {
  //       this.thesisToggle(false)
  //       if (mode==0 || mode==1) this.thesisToggle(false);
  //       if (mode==0 || mode==2) this.thesisBtnToggle(false);
  //     }
  //   }
  // }

  // thesisVisibleFunc() {
  //   return ((this.typeFlag==2 || this.typeFlag==3) && this.activeTab>0)
  //          || this.typeFlag==6 || this.typeFlag==8
  //          || (this.typeFlag==7 && this.people.positions[this.positionIndex].period.mode==0);
  // }

  // thesisToggle(flag: boolean) {
  //   if (flag==false) {
  //     this.formModel.controls['thesisTitle'].setValue('');
  //     this.formModel.controls['thesisTitle'].disable();
  //     this.thesisFile= '';
  //   } else {
  //     this.formModel.controls['thesisTitle'].enable();
  //   }
  // }

  // thesisBtnToggle(flag: boolean) {
  //   const widgetThesis = uploadcare.Widget('#file');
  //   const uploadBtn = widgetThesis.inputElement.nextSibling.querySelector('.uploadcare--widget__button_type_open')
  //
  //   if (flag==false) {
  //     widgetThesis.value(this.thesisFile);
  //     uploadBtn.disabled = true;
  //   } else {
  //     uploadBtn.disabled = false;
  //   }
  // }

  ngAfterViewInit() {
    const that = this;

    // if (this.labFlag && this.thesisVisibleFunc()) {
    //   const widgetFiles = uploadcare.Widget('#file');
    //   widgetFiles.value(that.thesisFile);
    //   this.thesisFlag(2)
    //
    //   widgetFiles.onChange(function(value) {
    //     if (value) {
    //       that.uploadFlagFile = true;
    //       value.promise().done(function(info) {
    //         that.thesisFile = info.cdnUrl;
    //         that.uploadFlagFile = false;
    //       });
    //     } else {
    //       that.thesisFile = '';
    //     }
    //   });
    // }

    if (this.typeFlag==0 ||( this.typeFlag==1 && !this.people.stage)) {
      const widgetPic = uploadcare.Widget('#picFile');
      widgetPic.onChange(function(value) {
        if (value) {
          value.promise().done(function(info) {
            that.picFile = info.cdnUrl;
          });
        } else {
          that.picFile = '';
        }
      });
    }
  }

}
