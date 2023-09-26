import {Component, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

import {departmentsItems, UniversityService} from '../../shared/services/university-service';
import {People, PeopleService} from '../../shared/services/people-service';
import {MissionService} from '../services/mission-service';
import {Publication, PublicationService} from '../../shared/services/publication-service';
import {News, NewsService} from '../../shared/services/news-service';
import {objectMini, SharedService} from '../../shared/services/shared-service';
import {Gallery} from '../../shared/services/gallery-service';

import {UserService} from '../../user/services/user-service';
import {SettingsService} from '../../shared/services/settings-service';

import {itemsAnimation} from '../../shared/animations/index';

import {NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation} from 'ngx-gallery';

import {ImproveFormDialog} from '../../shared/modals/modal-improve/modal-improve';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'university-home',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class UniversityHomeComponent {
  streamRetrieved: boolean[];
  // departmentsItems: departmentsItems;
  items: any;
  shortDescription: string;

  streamPublications: number[];
  streamPublicationsFolder: number[];
  streamPeople: number[];

  publications: Publication[];
  publicationToggle: boolean;

  newses: News[] = [];

  peoples: People[] = [];
  peopleCount: number = 0;

  locationBuildFlag: boolean = false;
  twitterBuildFlag: boolean = false;

  sourceDomain: string;

  galleryOptionsSm: NgxGalleryOptions[];
  galleryOptionsLg: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];

  DialogRef: MatDialogRef<ImproveFormDialog>;

  toggleRank = [false, false, false, false]
  textRank = [
    'The Times Higher Education World University Rankings are the only global performance tables that judge research-intensive universities across all their core missions: teaching, research, knowledge transfer and international outlook. We use 13 carefully calibrated performance indicators to provide the most comprehensive and balanced comparisons, trusted by students, academics, university leaders, industry and governments. The performance indicators are grouped into five areas: teaching (the learning environment); research (volume, income and reputation); citations (research influence); international outlook (staff, students and research); and industry income (knowledge transfer).',
    'ARWU considers every university that has any Nobel Laureates, Fields Medalists, Highly Cited Researchers, or papers published in Nature or Science. In addition, universities with significant amount of papers indexed by Science Citation Index-Expanded (SCIE) and Social Science Citation Index (SSCI) are also included. In total, more than 1800 universities are actually ranked and the best 1000 are published.',
    'The QS World University Rankings continue to enjoy a remarkably consistent methodological framework, compiled using six simple metrics that we believe effectively capture university performance. Since faculty area normalization was introduced in 2015 to ensure that institutions specialising in Life Sciences and Natural Sciences were not unduly advantaged, we have avoided fundamental changes. In doing so, we aim to ensure that year-on-year comparisons remain valid, and that unnecessary volatility is minimized. Thus, universities continue to be evaluated according to the following six metrics: 1. Academic Reputation 2. Employer Reputation 3. Faculty/Student Ratio 4. Citations per faculty 5. International Faculty Ratio 6. International Student Ratio',
    'These institutions from the U.S. and more than 60 other countries have been ranked based on 13 indicators that measure their academic research performance and their global and regional reputations. Students can use these rankings to explore the higher education options that exist beyond their own countries\' borders and to compare key aspects of schools\' research missions. These are the world\'s top 1,250 universities.'
  ]

  constructor(private titleService: Title,
              private router: Router,
              public universityService: UniversityService,
              public publicationService: PublicationService,
              public newsService: NewsService,
              public sharedService: SharedService,
              public userService: UserService,
              public settingsService: SettingsService,
              public missionService: MissionService,
              public peopleService: PeopleService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<ImproveFormDialog>) {}

  ngOnInit() {
    this.titleService.setTitle(this.missionService.universityName + ' | Academig');

    if (this.missionService.universitySource) {
      const matches = this.missionService.universitySource.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i);
      this.sourceDomain = matches && matches[1];
    }

    if (this.missionService.universityId) {
      this.streamRetrieved = [false, false, false, false];

      if (this.missionService.universityPics) {
        this.missionService.universityPics.forEach((item, index) => {
          this.galleryImages.push({
            small: item.pic,
            medium: item.pic,
            big: item.pic
          })
        });
      }

      this.galleryOptionsSm = [
        {
          width: '100%',
          height: '500px',
          thumbnailsColumns: 4,
          imageAnimation: NgxGalleryAnimation.Slide
        },
        {
          breakpoint: 800,
          width: '100%',
          height: '300px',
          imagePercent: 80,
          thumbnailsPercent: 20,
          thumbnailsMargin: 20,
          thumbnailMargin: 20
        },
        {
          breakpoint: 400,
          preview: false,
        }
      ];

      this.galleryOptionsLg = [
        {
          width: '100%',
          height: '400px',
          thumbnailsColumns: 4,
          imageAnimation: NgxGalleryAnimation.Slide
        },
        {
          breakpoint: 800,
          width: '100%',
          height: '500px',
          imagePercent: 80,
          thumbnailsPercent: 20,
          thumbnailsMargin: 20,
          thumbnailMargin: 20
        },
        {
          breakpoint: 400,
          preview: false
        }
      ];

      this.updateDetails()
      this.updatePublications()
      this.updateNews()
      this.updatePeople()
    }
  }

  async updateDetails() {
    // this.departmentsItems = await this.universityService.getUnitsAndDepartments(this.missionService.universityId);
    this.items = await this.sharedService.getHomePage(this.missionService.universityId, 0);
    let m;
    const regex = /^.*?[\.!\?](?:\s|$)/;
    if ((m = regex.exec(this.missionService.universityDescription))!==null) this.shortDescription = m[0];
    this.streamRetrieved[0] = true;
  }

  async updatePublications() {
    this.publications = await this.publicationService.getPublications(13, this.missionService.universityId, 0);
    this.streamRetrieved[1] = true;
    this.publicationToggle = true;
    this.streamPublications = new Array(this.publications.length).fill(0);
    this.streamPublicationsFolder = new Array(this.publications.length).fill(0);
  }

  async updateNews() {
    const news = await this.newsService.getNews(100, 0, this.missionService.universityId);
    if (news) {
      this.newses.push.apply(this.newses, news);
      this.streamRetrieved[2] = true;
      if (this.newses[0]==undefined || this.newses[0]==null) this.newses = [];
    }
  }

  async updatePeople() {
    this.peoples = await this.peopleService.getPeoples(14, this.missionService.universityId, null, 0, 0, 0, null);
    this.peopleCount = Number(this.peoples[this.peoples.length - 1]);
    this.peoples.pop();
    this.streamPeople = new Array(this.peoples.length).fill(0);
    this.streamRetrieved[3] = true;
  }

  async locationOp(mode: number, flag: boolean, event) {
    this.locationBuildFlag = flag;
    if (mode == 2) {
      this.missionService.universityLocation = [event.lat, event.lng];
      this.missionService.universityCountry = event.country_id;
      this.missionService.universityState = event.state;
      this.missionService.universityCity = event.city;
      await this.sharedService.updateLocation(3, this.missionService.universityId, event.lat, event.lng, event.country_id, event.state, event.city);
    }
  }

  async twitterOp(mode: number, flag: boolean, event) {
    this.twitterBuildFlag = flag;
    if (mode == 2) {
      this.missionService.socialInfo.twitter = event.text;
      await this.sharedService.updateTwitter(3, this.missionService.universityId, event.text);
    }
  }

  onSearch(department: string) {
    this.userService.searchRefinements['departments'] = [department];
    this.userService.searchRefinements['universities'] = [this.missionService.universityName];
    this.router.navigate(['./search']);
  }

  imrpoveFunc() {
    this.DialogRef = this.dialog.open(ImproveFormDialog, {
      data: {
        title: 'title',
        journal: 'this.journal',
        date: 'this.date',
      }
    });

    const dialogSubmitSubscription = this.DialogRef.componentInstance.buttonFeedbackClick.subscribe(improve => {
      this.feedbackOp(improve[0], improve[1])
      dialogSubmitSubscription.unsubscribe();
      this.DialogRef.close();
    });
  }

  async feedbackOp(mode: number, message: string) {
    const plan = await this.sharedService.putLogging(0, this.missionService.universityId, message);
  }

  // async planUpdate() {
  //   const mode: number = 0; // User / Lab / Company / Department
  //   const type: number = 1; // Free / PRO / PRO+
  //   const period: number = 0; // Monthly / Yearly
  //
  //   const plan = await this.settingsService.postStripeSubscribe(mode, period, type, null, null);
  //
  //   stripe.redirectToCheckout({sessionId: plan.id}).then(function(result) {});
  // }

}
