import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {ViewportScroller} from '@angular/common';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

import {Router, UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET} from '@angular/router';

import {CustomValidators} from 'ng2-validation';

import {screenAnimation} from '../screen.animation';

import {UserService} from '../../user/services/user-service';
import {CreateGroup, GroupService} from '../../shared/services/group-service';
import {groupComplex, SharedService} from '../../shared/services/shared-service';
import {PeopleNavBar} from '../../shared/services/people-service';
import {CreateOpenPosition, OpenPositionService} from '../../shared/services/position-service';

function universityValidator(control: FormControl): {[key: string]: any} {
  const value: string = control.value._id || '';
  const valid = value;
  return valid ? null : {ssn: true};
}

@Component({
    selector: 'position-build',
    templateUrl: 'build.html',
    animations: [screenAnimation],
    host: { '[@screenAnimation]': '' },
    styleUrls: ['build.css']
})
export class BuildComponent implements OnInit {
  streamRetrieved: boolean = false;

  submitFlag: boolean = false;
  labFlag: boolean = false;

  groupPic: string;
  groupPicBuildFlag: boolean = false;

  labInfoVisible: boolean = false;

  submitStatus: boolean[] = [false, false];

  firstInvalid: string[] = [];
  secondInvalid: string[] = [];

  // coverPic: string;
  // coverPicBuildFlag: boolean = false;

  streamPosition: number = 0;

  isLinear: boolean = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;

  feedbackSelect: string[] = ["Search Engine", "Social Media (Facebook, Twitter, Linkedin, etc.)", "Friend or Co-worker", "Podcast", "Email", "Website", "Blog", "Conference or Trade-show", "Other"];

  // standoutPrices: number[] = [99, 139, 159, 199];
  // extraPrices: number[] = [199, 199];
  standoutPrices: number[] = [10, 50, 70, 100];
  extraPrices: number[] = [50, 10];

  color = 'dark';
  mode = 'buffer';
  progress = 0;
  bufferValue = 0;

  detailsPreview: any;
  topics: string[];

  smallScreen: boolean;

  constructor(
      private router: Router,
      private breakpointObserver: BreakpointObserver,
      private _formBuilder: FormBuilder,
      private titleService: Title,
      private viewportScroller: ViewportScroller,
      public sharedService: SharedService,
      public groupService: GroupService,
      public openPositionService: OpenPositionService,
      public userService: UserService) {
    this.titleService.setTitle('Post Academic Job | Academig');

     breakpointObserver.observe([
       Breakpoints.XSmall,
       Breakpoints.Small
     ]).subscribe(result => {
       this.smallScreen = result.matches;
     });
  }

  async ngOnInit() {
    this.streamRetrieved = false;
    this.groupPic = null;

    // var parts = this.userService.userName ? this.userService.userName.split(/[ .]+/) : null;

    this.updateNavigation();

    this.topics = await this.sharedService.queryTopics(null);

    this.firstFormGroup = this._formBuilder.group({
      title: new FormControl('', Validators.required),
      job: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),

      // contractLength: new FormControl(null, [Validators.min(1), Validators.max(100)]),
      // contractLengthType: new FormControl(null),

      contract: new FormGroup({
        lengthType: new FormControl(null),
        length: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.min(1), Validators.max(100)])
      }),

      spotsAvailable: new FormControl(null, [Validators.min(0), Validators.max(4)]),
      internalId: new FormControl(''),

      apply: new FormGroup({
        how: new FormControl(0, Validators.required),
        direct: new FormControl({ value: '', disabled: true }, Validators.required)
      }),

      gradesRequired: new FormControl(null),
      lettersRequired: new FormControl(null),
      numReferees: new FormControl(null, [Validators.min(0), Validators.max(4)]),
      // refereesDeadline: new FormControl(''),

      lettersGuidelines: new FormControl(''),

      jobEndDate: new FormControl(null),
      jobDescisionDate: new FormControl(null),
      jobStartDate: new FormControl(null),

      tags: new FormControl(null),

      jobDescription: new FormControl('', Validators.required),
      jobExperience: new FormControl(''),
      jobScholarship: new FormControl(''),
      jobDuties: new FormControl(''),
      jobExpectations: new FormControl(''),
      // jobEducation: new FormControl(''),

      standout: new FormControl(0),
      filterStatus: new FormControl(false),

      feedback: new FormControl(null)
    });

    this.secondFormGroup = this._formBuilder.group({
      university: new FormControl(this.labFlag ? this.userService.buildGroupJob.groupIndex.university.name : '', universityValidator),
      department: new FormControl(this.labFlag ? this.userService.buildGroupJob.groupIndex.department.name : '', [Validators.required]),

      group: new FormControl(this.labFlag ? this.userService.buildGroupJob.groupIndex.group.name : '', [Validators.required, Validators.maxLength(50), Validators.minLength(5)]),
      topic: new FormControl(this.labFlag ? this.userService.buildGroupJob.topic : ''),

      website: new FormControl('', [Validators.required, CustomValidators.url]),
      contactEmail: new FormControl('', Validators.required),
      twitter: new FormControl(''),

      group_size: new FormControl(null),
      establishDate: new FormControl(null),

      statement: new FormControl(''),
      quote: new FormControl(''),

      logo: new FormControl(null),
      interests: new FormControl(null),
      background: new FormControl(''),

      /////////////////////////////////////
      /////////////////////////////////////
      /////////////////////////////////////

      firstName: new FormControl(this.labFlag ? this.userService.buildGroupJob.firstName : this.capitalizeFirstLetter(''), (this.userService.userId==null) ? Validators.required : null), // FIX
      lastName: new FormControl(this.capitalizeFirstLetter(''), (this.userService.userId==null) ? Validators.required : null), // FIX
      position: new FormControl('', Validators.required),
      startDate: new FormControl('', Validators.required),
      instituteEmail: new FormControl('', Validators.required),
      emailSame: new FormControl(false),

      /////////////////////////////////////
      /////////////////////////////////////
      /////////////////////////////////////

      secondPosition: new FormControl(''),
      secondFirstName: new FormControl('', [Validators.maxLength(30), Validators.minLength(2)]),
      secondLastName: new FormControl('', [Validators.maxLength(30), Validators.minLength(2)]),
      secondStartDate: new FormControl(''),
      secondInstituteEmail: new FormControl(''),
      // secondEmailSame: new FormControl(false),

      /////////////////////////////////////
      /////////////////////////////////////
      /////////////////////////////////////

      buildStatus: new FormControl(false),

      /////////////////////////////////////
      /////////////////////////////////////
      /////////////////////////////////////

      interviewStatus: new FormControl(false),
      interviewEmail: new FormControl(''),
      interviewEmailSame: new FormControl(false),

      /////////////////////////////////////
      /////////////////////////////////////
      /////////////////////////////////////

      clubStatus: new FormControl(false),
      clubEmail: new FormControl(''),
      clubEmailSame: new FormControl(false),
      clubPhone: new FormControl(''),
      clubAddress: new FormControl(''),
      clubTime: new FormControl(''),
    });

    this.thirdFormGroup = this._formBuilder.group({

    });

    this.fourthFormGroup = this._formBuilder.group({

    });

    // this.subscription =
    this.secondFormGroup.controls['position'].valueChanges.subscribe(data => {
      if (data>199) {
        this.secondFormGroup.controls['secondPosition'].setValidators([Validators.required]);
        this.secondFormGroup.controls['secondFirstName'].setValidators([Validators.required, Validators.maxLength(30), Validators.minLength(2)]);
        this.secondFormGroup.controls['secondLastName'].setValidators([Validators.required, Validators.maxLength(30), Validators.minLength(2)]);
        this.secondFormGroup.controls['secondStartDate'].setValidators([Validators.required]);
        this.secondFormGroup.controls['secondInstituteEmail'].setValidators([Validators.required]);
      } else {
        this.secondFormGroup.controls['secondPosition'].setValidators(null);
        this.secondFormGroup.controls['secondFirstName'].setValidators(null);
        this.secondFormGroup.controls['secondLastName'].setValidators(null);
        this.secondFormGroup.controls['secondStartDate'].setValidators(null);
        this.secondFormGroup.controls['secondInstituteEmail'].setValidators(null);
      }
      this.secondFormGroup.controls['secondPosition'].updateValueAndValidity();
      this.secondFormGroup.controls['secondFirstName'].updateValueAndValidity();
      this.secondFormGroup.controls['secondLastName'].updateValueAndValidity();
      this.secondFormGroup.controls['secondStartDate'].updateValueAndValidity();
      this.secondFormGroup.controls['secondInstituteEmail'].updateValueAndValidity();
    })

    this.streamRetrieved = true;
  }

  async onSubmit() {
    this.submitFlag = true;
    this.submitAnimation();

    if (this.userService.userId) {
      if (this.labFlag) {
        this.positionPut(this.userService.buildGroupJob._id);
      } else {
        this.labPut();
      }
    } else {
      this.labPositionPut();
    }
  }

  async labPut() {
    const univesityName: string = this.secondFormGroup.value.university.name ? this.secondFormGroup.value.university.name : this.secondFormGroup.value.university;
    const departmentName: string = this.secondFormGroup.value.department.name ? this.secondFormGroup.value.department.name : this.secondFormGroup.value.department;
    const labMode: number = (this.secondFormGroup.value.position>199) ? 9 : 8;

    const members = [
      {
        "_id": null,
        "name": this.secondFormGroup.value.firstName + ' ' + this.secondFormGroup.value.lastName,
        "pic": null,
        "email": (this.secondFormGroup.controls['emailSame'].value) ? this.secondFormGroup.value.contactEmail : this.secondFormGroup.value.instituteEmail,
        "position": this.secondFormGroup.value.position,
        "startDate": new Date(this.secondFormGroup.value.startDate),
        "endDate": null,
        "active": [true],
        "messageFlag": null,
        "message": null
      }
    ];

    if (labMode==9) {
      members.push({
        "_id": null,
        "name": this.secondFormGroup.value.secondFirstName + ' ' + this.secondFormGroup.value.secondLastName,
        "pic": null,
        "email": this.secondFormGroup.value.secondInstituteEmail,
        "position": this.secondFormGroup.value.secondPosition,
        "startDate": new Date(this.secondFormGroup.value.secondStartDate),
        "endDate": null,
        "active": [true],
        "messageFlag": null,
        "message": null
      })
    }

    const createGroup: CreateGroup = {
      "buildMode": labMode,

      "university": univesityName,
      "department": departmentName,
      "unit": null,

      "group": this.secondFormGroup.value.group,

      "currentWebsite": this.secondFormGroup.value.website,
      "contactEmail": this.secondFormGroup.value.contactEmail,
      "twitter": this.secondFormGroup.value.twitter,

      "country_id": null,
      "group_size": this.secondFormGroup.value.group_size,
      "establishDate": new Date(this.secondFormGroup.value.establishDate),
      "topic": this.secondFormGroup.value.topic,

      "statement": this.secondFormGroup.value.statement,
      "quote": this.secondFormGroup.value.quote,

      "logo": this.groupPic,
      "interests": this.secondFormGroup.value.interests,
      "background": this.secondFormGroup.value.background,

      "names": [], // FIX: validate not null serverside
      "theme": null,
      "themeIndex": null,
      "cover": null,
      "privacy": 1,

      "members": members,

      "buildPro": this.secondFormGroup.value.buildStatus,

      "interview": {
        "status": this.secondFormGroup.value.interviewStatus,
        "email": (this.secondFormGroup.controls['interviewEmailSame'].value) ? this.secondFormGroup.value.contactEmail : this.secondFormGroup.value.interviewEmail
      },

      "club": {
        "status": this.secondFormGroup.value.clubStatus,
        "email": (this.secondFormGroup.controls['clubEmailSame'].value) ? this.secondFormGroup.value.contactEmail : this.secondFormGroup.value.clubEmail,
        "phone": this.secondFormGroup.value.clubPhone,
        "address": this.secondFormGroup.value.clubAddress,
        "time": this.secondFormGroup.value.clubTime
      },

      "allowSendEmails": this.secondFormGroup.value.allowSendEmails // FIX
    };

    const items: PeopleNavBar = await this.groupService.putCreateGroup(createGroup);
    // this.userService.planFlag = true;
    // this.userService.userSuperQuantity += 1;
    // this.userService.planQuantity += 1;
    this.userService.userPositions = items.positions;
    const groupIndex: groupComplex = items.positions[items.positions.length - 1].group;
    this.positionPut(groupIndex.group._id);
  }

  async positionPut(groupId: string): Promise<any> {
    const stepsDates: Date[] = [
                                this.firstFormGroup.value.jobEndDate, this.firstFormGroup.value.jobSubmissionDescisionDate,
                                this.firstFormGroup.value.videoInterviewsStart, this.firstFormGroup.value.videoInterviewsEnd, this.firstFormGroup.value.videoAnswers,
                                this.firstFormGroup.value.visitingInterviewsStart, this.firstFormGroup.value.visitingInterviewsEnd,
                                this.firstFormGroup.value.jobDescisionDate, this.firstFormGroup.value.jobStartDate
                               ];

    const stepsEnables: number[] = [0, 0]; // [this.firstFormGroup.value.videoEnable[0], this.firstFormGroup.value.visitingEnable[0]];

    const createPosition: CreateOpenPosition = {
      'groupId': groupId,

      'standout': this.firstFormGroup.value.standout,
      'filter': this.firstFormGroup.value.filterStatus,
      'feedback': this.firstFormGroup.value.feedback,

      'title': this.firstFormGroup.value.title,
      'position': Number(this.firstFormGroup.value.job),
      'type': this.firstFormGroup.value.type,

      'how': this.firstFormGroup.value.apply.how,
      'direct': this.firstFormGroup.value.apply.direct,

      'contractLength': this.firstFormGroup.value.contract.length,
      'contractLengthType': this.firstFormGroup.value.contract.lengthType,

      'spotsAvailable': this.firstFormGroup.value.spotsAvailable ? (this.firstFormGroup.value.spotsAvailable+1) : 0,
      "internalId": this.firstFormGroup.value.internalId,
      // "salary": this.firstFormGroup.value.salary,
      // "hours": this.firstFormGroup.value.hours,
      'tags': this.firstFormGroup.value.tags,
      'projects': null, // this.firstFormGroup.value.projects,

      'gradesRequired': this.firstFormGroup.value.gradesRequired,
      'lettersRequired': this.firstFormGroup.value.lettersRequired,
      'numReferees': this.firstFormGroup.value.numReferees ? (this.firstFormGroup.value.numReferees+1) : 0,
      'lettersGuidelines': this.firstFormGroup.value.lettersGuidelines,

      'stepsDates': stepsDates,
      'stepsEnables': stepsEnables,

      'description': this.firstFormGroup.value.jobDescription,
      'requiredExperience': this.firstFormGroup.value.jobExperience,
      'scholarship': this.firstFormGroup.value.jobScholarship,
      'duties': this.firstFormGroup.value.jobDuties,
      'expectations': this.firstFormGroup.value.FormControl,
      'requiredEducation': null, //this.firstFormGroup.value.education,

      'ai': null
    };

    this.streamPosition = 1;
    const positionId = await this.openPositionService.putPosition(createPosition, groupId);
    this.planUpdate(groupId, positionId, null);
  }

  async labPositionPut() {
    const univesityName: string = this.secondFormGroup.value.university.name ? this.secondFormGroup.value.university.name : this.secondFormGroup.value.university;
    const departmentName: string = this.secondFormGroup.value.department.name ? this.secondFormGroup.value.department.name : this.secondFormGroup.value.department;
    const labMode: number = (this.secondFormGroup.value.position>199) ? 9 : 8;

    const stepsDates: Date[] = [
                                this.firstFormGroup.value.jobEndDate, this.firstFormGroup.value.jobSubmissionDescisionDate,
                                this.firstFormGroup.value.videoInterviewsStart, this.firstFormGroup.value.videoInterviewsEnd, this.firstFormGroup.value.videoAnswers,
                                this.firstFormGroup.value.visitingInterviewsStart, this.firstFormGroup.value.visitingInterviewsEnd,
                                this.firstFormGroup.value.jobDescisionDate, this.firstFormGroup.value.jobStartDate
                               ];

    const stepsEnables: number[] = [0, 0]; // [this.firstFormGroup.value.videoEnable[0], this.firstFormGroup.value.visitingEnable[0]];

    const members = [
      {
        "_id": null,
        "name": this.secondFormGroup.value.firstName + ' ' + this.secondFormGroup.value.lastName,
        "pic": null,
        "email": (this.secondFormGroup.controls['emailSame'].value) ? this.secondFormGroup.value.contactEmail : this.secondFormGroup.value.instituteEmail,
        "position": this.secondFormGroup.value.position,
        "startDate": new Date(this.secondFormGroup.value.startDate),
        "endDate": null,
        "active": [true],
        "messageFlag": null,
        "message": null
      }
    ];

    if (labMode==9) {
      members.push({
        "_id": null,
        "name": this.secondFormGroup.value.secondFirstName + ' ' + this.secondFormGroup.value.secondLastName,
        "pic": null,
        "email": this.secondFormGroup.value.secondInstituteEmail,
        "position": this.secondFormGroup.value.secondPosition,
        "startDate": new Date(this.secondFormGroup.value.secondStartDate),
        "endDate": null,
        "active": [true],
        "messageFlag": null,
        "message": null
      })
    }

    const createGroup: CreateGroup = {
      "buildMode": labMode,

      "university": univesityName,
      "department": departmentName,
      "unit": null,

      "group": this.secondFormGroup.value.group,

      "currentWebsite": this.secondFormGroup.value.website,
      "contactEmail": this.secondFormGroup.value.contactEmail,
      "twitter": this.secondFormGroup.value.twitter,

      "country_id": null,
      "group_size": this.secondFormGroup.value.group_size,
      "establishDate": new Date(this.secondFormGroup.value.establishDate),
      "topic": this.secondFormGroup.value.topic,

      "statement": this.secondFormGroup.value.statement,
      "quote": this.secondFormGroup.value.quote,

      "logo": this.groupPic,
      "interests": this.secondFormGroup.value.interests,
      "background": this.secondFormGroup.value.background,

      "names": [], // FIX: validate not null serverside
      "theme": null,
      "themeIndex": null,
      "cover": null,
      "privacy": 1,

      "members": members,
      "buildPro": this.secondFormGroup.value.buildStatus,

      "interview": {
        "status": this.secondFormGroup.value.interviewStatus,
        "email": (this.secondFormGroup.controls['interviewEmailSame'].value) ? this.secondFormGroup.value.contactEmail : this.secondFormGroup.value.interviewEmail
      },

      "club": {
        "status": this.secondFormGroup.value.clubStatus,
        "email": (this.secondFormGroup.controls['clubEmailSame'].value) ? this.secondFormGroup.value.contactEmail : this.secondFormGroup.value.clubEmail,
        "phone": this.secondFormGroup.value.clubPhone,
        "address": this.secondFormGroup.value.clubAddress,
        "time": this.secondFormGroup.value.clubTime
      },

      "allowSendEmails": this.secondFormGroup.value.allowSendEmails // FIX
    };

    const createPosition: CreateOpenPosition = {
      'groupId': null,

      'standout': this.firstFormGroup.value.standout,
      'filter': this.firstFormGroup.value.filterStatus,
      'feedback': this.firstFormGroup.value.feedback,

      'title': this.firstFormGroup.value.title,
      'position': Number(this.firstFormGroup.value.job),
      'type': this.firstFormGroup.value.type,

      'how': this.firstFormGroup.value.apply.how,
      'direct': this.firstFormGroup.value.apply.direct,

      'contractLength': this.firstFormGroup.value.contract.length,
      'contractLengthType': this.firstFormGroup.value.contract.lengthType,

      'spotsAvailable': this.firstFormGroup.value.spotsAvailable ? (this.firstFormGroup.value.spotsAvailable+1) : 0,
      "internalId": this.firstFormGroup.value.internalId,
      // "salary": this.firstFormGroup.value.salary,
      // "hours": this.firstFormGroup.value.hours,
      'tags': this.firstFormGroup.value.tags,
      'projects': null, // this.firstFormGroup.value.projects,

      'gradesRequired': this.firstFormGroup.value.gradesRequired,
      'lettersRequired': this.firstFormGroup.value.lettersRequired,
      'numReferees': this.firstFormGroup.value.numReferees ? (this.firstFormGroup.value.numReferees+1) : 0,
      'lettersGuidelines': this.firstFormGroup.value.lettersGuidelines,

      'stepsDates': stepsDates,
      'stepsEnables': stepsEnables,

      'description': this.firstFormGroup.value.jobDescription,
      'requiredExperience': this.firstFormGroup.value.jobExperience,
      'scholarship': this.firstFormGroup.value.jobScholarship,
      'duties': this.firstFormGroup.value.jobDuties,
      'expectations': this.firstFormGroup.value.FormControl,
      'requiredEducation': null, //this.firstFormGroup.value.education,

      'ai': null
    };

    // this.streamPosition = 1;
    const ids: string[] = await this.openPositionService.putPositionLab(createGroup, createPosition);
    this.planUpdate(ids[0], ids[1], ids[2]);
  }

  async planUpdate(groupId: string, positionId: string, dummyId: string) {
    const buildStatus: number = Number(this.secondFormGroup.value.buildStatus);
    const filterStatus: number = Number(this.firstFormGroup.value.filterStatus);
    const standout: number = this.firstFormGroup.value.standout;
    const plan = await this.openPositionService.postStripePosition((this.labFlag ? this.userService.buildGroupJob._id : groupId), positionId, dummyId, buildStatus, filterStatus, standout);

    // if (type==0) {
    if (0) {
      // this.togglePricingInfo.nativeElement.click();
      window.location.reload();
    } else {
      stripe.redirectToCheckout({
        sessionId: plan.id
      }).then(function (result) {
        this.router.navigate(result.success_url);
      });
    }
  }

  submitAnimation() {
    const that = this;

    const x = 100, interval = 200;
    for (var i = 0; i < x; i++) {
      setTimeout(function () { ++that.progress }, i * interval)
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  updateNavigation() {
    const tree: UrlTree = this.router.parseUrl(this.router.routerState.snapshot.url);
    const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const s: UrlSegment[] = g ? g.segments : [];
    // const s0 = s[0] ? s[0].path : null;

    this.labFlag = (s.length>1)
  }

  selectionChange(event) {
    if (event.selectedIndex==1) {
      this.labInfoVisible=true;
    } else if (event.selectedIndex==2) {
      this.updateDetailsPreview();
    }
  }

  onContinue(i: number) {
    this.submitStatus[i] = true;
    this.findInvalidControls(i);
    if (i==2) this.updateDetailsPreview();
  }

  // https://stackoverflow.com/questions/57731339/how-does-matstepper-triggers-the-error-state-for-a-step
  findInvalidControls(i: number) {
    const controls = (i==1) ? this.firstFormGroup.controls : this.secondFormGroup.controls;
    var err: string;
    var modified: string;

    if (i==1) this.firstInvalid = []; else this.secondInvalid = [];
    for (const name in controls) {
      if (controls[name].invalid) {
        modified = name;
        switch (name) {
          case "job": modified="Job Position"; break;
          case "type": modified="Job Type"; break;
          case "jobDescription": modified="Job Description"; break;
          case "group": modified="Lab Name"; break;
          case "website": modified="Lab\'s Website URL"; break;
          case "contactEmail": modified="Lab\'s Contact Email"; break;

          case "position": modified="Current Education or Position"; break;
          case "firstName": modified="First Name"; break;
          case "lastName": modified="Last Name"; break;
          case "startDate": modified="Start Date"; break;
          case "instituteEmail": modified="Institute Email"; break;

          case "secondPosition": modified="Principal Investigator Position"; break;
          case "secondFirstName": modified="Principal Investigator First Name"; break;
          case "secondLastName": modified="Principal Investigator Last Name"; break;
          case "secondStartDate": modified="Principal Investigator Start Date"; break;
          case "secondInstituteEmail": modified="Principal Investigator Institute Email"; break;

          case "interviewEmail": modified="Interview Email"; break;
          case "clubEmail": modified="Club Email"; break;
        }

        if (name=="apply") {
          // https://stackoverflow.com/questions/46926182/property-controls-does-not-exist-on-type-abstractcontrol-angular-4
          err = 'How to apply info is ' + (((controls[name] as FormGroup).controls['direct'].errors.required) ? 'required' : 'invalid');
        } else {
          err = modified + ' is ' + ((controls[name].errors.required==true) ? 'required' : 'invalid');
        }

        if (i==1) this.firstInvalid.push(err); else this.secondInvalid.push(err);
      }
    }
    if ((i==1 && this.firstInvalid.length>0) || (i==2 && this.secondInvalid.length>0)) this.viewportScroller.scrollToPosition([0, 0]);
  }

  async updateDetailsPreview() {
    const univesityId: string = this.secondFormGroup.value.university.academigId;

    if (univesityId) {
      const departmentId: string = this.secondFormGroup.value.department.name ? this.secondFormGroup.value.department._id : null;
      this.detailsPreview = await this.openPositionService.positionPreview(univesityId, departmentId);
    }
  }

}
