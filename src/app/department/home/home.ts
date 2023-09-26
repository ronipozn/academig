import {Component, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../services/mission-service';
import {UserService} from '../../user/services/user-service';

import {Group, GroupService} from '../../shared/services/group-service';
import {People, PeopleService} from '../../shared/services/people-service';
import {Publication, PublicationService} from '../../shared/services/publication-service';
import {News, NewsService} from '../../shared/services/news-service';
import {objectMini, SharedService} from '../../shared/services/shared-service';
import {Gallery} from '../../shared/services/gallery-service';

import {itemsAnimation} from '../../shared/animations/index';

import {NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation} from 'ngx-gallery';

import {ImproveFormDialog} from '../../shared/modals/modal-improve/modal-improve';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'department-home',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class DepartmentHomeComponent implements OnInit {
  streamRetrieved: boolean[];
  groups: Group[] = [];

  items: any;

  shortDescription: string;

  streamFolder: number[];
  streamAdminFollow: number[][];
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

  typeNames = ['DEPARTMENT', 'PROGRAM', 'CENTER']

  constructor(public titleService: Title,
              public missionService: MissionService,
              public userService: UserService,
              public publicationService: PublicationService,
              public newsService: NewsService,
              public sharedService: SharedService,
              public groupService: GroupService,
              public peopleService: PeopleService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<ImproveFormDialog>) {}

  ngOnInit() {
    this.titleService.setTitle(this.missionService.departmentTitle + ' | Academig');

    if (this.missionService.departmentSource) {
      const matches = this.missionService.departmentSource.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i);
      this.sourceDomain = matches && matches[1];
    }

    if (this.missionService.departmentId) {
      this.streamRetrieved = [false, false, false, false];

      if (this.missionService.departmentPics) {
        this.missionService.departmentPics.forEach((item, index) => {
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
          preview: false
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
    this.items = await this.sharedService.getHomePage(this.missionService.departmentId, 1);
    let m;
    const regex = /^.*?[\.!\?](?:\s|$)/;
    if ((m = regex.exec(this.missionService.departmentDescription))!==null) this.shortDescription = m[0];
    this.streamRetrieved[0] = true;
  }

  async updatePublications() {
    this.publications = await this.publicationService.getPublications(11, this.missionService.departmentId, 0);
    this.streamRetrieved[1] = true;
    this.publicationToggle = true;
    this.streamPublications = new Array(this.publications.length).fill(0);
    this.streamPublicationsFolder = new Array(this.publications.length).fill(0);
  }

  async updateNews() {
    const news = await this.newsService.getNews(101, 0, this.missionService.departmentId);
    if (news) {
      this.newses = news;
      this.streamRetrieved[2] = true;
      if (this.newses[0]==undefined || this.newses[0]==null) this.newses = [];
      // this.newOffset = this.offset;
    }
  }

  async updatePeople() {
    this.peoples = await this.peopleService.getPeoples(12, this.missionService.departmentId, null, 0, 0, 0, null);
    this.peopleCount = Number(this.peoples[this.peoples.length - 1]);
    this.peoples.pop();
    this.streamPeople = new Array(this.peoples.length).fill(0);
    this.streamRetrieved[3] = true;
  }

  async locationOp(mode: number, flag: boolean, event) {
    this.locationBuildFlag = flag;

    if (mode == 2) {
      this.missionService.departmentLocation = [event.lat, event.lng];
      this.missionService.departmentCountry = event.country_id;
      this.missionService.departmentState = event.state;
      this.missionService.departmentCity = event.city;

      await this.sharedService.updateLocation(2, this.missionService.departmentId, event.lat, event.lng, event.country_id, event.state, event.city);
    }
  }

  async twitterOp(mode: number, flag: boolean, event) {
    this.twitterBuildFlag = flag;

    if (mode == 2) {
      this.missionService.socialInfo.twitter = event.text;

      await this.sharedService.updateTwitter(2, this.missionService.departmentId, event.text);
    }
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
    const plan = await this.sharedService.putLogging(1, this.missionService.departmentId, message);
  }
}
