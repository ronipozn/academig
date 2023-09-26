import {Component, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Router, ActivatedRoute} from '@angular/router';

import {UserService} from '../../user/services/user-service';
import {PeopleService} from '../../shared/services/people-service';

import {Link, SharedService} from '../../shared/services/shared-service';
import {Expertise, Availability, OnGoing, MentorService} from '../../shared/services/mentor-service';
import {PricesSelect, DurationsSelect, TimesSelect, DaysSelect, AvailabilitySelect, ToolsSelect, ExpertisesSelect} from '../../shared/services/mentor-service';
import {FAQ, FaqService} from '../../shared/services/faq-service';

import {MissionService} from '../services/mission-service';

import {itemsAnimation} from '../../shared/animations/index';

import {CoachingFormDialog} from './coaching-dialog/coaching-dialog';

@Component({
  selector: 'profile-mentoring',
  templateUrl: 'mentoring.html',
  styleUrls: ['mentoring.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class MentoringComponent {
  @ViewChild('toggleCancelModal', { static: true }) toggleCancel: ElementRef;

  mentor: any;
  clipConvert: string;

  ////////////////////////////////////////

  streamInvite: number;
  streamHold: number;
  streamFinalize: number;
  streamDelete: number;

  streamIntroduction: number;
  streamExpertise: number[];
  streamToolkit: number[];
  streamLink: number[];
  streamFAQ: number[];

  streamAvailability: number;
  streamOnGoing: number;

  streamRetrieved: boolean;

  showExpertisesButton: boolean[];
  showToolkitsButton: boolean[];

  ////////////////////////////////////////

  availabilityBuildFlag: boolean = false;
  ongoingBuildFlag: boolean = false;

  introductionBuildFlag: boolean = false;

  expertiseBuildFlag: boolean = false;
  expertiseNewFlag: boolean = false;
  expertiseIndex: number;

  toolkitBuildFlag: boolean = false;
  toolkitNewFlag: boolean = false;
  toolkitIndex: number;

  linkBuildFlag: boolean = false;
  linkNewFlag: boolean = false;
  linkIndex: number;

  faqNewFlag: boolean = false;
  faqBuildFlag: boolean = false;
  faqIndex: number;

  itemFocus: number;

  DialogRef: MatDialogRef<CoachingFormDialog>;

  pricesSelect = PricesSelect;
  durationsSelect = DurationsSelect;
  timesSelect = TimesSelect;
  daysSelect = DaysSelect;
  toolsSelect = ToolsSelect;
  availabilitySelect = AvailabilitySelect;

  expertisesSelect = ExpertisesSelect;

  constructor(public titleService: Title,
              public userService: UserService,
              public peopleService: PeopleService,
              public sharedService: SharedService,
              public mentorService: MentorService,
              public missionService: MissionService,
              private faqService: FaqService,
              private _router: Router,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private dialogRef: MatDialogRef<CoachingFormDialog>) {}

  ngOnInit() {
    this.titleService.setTitle('Mentor - ' + this.missionService.peopleName + ' | Academig');
    this.updatePage()
  }

  async updatePage() {
    this.streamRetrieved = false;
    this.mentor = await this.mentorService.getMentorDetails(this.missionService.peopleId);
    this.streamRetrieved = true;
    if (this.mentor) {
      this.streamExpertise = new Array(this.mentor.expertises.length).fill(0);
      this.streamToolkit = new Array(this.mentor.toolkits.length).fill(0);
      this.streamLink = new Array(this.mentor.links.length).fill(0);
      this.streamFAQ = new Array(this.mentor.faqs.length).fill(0);

      this.showExpertisesButton = new Array(this.mentor.expertises.length).fill(false);
      this.showToolkitsButton = new Array(this.mentor.toolkits.length).fill(false);

      this.mentor.reviews = [
        // {
        //   "_id": "111",
        //   "sessions": 2,
        //   "date": new Date(),
        //   "reviewer": {
        //     "_id": "roni.pozner",
        //     "name": "roni.pozner",
        //     "pic": "https://cdn.dribbble.com/users/2815890/screenshots/11900974/elon_musk_freskins2.jpg"
        //   },
        //   "title": "Some title",
        //   "description": "Wifey made the best Father's Day meal ever. So thankful so happy so blessed. Thank you for making my family We just had fun with the “future” theme !!! It was a fun night all together ... The always rude Kanye Show at 2am Sold Out Famous viewing @ Figueroa and 12th in downtown."
        // }
      ]
    }
  }

  async inviteOp() {
    this.streamInvite = 3;
    this.mentor = {
      "userId": this.userService.userId,
      "status": 0
    }
    await this.mentorService.putMentor();
    this.streamInvite = 0;
  }

  async mentorHold() {
    this.streamHold = 3;
    this.mentor.mode = (this.mentor.mode==3) ? 2 : 3;
    await this.mentorService.postMentor(this.mentor.mode);
    this.streamHold = 0;
  }

  async mentorCancel() {
    this.streamHold = 3;
    await this.mentorService.postMentor(2);
    this.streamHold = 0;
    this.toggleCancel.nativeElement.click();
    this._router.navigate(['..'], { relativeTo: this.route });
  }

  async mentorFinalize() {
    this.streamFinalize = 3;
    await this.mentorService.postMentor(1);
    this.streamFinalize = 0;
  }

  async mentorDelete() {
    this.streamDelete = 3;
    await this.mentorService.deleteMentor(0);
    this.streamDelete = 0;
    this.toggleCancel.nativeElement.click();
    this._router.navigate(['..'], { relativeTo: this.route });
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async availabilityOp(mode: number, flag: boolean, event) {
    this.availabilityBuildFlag = flag;

    if (mode == 2) {
      console.log('availabilityOp',event)
      const availabilityObj: Availability = {
        'price': event.price,
        'times': event.times,
        'durations': event.durations,
        'days': event.days,
        'availability': event.availability,
        'tools': event.tools,
      };
      this.mentor.availability = availabilityObj
      this.streamAvailability = 3;
      await this.mentorService.postAvailability(availabilityObj);
      this.streamAvailability = 0;
    }
  }

  async ongoingOp(mode: number, flag: boolean, event) {
    this.ongoingBuildFlag = flag;

    if (mode == 2) {
      console.log('ongoingOp',event)
      const ongoingObj: OnGoing = {
        'price': event.price,
        'hours': event.hours,
        'details': event.details
      };
      this.mentor.ongoing = ongoingObj
      this.streamOnGoing = 3;
      await this.mentorService.postOngoing(ongoingObj);
      this.streamOnGoing = 0;
    }
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  async introductionOp(mode: number, flag: boolean, event) {
    this.introductionBuildFlag = flag;
    if (mode == 1) {

      this.streamIntroduction = 3;
      await this.sharedService.deleteTextPic(20, null, null);
      this.mentor.introduction = null;
      this.mentor.clip = null;
      this.streamIntroduction = 0;

    } else if (mode == 2) {

      this.mentor.introduction = event.text;
      this.mentor.clip = event.clip;
      this.streamIntroduction = 3;
      if (event.clip) this.clipConvert = this.sharedService.convertMedia(event.clip);
      await this.sharedService.postTextPic(20, null, null, event.text, event.clip, null);
      this.streamIntroduction = 1;

    } else if (mode == 3) {

      this.streamIntroduction = 0;

    }
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  expertiseSlide(flag: boolean, i: number, newFlag: boolean) {
    this.expertiseIndex = i;
    this.expertiseBuildFlag = flag;
    this.expertiseNewFlag = newFlag;
  }

  async expertiseUpdate(event) {
    this.expertiseBuildFlag = false;

    const expertise: Expertise = {
      '_id': (this.expertiseNewFlag) ? null : this.mentor.expertises[this.expertiseIndex]._id,
      'name': event.name,
      'years': event.years,
      'description': event.description
    };

    if (this.expertiseNewFlag == true) {

      this.mentor.expertises.push(expertise);
      this.streamExpertise[this.mentor.expertises.length - 1] = 3;
      this.itemFocus = this.mentor.expertises.length - 1;
      this.mentor.expertises[this.mentor.expertises.length - 1]._id = await this.mentorService.putExpertise(expertise, 0);
      this.streamExpertise[this.mentor.expertises.length - 1] = 1;

    } else {

      this.mentor.expertises[this.expertiseIndex] = expertise;
      this.streamExpertise[this.expertiseIndex] = 3;
      await this.mentorService.postExpertise(expertise, 0);
      this.streamExpertise[this.expertiseIndex] = 1;

    }

  }

  async expertiseDelete(i: number) {
    this.streamExpertise[i] = 3;
    await this.mentorService.deleteExpertise(this.mentor.expertises[i]._id, 0);
    this.mentor.expertises.splice(i, 1);
    this.streamExpertise[i] = 0;
  }

  expertiseStreamFunc() {
    if (this.expertiseNewFlag == true) {
      this.streamExpertise[this.mentor.expertises.length - 1] = 0;
    } else {
      this.streamExpertise[this.expertiseIndex] = 0;
    }
  }

  buttonExpertisesOver(i: number, showStatus: boolean) {
    if (this.missionService.meFlag) this.showExpertisesButton[i] = showStatus;
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  toolkitSlide(flag: boolean, i: number, newFlag: boolean) {
    this.toolkitIndex = i;
    this.toolkitBuildFlag = flag;
    this.toolkitNewFlag = newFlag;
  }

  async toolkitUpdate(event) {
    this.toolkitBuildFlag = false;

    const toolkit: Expertise = {
      '_id': (this.toolkitNewFlag) ? null : this.mentor.toolkits[this.toolkitIndex]._id,
      'name': event.name,
      'years': event.years,
      'description': event.description
    };

    if (this.toolkitNewFlag == true) {

      this.mentor.toolkits.push(toolkit);
      this.streamToolkit[this.mentor.toolkits.length - 1] = 3;
      this.itemFocus = this.mentor.toolkits.length - 1;
      this.mentor.toolkits[this.mentor.toolkits.length - 1]._id = await this.mentorService.putExpertise(toolkit, 1);
      this.streamToolkit[this.mentor.toolkits.length - 1] = 1;

    } else {

      this.mentor.toolkits[this.toolkitIndex] = toolkit;
      this.streamToolkit[this.toolkitIndex] = 3;
      await this.mentorService.postExpertise(toolkit, 1);
      this.streamToolkit[this.toolkitIndex] = 1;

    }

  }

  async toolkitDelete(i: number) {
    this.streamToolkit[i] = 3;
    await this.mentorService.deleteExpertise(this.mentor.toolkits[i]._id, 1);
    this.mentor.toolkits.splice(i, 1);
    this.streamToolkit[i] = 0;
  }

  toolkitStreamFunc() {
    if (this.toolkitNewFlag == true) {
      this.streamToolkit[this.mentor.toolkits.length - 1] = 0;
    } else {
      this.streamToolkit[this.toolkitIndex] = 0;
    }
  }

  buttonToolkitsOver(i: number, showStatus: boolean) {
    if (this.missionService.meFlag) this.showToolkitsButton[i] = showStatus;
  }

  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////
  /////////////////////////////////////////////////////

  linkSlide(flag: boolean, i: number, newFlag: boolean) {
    this.linkIndex = i;
    this.linkBuildFlag = flag;
    this.linkNewFlag = newFlag;
  }

  async linkUpdate(event) {
    this.linkBuildFlag = false;

    const link: Link = {
                        '_id': (this.linkNewFlag) ? null : this.mentor.links[this.linkIndex]._id,
                        'name': event.name,
                        'link': event.link,
                        'description': event.description,
                       };

    if (this.linkNewFlag == true) {

      this.mentor.links.push(link);
      this.streamLink[this.mentor.links.length - 1] = 3;
      this.itemFocus = this.mentor.links.length - 1;
      this.mentor.links[this.mentor.links.length - 1]._id = await this.sharedService.putLink(link, this.missionService.peopleId, 1);
      this.streamLink[this.mentor.links.length - 1] = 1;

    } else {

      this.mentor.links[this.linkIndex] = link;
      this.streamLink[this.linkIndex] = 3;
      await this.sharedService.postLink(link, this.missionService.peopleId, 1);
      this.streamLink[this.linkIndex] = 1;

    }
  }

  async linkDelete(i: number) {
    this.streamLink[i] = 3;
    await this.sharedService.deleteLink(this.mentor.links[i]._id, this.missionService.peopleId, 1);
    this.mentor.links.splice(i, 1);
    this.streamLink[i] = 0;
  }

  linkStreamFunc() {
    if (this.linkNewFlag == true) {
      this.streamLink[this.mentor.links.length - 1] = 0;
    } else {
      this.streamLink[this.linkIndex] = 0;
    }
  }

  ///////////////////////////////
  ///////////////////////////////
  ///////////////////////////////
  ///////////////////////////////

  faqSlide(flag: boolean, i: number, newFlag: boolean) {
    this.faqIndex = i;
    this.faqBuildFlag = flag;
    this.faqNewFlag = newFlag;
  }

  async faqUpdate(event) {
    this.faqBuildFlag = false;

    const faq: FAQ = {
                      '_id': (this.faqNewFlag) ? null : this.mentor.faqs[this.faqIndex]._id,
                      'question': event.question,
                      'answer': event.answer,
                      'ai': null
                     };

    if (this.faqNewFlag == true) {

      this.mentor.faqs.push(faq);
      const loc = this.mentor.faqs.length - 1;
      this.streamFAQ[loc] = 3;
      this.itemFocus = loc;
      this.mentor.faqs[loc]._id = await this.faqService.putFAQ(faq, null, 3);
      this.streamFAQ[loc] = 1;

    } else {

      this.mentor.faqs[this.faqIndex] = faq;
      this.streamFAQ[this.faqIndex] = 3;
      await this.faqService.postFAQ(faq, faq._id, null, 3);
      this.streamFAQ[this.faqIndex] = 1;

    }
  }

  async faqDelete(i: number) {
    this.streamFAQ[i] = 3;
    await this.faqService.deleteFAQ(this.mentor.faqs[i]._id, null, 3);
    this.mentor.faqs.splice(i, 1);
    this.streamFAQ[i] = 0;
  }

  faqStreamFunc() {
    if (this.faqNewFlag == true) {
      this.streamFAQ[this.mentor.faqs.length - 1] = 0;
    } else {
      this.streamFAQ[this.faqIndex] = 0;
    }
  }

  ///////////////////////////////
  ///////////////////////////////
  ///////////////////////////////
  ///////////////////////////////

  coachingDialogFunc() {
    this.DialogRef = this.dialog.open(CoachingFormDialog, {
      data: {
        name: this.missionService.peopleName,
        price: this.mentor.ongoing.price,
        details: this.mentor.ongoing.details
      }
    });

    const dialogSubmitSubscription = this.DialogRef.componentInstance.buttonRemoveClick.subscribe(folder => {
      dialogSubmitSubscription.unsubscribe();
      this.DialogRef.close();
    });
  }

}
