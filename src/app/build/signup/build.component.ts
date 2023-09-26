import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {FormGroup, FormControl, FormArray, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {Subscription} from 'rxjs/Subscription';

import {CustomValidators} from 'ng2-validation';

import {screenAnimation} from '../screen.animation';

import {UserService} from '../../user/services/user-service';
import {CreateGroup, GroupService} from '../../shared/services/group-service';
import {groupComplex, complexName, objectMiniPosition} from '../../shared/services/shared-service';
import {PeopleNavBar, CreateProfile, PeopleService} from '../../shared/services/people-service';
import {Publication, PublicationService} from '../../shared/services/publication-service';
import {InviteService} from '../../shared/services/invite-service';
import {departmentsItems, UniversityService} from '../../shared/services/university-service';
import {SharedService} from '../../shared/services/shared-service';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import {AuthService} from '../../auth/auth.service';

import {environment} from '../../../environments/environment';

function universityValidator(control: FormControl): {[key: string]: any} {
  const value: string = (control.value && control.value._id) || '';
  const valid = value;
  return valid ? null : {ssn: true};
}

@Component({
    selector: 'signup-build',
    templateUrl: 'build.html',
    animations: [screenAnimation],
    host: { '[@screenAnimation]': '' },
    styleUrls: ['build.css']
})
export class SignUpBuildComponent implements OnInit, OnDestroy {
  subscriptionPopulate: Subscription;

  formModel: FormGroup;
  submitFlag: boolean = false;

  groupPic: string;
  secondPic: string;
  coverPic: string;

  countNum: number;
  stepNum: number;
  boundNum: number;
  forkNum: number; // condition flag for 1st and Next Steps states

                   // -1: Build for you

                   // 0: PI (New Lab)
                   // 1: PI (From Existing Position)

                   // 2: On Behalf (New Lab)
                   // 3: On Behalf (From Existing Position)

                   // 4: Company (New Lab)
                   // 5: Company (From Existing Position)

                   // 6: Marketing (New Lab) [4]
                   // 7: Marketing (New Company)

                   // 8: Personal [5]

  forArray: number[];

  notPartFlag: boolean = false;
  userPicBuildFlag: boolean = false;
  groupPicBuildFlag: boolean = false;
  secondPicBuildFlag: boolean = false;
  coverPicBuildFlag: boolean = false;

  restrictFlag: boolean = null;

  subPicIndex: number[];

  steps: number[][];

  publicationsSuggestions: Publication[];
  streamPublications: number[];
  streamSuggestions: number[];

  companyItems: complexName[];
  companyFlag: boolean = false;

  topics: string[];

  private auth0Client: Auth0Client;

  constructor(
      private _router: Router,
      private titleService: Title,
      private datepipe: DatePipe,
      public groupService: GroupService,
      public peopleService: PeopleService,
      public publicationService: PublicationService,
      public universityService: UniversityService,
      public inviteService: InviteService,
      public userService: UserService,
      public sharedService: SharedService,
      public authService: AuthService) {
    this.countNum = 0;
    this.stepNum = 0;
    this.boundNum = 0;
    this.forkNum = 0;

    this.titleService.setTitle('Build Profile | Academig');
  }

  async ngOnInit() {
    this.auth0Client = await this.authService.getAuth0Client();

    this.subscriptionPopulate = this.userService.populateAnnounced$.subscribe(item => this.buildInit());

    if (this.userService.userProgress) this.buildInit();
  }

  async buildInit() {
    if (
        !this.userService.isAuthenticated ||
        (
         this.userService.buildPositionWebsiteFlag==false &&
         (this.userService.buildPersonalWebsiteFlag==false && this.userService.userProgress[5]==true) &&
         this.userService.buildScratchWebsiteFlag==false &&
         this.userService.buildMarketingWebsiteFlag==false &&
         this._router.url!="/build-lab"
        )
       ) {

      this.restrictFlag = true;

    } else {

      this.restrictFlag = false;

      this.groupPic = null;
      this.secondPic = null;
      this.coverPic = null;

      this.steps = [
                    // 19,
                    [0, 3, 4, 6, 7, 17, 9, 11, 12, 16], // new Lab (PI) [0]
                    [0, 3, 4, 7, 17, 9, 11, 12, 16], // position Lab (PI) [1]
                    [0, 3, 4, 6, 7, 17, 9, 11, 12, 16], // new Lab (OnBehalf) [2]
                    [0, 3, 4, 7, 17, 9, 11, 12, 16], // position Lab (OnBehalf) [3]
                    [0, 3, 6, 7, 17, 9, 11, 16], // new Company (Admin) [4]
                    [0, 3, 4, 6, 7, 11, 12, 16], // position Company (Admin) [5]
                    [0, 3, 6, 7, 17, 9, 11, 16], // marketingSteps (Lab) [6]
                    [0, 3, 6, 7, 17, 9, 11, 16], // marketingSteps (Company) [7]
                    [0, 1, 6, 9, 4, 11, 19, 14, 15, 16] // personalSteps [8] // 13
                    // [0, 1, 6, 9, 4, 11, 19, 14, 16] // personalSteps [8] // 13
                   ];
                   // 5, 8, 12, 10 (after 9, onBehalf)

      // https://stackoverflow.com/questions/10346722/how-can-i-split-a-javascript-string-by-white-space-or-comma
      var parts = this.userService.userName.split(/[ .]+/);

      const userMe: objectMiniPosition = {
        "_id": this.userService.userId,
        "name": this.userService.userName,
        "pic": this.userService.userPic,
        "email": this.userService.userEmail,
        "position": null,
        "startDate": null,
        "endDate": null,
        "active": null,
        "messageFlag": null,
        "message": null
      }

      this.formModel = new FormGroup({
        // buildType: new FormControl(0),
        buildMode: new FormControl(0),

        firstName: new FormControl(this.capitalizeFirstLetter(parts.shift()), Validators.required),
        lastName: new FormControl(this.capitalizeFirstLetter(parts.shift() || ""), Validators.required),
        country: new FormControl(''),

        firstInstituteEmail: new FormControl('', Validators.required),
        secondInstituteEmail: new FormControl('', Validators.required),

        currentWebsite: new FormControl('', CustomValidators.url),
        buildPro: new FormControl(0),
        interviewStatus: new FormControl(false),
        mentorStatus: new FormControl(0),
        currentMore: new FormControl(''),
        allowSendEmails: new FormControl(false),

        // university: new FormControl('', universityValidator),
        university: new FormControl(null, [Validators.required]),
        department: new FormControl(null, [Validators.required]),
        group: new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.minLength(5)]),

        group_size: new FormControl(null),
        establishDate: new FormControl(null),
        topic: new FormControl(null),
        allowDetails: new FormControl(false),

        preMembers: new FormControl([userMe], Validators.required),
        members: new FormArray([ ]),

        secondName: new FormControl('', [Validators.required, Validators.maxLength(30), Validators.minLength(2)]),

        background: new FormControl(''),
        interests: new FormControl([]),
        names: new FormControl(''),

        theme: new FormControl(0),
        themeIndex: new FormControl(0),

        challengeGoal: new FormControl(null),
        papersKitStatus: new FormControl(false),

        privacy: new FormControl("0", Validators.required),

        groupsIds: new FormControl(null),
        groupsToggle: new FormArray([
                               new FormControl(true),
                               new FormControl(true),
                               new FormControl(true),
                               new FormControl(false),
                               new FormControl(false),
                               new FormControl(false),
                               new FormControl(false),
                               new FormControl(false),
                               new FormControl(false),
                               new FormControl(false)
                             ]),

        rightsCheckbox: new FormControl(false)
      });

      if (this.userService.buildScratchWebsiteFlag || this._router.url=="/build-lab") {
        this.forkNum = -1; // => lead to 0 or 4
        // this.formModel.controls['endDate'].disable()
      } else if (this.userService.buildPersonalWebsiteFlag) {
        this.forkNum = 8;
        // this.formModel.controls['endDate'].disable()
      } else if (this.userService.buildPositionWebsiteFlag) {
        if (this.userService.buildPositionWebsite.group.university.name=="company") {
          this.forkNum = 5;
        } else if (this.userService.buildPositionWebsite.titles[0]<110) {
          this.forkNum = 1;
        } else {
          this.forkNum = 3;
        };
        this.formModel.controls['buildMode'].setValue(this.forkNum)
        this.formModel.controls['university'].setValue(this.userService.buildPositionWebsite.group.university.name)
        this.formModel.controls['department'].setValue(this.userService.buildPositionWebsite.group.department.name)
        this.formModel.controls['group'].setValue(this.userService.buildPositionWebsite.group.group.name)

        const userMe: objectMiniPosition = {
          "_id": this.userService.userId,
          "name": this.userService.userName,
          "pic": this.userService.userPic,
          "email": null,
          "position": this.userService.buildPositionWebsite.titles[0],
          "startDate": this.userService.buildPositionWebsite.period.start,
          "endDate": this.userService.buildPositionWebsite.period.end,
          "active": null,
          "messageFlag": null,
          "message": null
        }
        this.formModel.controls['preMembers'].setValue([userMe]);

      } else if (this.userService.buildMarketingWebsiteFlag) {
        this.forkNum = (this.userService.buildPositionWebsite.group.university.name=="company") ? 7 : 6;
        this.formModel.controls['buildMode'].setValue(this.forkNum)
        this.formModel.controls['university'].setValue(this.userService.buildPositionWebsite.group.university)
        this.formModel.controls['department'].setValue(this.userService.buildPositionWebsite.group.department)
      } else if (this.userService.userProgress[5]==false) { // triggered only if no other Flag is True
        this.forkNum = 8;
        // this._router.navigate(['/']);
      }

      if (this.forkNum>-1) {
        this.forArray = Array(this.steps[this.forkNum].length - 1).fill(1)
      } else {
        this.forArray = Array(((this.userService.planQuantity == 0) ? 10 : 9)).fill(1);
      };

      if (this.forkNum==8 && (this.userService.userInvites || []).length>0) {
        this.publicationsSuggestions = this.userService.userInvites.filter(r => r.mode==4).map(r => r.publication).filter(r => r!=null)
        this.streamPublications = new Array(this.publicationsSuggestions.length).fill(0);
        this.streamSuggestions = new Array(this.publicationsSuggestions.length).fill(0);
        this.steps[8].splice(2, 0, 2); // insert 2 at index 2
      }

      this.subPicIndex = new Array(29).fill(0);

      this.topics = await this.sharedService.queryTopics(null);
    }
  }

  onSubmit() {
    if (this.forkNum == 8) {
      this.submitProfile()
    } else {
      this.submitGroup()
    }
  }

  async submitGroup() {
    this.submitFlag = true;
    this.formModel.controls['rightsCheckbox'].disable();

    const univesityName = this.formModel.value.university.name ? this.formModel.value.university.name : this.formModel.value.university;

    var departmentName: string;

    if (this.forkNum==4 || this.forkNum==5 || this.forkNum==7) {
      departmentName = this.companyItems[this.formModel.value.department].name;
    } else {
      departmentName = this.formModel.value.department.name ? this.formModel.value.department.name : this.formModel.value.department;
    }

    const buildMode = this.formModel.value.buildMode;

    const createGroup: CreateGroup = {
      "buildMode": buildMode,

      "cover": this.coverPic,
      "theme": this.formModel.value.theme,
      "themeIndex": this.formModel.value.themeIndex,

      "university": univesityName,
      "department": departmentName,
      "unit": null, // this.formModel.value.unit,
      "group": this.formModel.value.group,

      "currentWebsite": this.formModel.value.currentWebsite,
      "contactEmail": null,
      "twitter": null,

      "country_id": this.formModel.value.country ? this.formModel.value.country.id : null,
      "group_size": this.formModel.value.group_size,
      "establishDate": this.formModel.value.establishDate ? new Date(this.formModel.value.establishDate) : null,
      "topic": this.formModel.value.topic,

      "statement": null,
      "quote": null,

      "logo": this.groupPic,
      "interests": this.formModel.value.interests,
      "background": this.formModel.value.background,

      "names": this.formModel.value.names,
      "privacy": this.formModel.value.privacy,

      "members": this.formModel.value.members,

      "buildPro": this.formModel.value.buildPro,

      "interview": null,
      "club": null,

      "allowSendEmails": this.formModel.value.allowSendEmails,
    };

    const items: PeopleNavBar = await this.groupService.putCreateGroup(createGroup);

    if (this.forkNum!=6 && this.forkNum!=7) {
      this.userService.userPositions = items.positions;
      // this.userService.userStatus = true;
    }

    if (this.forkNum==0) {
      this.userService.planFlag = true;
      this.userService.userSuperQuantity += 1;
      this.userService.planQuantity += 1;
    }

    if (this.forkNum==6 || this.forkNum==7) {
      this._router.navigate(['/', 'admin', 'labs']);
    } else {
      const groupIndex: groupComplex = items.positions[items.positions.length - 1].group;
      this._router.navigate(['/', groupIndex.university.link, groupIndex.department.link, this.formModel.value.group.replace(/ /g, '_').toLowerCase()]);
    }
  }

  async submitProfile() {
    this.submitFlag = true;
    this.formModel.controls['rightsCheckbox'].disable();

    var members: objectMiniPosition[];

    if (this.formModel.value.members && this.formModel.value.members[0]) {
      members = this.formModel.value.members;

      if (this.formModel.value.buildMode==2) {
        const piIndex: number = members.findIndex(x => x.position<150);
        if (piIndex>1) [members[1], members[piIndex]] = [members[piIndex], members[1]];
      }

    } else {
      members = [{
        "_id": this.userService.userId,
        "name": this.userService.userName,
        "pic": this.userService.userPic,
        "email": this.userService.userEmail,
        "position": null,
        "startDate": null,
        "endDate": null,
        "active": [false],
        "messageFlag": null,
        "message": null
      }]
    }

    const univesityName = (this.formModel.value.university && this.formModel.value.university.name) ? this.formModel.value.university.name : this.formModel.value.university;
    const departmentName = (this.formModel.value.department && this.formModel.value.department.name) ? this.formModel.value.department.name : this.formModel.value.department;
    const startDate = members[0].startDate;
    const endDate = members[0].endDate;

    // const createProfile: CreateProfile = new CreateProfile(
    const createProfile: CreateProfile = {
      "firstName": this.formModel.value.firstName,
      "lastName": this.formModel.value.lastName,
      "country_id": this.formModel.value.country ? this.formModel.value.country.id : null,
      "pic": this.userService.userPic,

      "background": this.formModel.value.background,
      "interests": this.formModel.value.interests,

      "position": members[0].position,
      "period": {
       "start": startDate ? new Date(startDate) : startDate,
       "end": endDate ? new Date(endDate) : endDate,
       "mode": members[0].active[0] ? 1 : 0
      },
      "university": univesityName,
      "department": departmentName,
      "group": this.formModel.value.group,

      "challengeGoal": this.formModel.value.challengeGoal,
      "papersKitStatus": this.formModel.value.papersKitStatus,

      "names": this.formModel.value.names,

      "theme": this.formModel.value.theme,
      "themeIndex": this.formModel.value.themeIndex,
      "cover": this.coverPic,

      "groupsIds": this.formModel.value.groupsIds,

      "buildMode": this.formModel.value.buildMode,
      "currentWebsite": this.formModel.value.currentWebsite,
      "buildPro": this.formModel.value.buildPro,
      "mentorStatus": this.formModel.value.mentorStatus,
      "interview": {
        "status": this.formModel.value.interviewStatus,
        "email": this.userService.userEmail
      },
      "group_size": this.formModel.value.group_size,
      "establishDate": this.formModel.value.establishDate ? new Date(this.formModel.value.establishDate) : null,
      "topic": this.formModel.value.topic,
      "members": members,
    };

    let items: PeopleNavBar = await this.peopleService.putCreateProfile(createProfile);

    this.userService.userPositions = items.positions;
    this.userService.userProgress[5] = true;
    this.userService.userTour = true;
    this.userService.userName = this.formModel.value.firstName + ' ' + this.formModel.value.lastName;
    this.userService.userChallenge = this.formModel.value.challengeGoal;

    this.userService.userFolders = [
      {"_id": null, "folder": 'current', "count": 0, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null},
      {"_id": null, "folder": 'want', "count": 0, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null},
      {"_id": null, "folder": 'read', "count": 0, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null}
    ]

    this._router.navigate(['/']);   // this._router.navigate(['/people', this.userService.userId]);
  }

  moveStep(event: number[]) {
    if (event[0] == 1) {
      // this.formModel.controls['buildType'].setValue(event[2])
      this.formModel.controls['buildMode'].setValue(event[1])
      this.forkNum = event[1];
      this.forArray = Array(this.steps[this.forkNum].length - 1).fill(1);
      if (this.forkNum==4 || this.forkNum==5 || this.forkNum==7) this.queryCompanyFields();
    }
    if (event[0] == 2) {
      this.manageInvites();
    }

    this.stepNum = this.steps[this.forkNum][this.countNum+1];
    this.countNum+=1;

    // if (this.countNum > this.boundNum) this.boundNum = this.stepNum;
    if (this.stepNum >= this.boundNum) this.boundNum = this.stepNum;
  }

  previousStep() {
    if (this.forkNum==8 && this.stepNum==11 && this.notPartFlag) {
      this.countNum-=3;
    } else {
      this.countNum-=1;
    }
    this.stepNum = this.steps[this.forkNum][this.countNum];
    if (this.stepNum >= this.boundNum) this.boundNum = this.stepNum;
  }

  skipLabStep() {
    this.formModel.controls['university'].reset();
    this.formModel.controls['department'].reset();
    this.formModel.controls['group'].reset();
    this.formModel.controls['preMembers'].reset();
    this.formModel.controls['members'].reset();

    this.countNum+=3;
    this.stepNum = this.steps[this.forkNum][this.countNum];
    this.notPartFlag = true;
  }

  async skipBuild() {
    if (this.forkNum==8) await this.peopleService.putPeopleSkip();
    this._router.navigate(['/']);
  }

  moveRadioStep(i: number) {
    // patch for last screen and when PLAN screen appears
    this.countNum = i;
    this.stepNum = this.steps[this.forkNum][this.countNum];
  }

  userPicOp(mode: number, flag: boolean, event) {
    this.userPicBuildFlag = flag;
    if (mode == 1) {
      this.userService.userPic = null;
    } else if (mode == 2) {
      this.userService.userPic = event;
    }
  }

  groupPicOp(mode: number, flag: boolean, event) {
    this.groupPicBuildFlag = flag;
    if (mode == 1) {
      this.groupPic = null;
    } else if (mode == 2) {
      this.groupPic = event;
    }
  }

  secondPicOp(mode: number, flag: boolean, event) {
    this.secondPicBuildFlag = flag;
    if (mode == 1) {
      this.secondPic = null;
    } else if (mode == 2) {
      this.secondPic = event;
    }
  }

  coverPicOp(mode: number, flag: boolean, event) {
    this.coverPicBuildFlag = flag;
    if (mode == 1) {
      this.coverPic = null;
    } else if (mode == 2) {
      this.coverPic = event;
    }
  }

  async suggestionDecision(event, action: number) {
    // event[0] - itemId
    // event[1] - item location "on the screen"
    const i: number = this.publicationsSuggestions.findIndex(x => x._id == event[0]);

    this.streamSuggestions[event[1]] = 3;

    await this.publicationService.decisionSuggestion(this.userService.userId, event[0], action, 1);

    if (action==0) { // Accepted
      this.streamSuggestions[event[1]] = 1;
      // this.publicationToggle = !this.publicationToggle;
    } else if (action==1) { // Rejected
      this.streamSuggestions[event[1]] = 2;
      var x = this.publicationsSuggestions[i].authors.findIndex(a => a._id==this.userService.userId)
      if (x>-1) {
        this.publicationsSuggestions[i].authors[x]._id = null;
        this.publicationsSuggestions[i].authors[x].pic = null;
      }
    }
  }

  async manageInvites() {
    await this.inviteService.pullPeopleInvites(4);
    this.userService.userInvites = [];
  }

  async queryCompanyFields() {
    this.companyFlag = false;
    this.companyItems = await this.universityService.getDepartments(environment.companyId,'');
    this.companyItems.sort((a, b) => (a.link > b.link) ? 1 : -1)
    this.companyFlag = true;
  }

  // https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  logout() {
    this.auth0Client.logout({
      client_id: this.authService.config.client_id,
      returnTo: window.location.origin
    });
  }

  ngOnDestroy() {
    this.userService.buildPositionWebsiteFlag=false;
    this.userService.buildMarketingWebsiteFlag=false;
    this.userService.buildPersonalWebsiteFlag=false;
    this.userService.buildScratchWebsiteFlag=false;

    if (this.subscriptionPopulate) this.subscriptionPopulate.unsubscribe();
  }

}
