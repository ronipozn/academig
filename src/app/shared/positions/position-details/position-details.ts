import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router, ActivatedRoute} from '@angular/router';

import {OpenPositionApply, OpenPositionDetails, OpenPositionService} from '../../services/position-service';
import {featuresStandard, featuresGood, featuresBetter, featuresBest} from '../../../shared/services/position-service';

import {titlesTypes, PeopleService} from '../../services/people-service';
import {GroupService} from '../../services/group-service';
import {objectMini, SharedService} from '../../services/shared-service';

import {itemsAnimation} from '../../animations/index';

import {UserService} from '../../../user/services/user-service';

import {MetaService} from '../../services/meta-service';

import * as moment from 'moment';

@Component({
  selector: 'position-details',
  templateUrl: 'position-details.html',
  styleUrls: ['position-details.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class PositionDetailsComponent {
  @Input() parentId: string;
  @Input() projId: string;
  @Input() userId: string;
  @Input() sourceType: number;
  @Input() userStatus: number;
  @Input() groupStage: number;
  @Input() showEditBtn: boolean;

  @Output() title: EventEmitter <string> = new EventEmitter(true);

  generalBuildFlag = false;
  tagsBuildFlag = false;
  projectsBuildFlag = false;
  lettersBuildFlag = false;
  deadlinesBuildFlag = false;

  // titleBuildFlag = false;
  stepsBuildFlag = false;
  textBuildFlag = false;
  textType: number;
  textText: string;
  textTitles: string[] = ['Description', 'Duties and Tasks', 'Employer and Scholarship', 'Expectations', 'Education', 'Experience and Skills'];

  position: OpenPositionDetails;

  streamRetrieved: boolean;

  step: number = 0;

  streamFollow: number;
  streamHold: number;
  streamFinalize: number;
  streamDelete: number;

  deleteHint: string;

  // streamTitle = 0;
  streamGeneral = 0;
  streamTags = 0;
  streamProjects = 0;
  streamLetters = 0;
  streamDeadlines = 0;
  streamText: number[] = [0, 0, 0, 0, 0, 0];

  applyBuildFlag: boolean = false;
  applyAction: number = 0;

  streamApply: number;

  titlesTypes = titlesTypes;

  lengthSelect = ['Months', 'Years'];
  typeSelect = ["Full-time", "Part-time", "Contract", "Internship", "Volunteer"];
  currencySelect = ['Dollar', 'Euro', 'Pound', 'Shekel', 'Won', 'Ruble', 'Rupee', 'Yen', 'Yuan'];

  gradesTitles: string[] = ['GPA', 'GRE', 'TOEFL'];
  lettersTitles: string[] = ['Curriculum vitae', 'Letter of motivation', 'Letter of interest', 'Cover letter', 'Project proposal', 'Teaching statement'];

  deadlineDays: number;

  thresholdStandout: number[] = [0, 3, 5, 7];
  titlesStandout: string[] = ['STANDARD', 'GOOD', 'BETTER', 'BEST'];
  featuresStandout: string[];

  featuresStandard = featuresStandard;
  featuresGood = featuresGood;
  featuresBetter = featuresBetter;
  featuresBest = featuresBest;

  howSelect = ["Candidates apply with their Academig profile.", "Send an email directly to:", "Direct applicants to an external site to apply:"];

  @ViewChild('toggleWithdrawModal', { static: true }) toggleWithdraw: ElementRef;
  @ViewChild('togglePreviewModal', { static: true }) togglePreview: ElementRef;
  @ViewChild('toggleCancelModal', { static: true }) toggleCancel: ElementRef;
  @ViewChild('toggleSignUpModal', { static: true }) toggleSignUp: ElementRef;

  constructor(private titleService: Title,
              private peopleService: PeopleService,
              private groupService: GroupService,
              private sharedService: SharedService,
              private openPositionService: OpenPositionService,
              private userService: UserService,
              private activatedRoute: ActivatedRoute,
              private _router: Router,
              private metaService: MetaService) {}

  ngOnChanges() {
    this.updatePage()
  }

  async updatePage() {
    this.streamRetrieved = false;

    const position: OpenPositionDetails = await this.openPositionService.getPositionDetails(this.projId, this.parentId);

    if (position) {

      this.position = position;

      if (this.position.mode==null) this.position.mode=1;

      const title: string = this.titlesTypes[this.position.position] + ' - ' + this.position.title;

      this.titleService.setTitle(title + ' | Academig'),
      this.metaService.addMetaTags(position.description ? position.description.slice(0,160) : null, position.tags ? position.tags.toString() : null, title);
      this.metaService.getMetaTags();

      this.streamFollow = 0,
      this.title.emit(this.position.title);
      this.deadlineDays = (this.position.stepsDates && this.position.stepsDates[0]) ? moment(this.position.stepsDates[0]).diff(moment(), 'days') : null;

      switch (this.position.standout) {
        case 0: this.featuresStandout = this.featuresStandard; break;
        case 1: this.featuresStandout = this.featuresGood; break;
        case 2: this.featuresStandout = this.featuresBetter; break;
        case 3: this.featuresStandout = this.featuresBest; break;
      };

      this.streamRetrieved = true;

      this.activatedRoute.queryParams.subscribe(params => {
        const statistics = params['statistics'];
        const proposals = params['proposals'];
        if (params['statistics']) {
          this.stepsOp(5);
        } else if (params['proposals']) {
          this.stepsOp(2);
        } else {
          this.stepsOp(0);
        }
      });

      // const tree: UrlTree = this._router.parseUrl(this._router.routerState.snapshot.url);
      // const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
      // const s: UrlSegment[] = g.segments;
      //
      // switch (s[s.length-1].path) {
      //   case "invites": this.step = 1; break;
      //   case "proposals": this.step = 2; break;
      //   case "online-interviews": this.step = 3; break;
      //   case "in-person--interviews": this.step = 4; break;
      //   case "hire": this.step = 5; break;
      //   default: this.step = 0; break;
      // };

    } else {
      this.position = null;
      this.streamRetrieved = true;
      this.title.emit('[Position not available]');
    };

  }

  async positionFollow() {
    const toFollow: boolean = (this.position.apply[0].status == 1) ? false : true;
    this.streamFollow = 3;
    await this.peopleService.toggleFollow(3, 2, this.projId, toFollow);
    // this.userService.toggleFollow(toFollow, this.projId,, "position");
    this.streamFollow = 0;
    this.position.apply[0].status = toFollow ? 1 : 0;
  }

  async positionHold() {
    this.streamHold = 3;
    this.position.mode = (this.position.mode==1) ? 0 : 1;
    await this.openPositionService.postPosition(this.projId, this.parentId, this.position.mode);
    this.streamHold = 0;
  }

  async positionCancel() {
    this.streamHold = 3;
    await this.openPositionService.postPosition(this.projId, this.parentId, 2);
    this.streamHold = 0;
    this.toggleCancel.nativeElement.click();
    this._router.navigate(['..'], { relativeTo: this.activatedRoute });
  }

  async positionFinalize() {
    this.streamFinalize = 3;
    await this.openPositionService.postPosition(this.projId, this.parentId, 1);
    this.streamFinalize = 0;
  }

  async positionDelete() {
    this.streamDelete = 3;
    await this.openPositionService.deletePosition(this.projId, this.parentId);
    this.streamDelete = 0;
    this.toggleCancel.nativeElement.click();
    this._router.navigate(['..'], { relativeTo: this.activatedRoute });
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  // apply with email/url: show modal with requirements
  async applyOp(action: number, flag: boolean, event) {
    if (this.userId) {

      if (this.position.how==0) {

        this.applyAction = action;

        if (this.applyAction==3) { // WITHDRAW
          this.toggleWithdraw.nativeElement.click();
        } else if (this.applyAction==1) { // PREVIEW
          this.togglePreview.nativeElement.click();
        } else { // APPLY / CANCEL / UPDATE
          this.applyBuildFlag = flag;
        }

      } else if (this.position.how==1) {
        this.togglePreview.nativeElement.click();
      } else if (this.position.how==2) {
        this.togglePreview.nativeElement.click();
      }

    } else {
      this.toggleSignUp.nativeElement.click();
    }
  }

  async applyModalOp() {
    this.streamApply = 3;

    if (this.position.how==1) {
      await this.openPositionService.putApply(this.projId, 1, null);
      (window as any).open("mailto:"+this.position.direct, "_blank");
    } else if (this.position.how==2) {
      await this.openPositionService.putApply(this.projId, 2, null);
      (window as any).open(this.position.direct, "_blank");
    }

    this.streamApply = 0;
    this.togglePreview.nativeElement.click();
  }

  async applyAcademig(event) {
    var apply: OpenPositionApply;

    if (this.applyAction==0 || this.applyAction==2) {
      apply = {
        grades: [event.GPA, event.GRE, event.TOEFL],
        letters: event.letters,
        referees: event.referees
      }
    }

    // console.log('this.applyAction',this.applyAction)
    // console.log('event',event)

    if (this.applyAction==0) {

      this.streamApply = 3;
      await this.openPositionService.putApply(this.projId, 0, apply);
      this.streamApply = 0;
      this.applyBuildFlag = false;

      this.position.apply = [
        {
          id: this.userId,
          filter: null, //filtrNote
          filterStatus: null,
          note: null,
          status: 10,
          date: [new Date()],
          grades: apply.grades,
          letters: apply.letters,
          referees: apply.referees
        }
      ];

    } else if (this.applyAction>1) {

      this.streamApply = 3;
      await this.openPositionService.postApply(this.projId, this.applyAction, apply);
      this.streamApply = 0;

      if (this.applyAction==3) {
        this.position.apply[0].status += 100;
        this.toggleWithdraw.nativeElement.click();
      }

    }

  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async generalOp(mode: number, flag: boolean, event) {
    this.generalBuildFlag = flag;

    if (mode == 2) {
      this.position.type = event.type;
      this.position.site = event.site;
      this.position.spotsAvailable = event.spotsAvailable;
      this.position.contractLength = event.contractLength;
      this.position.contractLengthType = event.contractLengthType;
      this.position.salary = event.salary
      this.position.salaryCurrency = event.salaryCurrency
      this.position.internalId = event.id

      this.streamGeneral = 3;
      await this.openPositionService.updateGeneral(this.projId, this.parentId, event.type, event.site, event.spotsAvailable, event.contractLength, event.contractLengthType, event.salary, event.salaryCurrency, event.id);
      this.streamGeneral = 1;
    }
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async lettersOp(mode: number, flag: boolean, event) {
    this.lettersBuildFlag = flag;

    if (mode == 2) {
      this.position.lettersGuidelines = event.lettersGuidelines;
      this.position.lettersRequired = event.lettersRequired;
      this.position.gradesRequired = event.gradesRequired;
      this.position.numReferees = event.numReferees;

      this.streamLetters = 3;
      await this.openPositionService.updateLetters(this.projId, this.parentId, event.lettersGuidelines, event.lettersRequired, event.gradesRequired, event.numReferees);
      this.streamLetters = 1;
    }
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async deadlinesOp(mode: number, flag: boolean, event) {
    this.deadlinesBuildFlag = flag;

    if (mode == 2) {
      const stepsDates: Date[] = [event.submissionDeadline,
                                  event.firstAnswers,
                                  event.videoInterviewsStart,
                                  event.videoInterviewsEnd,
                                  event.videoAnswers,
                                  event.visitingInterviewsStart,
                                  event.visitingInterviewsEnd,
                                  event.finalAnswers,
                                  event.startDate
                                 ];

      const stepsEnables: number[] = [event.videoEnable[0],
                                      event.visitingEnable[0]
                                     ];

      this.position.stepsDates = stepsDates;
      this.position.stepsEnables = stepsEnables;

      this.streamDeadlines = 3;

      await this.openPositionService.updateDeadlines(this.projId, this.parentId, stepsDates, stepsEnables);

      this.streamDeadlines = 1;
    }
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async tagsOp(mode: number, flag: boolean, event) {
    this.tagsBuildFlag = flag;

    if (mode == 1) {

      this.streamTags = 3;
      await this.sharedService.deleteTags(5, this.projId, this.parentId);
      this.position.tags = [];
      this.streamTags = 0;

    } else if (mode == 2) {

      this.position.tags = event;
      this.streamTags = 3;
      await this.sharedService.postTags(5, this.position.tags, this.projId, this.parentId);
      this.streamTags = 1;

    }
  }

  typeClickOp() {
    this.userService.searchRefinements['positions'] = [this.titlesTypes[this.position.position]];
    this.userService.searchText = null;
    this._router.navigate(['./search']);
  }

  tagClickOp(i: number) {
    this.userService.searchText = this.position.tags[i];
    this._router.navigate(['./search']);
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async projectsOp(mode: number, flag: boolean, event) {
    this.projectsBuildFlag = flag;

    if (mode == 2) {
      this.position.projects = event;
      this.streamProjects = 3;
      await this.sharedService.updateMinis(3, 0, this.projId, this.parentId, event);
      this.streamProjects = 1;
    }
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async textOp(mode: number, type: number, flag: boolean, event) {
    this.textType = type;
    this.textBuildFlag = flag;

    if (mode == 0 ) {

      switch (type) {
        case 0: this.textText = this.position.description; break;
        case 1: this.textText = this.position.duties; break;
        case 2: this.textText = this.position.scholarship; break;
        case 3: this.textText = this.position.expectations; break;
        case 4: this.textText = this.position.requiredEducation; break;
        case 5: this.textText = this.position.requiredExperience; break;
      };

    } else if (mode == 1) {

      this.streamText[type] = 3;

      await this.sharedService.deleteText(this.projId, this.parentId, 300 + type);

      switch (type) {
        case 0: this.position.description = null; break;
        case 1: this.position.duties = null; break;
        case 2: this.position.scholarship = null; break;
        case 3: this.position.expectations = null; break;
        case 4: this.position.requiredEducation = null; break;
        case 5: this.position.requiredExperience = null; break;
      };

      this.streamText[type] = 0;
      this.textText = null;

    } else if (mode == 2) {

      switch (type) {
        case 0: this.position.description = event.text; break;
        case 1: this.position.duties = event.text; break;
        case 2: this.position.scholarship = event.text; break;
        case 3: this.position.expectations = event.text; break;
        case 4: this.position.requiredEducation = event.text; break;
        case 5: this.position.requiredExperience = event.text; break;
      };
      this.textText = event.text;
      this.streamText[type] = 3;

      await this.sharedService.postText(event.text, this.projId, this.parentId, 300 + type);

      this.streamText[type] = 1;

    } else if (mode == 3) {

      this.streamText[type] = 0;

    }
  }

  stepsOp(i: number): void {
    this.step = i;
  }

  animationDone(i: number) {
    if (i == 0) {
      this.streamGeneral = 0;
    } else if (i == 1) {
      this.streamTags = 0;
    } else if (i == 2) {
      this.streamProjects = 0;
    } else if (i == 3) {
      this.streamLetters = 0;
    } else if (i == 4) {
      this.streamDeadlines = 0;
    // } else if (i == 5) {
      // this.streamTitle = 0;
    }
  }

}
