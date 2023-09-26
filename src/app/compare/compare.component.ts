import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';

import {GroupSize, GroupCompare, GroupService} from '../shared/services/group-service';
import {groupComplex} from '../shared/services/shared-service';
import {titlesTypes, PeopleService} from '../shared/services/people-service';
import {UserService} from '../user/services/user-service';
import {AuthService} from '../auth/auth.service';

import {NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation} from 'ngx-gallery';

// import {People, } from '../../shared/services/people-service';

import {itemsAnimation} from '../shared/animations/index';

import * as Chartist from 'chartist';

declare const $: any;

@Component({
    selector: 'compare',
    templateUrl: 'compare.html',
    styleUrls: ['compare.css'],
    animations: [itemsAnimation],
    host: { '[@itemsAnimation]': '' }
})
export class CompareComponent implements OnInit {
  isAuthenticated: boolean = false;
  streamRetrieved: boolean = false;

  otherThanNull: boolean;

  groups: GroupCompare[] = [];
  groupsIndex: groupComplex[] = [];

  streamFollow: number[];

  titlesCountsMembers: number[][];
  titlesCountsAlumni: number[][];

  titlesSelect = titlesTypes;

  colorPallete: string = 'cdcdc1';
  acronym: string;

  shareFlag: boolean = false;
  reportFlag: boolean = false;
  action: string;
  activeIndex: number;

  relationsFlag: boolean[] = [];
  intrestsFlag: boolean[] = [];
  journalsFlag: boolean[] = [];

  galleryOptionsSm: NgxGalleryOptions[];
  galleriesImages: NgxGalleryImage[][] = [[]];

  // socialTypes: string[]  = ['linkedin','twitter','google','orcid','github','researchgate','facebook']
  // socialIcons: string[]  = ['fa fa-linkedin','fa fa-twitter','ai ai-google-scholar-square','ai ai-orcid','fa fa-github','ai ai-researchgate','fa fa-facebook']
  // socialSites: string[]  = ['www.linkedin.com/in/','www.twitter.com/','scholar.google.com/citations?user=','orcid.org/','github.com/','www.researchgate.net/profile/','www.facebook.com/']

  sizes: string[] = [];
  groupSize = GroupSize;

  @ViewChild('toggleShareModal', { static: false }) toggleShare: ElementRef;
  @ViewChild('toggleReportModal', { static: false }) toggleReport: ElementRef;
  @ViewChild('toggleSignUpModal', { static: false }) toggleSignUp: ElementRef;

  constructor(private groupService: GroupService,
              private peopleService: PeopleService,
              private userService: UserService,
              private titleService: Title,
              private authService: AuthService) {
    this.titleService.setTitle('Compare Labs | Academig');
  }

  async ngOnInit() {
    this.galleryOptionsSm = [
      {
        width: '100%',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide
      },
      {
        breakpoint: 800,
        width: '100%',
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

    this.authService.isAuthenticated.subscribe(value => {
      this.isAuthenticated = value
    });

    this.updatePage()
  }

  async updatePage() {
    this.streamRetrieved = false;

    this.groups = await this.groupService.getGroupsCompare(this.userService.userCompareGroups.map(r => r.groupIndex.group._id));

    this.streamRetrieved = true;
    this.streamFollow = new Array(this.groups.length).fill(0);
    this.intrestsFlag = new Array(this.groups.length).fill(false);
    this.journalsFlag = new Array(this.groups.length).fill(false);

    let title: number;
    let alumniFlag: boolean;
    const that = this;

    this.groupsIndex = this.groups.map(r => r.groupIndex);

    this.titlesCountsMembers = Array(this.groups.length).fill(0).map(() => new Array(5).fill(0));
    this.titlesCountsAlumni = Array(this.groups.length).fill(0).map(() => new Array(5).fill(0));

    this.groups.map(function(g, index) {

      //   this.acronym = this.group.groupIndex.group.name.match(/\b(\w)/g).join('').substring(0, 2).toUpperCase();

      that.relationsFlag[index] = that.userService.userPositions.findIndex(r => r.group.group._id==g.groupIndex.group._id)>-1;

      that.galleriesImages[index] = [];

      g.galleries.forEach((item) => {
        that.galleriesImages[index].push({
          small: item.pic,
          medium: item.pic,
          big: item.pic
        })
      });

      if (g.size) {
        that.sizes[index] = that.groupSize[that.groupSize.findIndex(y => y.id == g.size)].name;
        // this.labFlag ? lab : this.companySize[this.companySize.findIndex(y => y.id == this.items.size)].name;
      }

      g.peoples.map(function(p) {
        title = p.positions[0].titles[0];
        alumniFlag = p.positions[0].period.mode==0;
        switch (true) {
          case (title < 200): // Staff
            if (alumniFlag) that.titlesCountsAlumni[index][0]++; else that.titlesCountsMembers[index][0]++; break;
          case (title < 300): // Postdoc
            if (alumniFlag) that.titlesCountsAlumni[index][1]++; else that.titlesCountsMembers[index][1]++; break;
          case (title == 301): // Phd
            if (alumniFlag) that.titlesCountsAlumni[index][2]++; else that.titlesCountsMembers[index][2]++; break;
          case (title == 300): // Msc
            if (alumniFlag) that.titlesCountsAlumni[index][3]++; else that.titlesCountsMembers[index][3]++; break;
          case (title < 500): // Undergraduate
            if (alumniFlag) that.titlesCountsAlumni[index][4]++; else that.titlesCountsMembers[index][4]++; break;
          default:
            break;
        }
      })
    })

    // https://stackoverflow.com/questions/14723848/push-multiple-elements-to-array
    // this.groups.push.apply(this.groups, new Array(3-this.groups.length).fill(null));

    this.otherThanNull = this.groups.some(function (el) {
      return el !== null;
    });

  }

  async groupFollow(i: number) {
    let itemId: string;
    let toFollow: boolean;

    if (this.userService.userEmailVerified) {

      toFollow = !this.groups[i].followStatus;
      itemId = this.groups[i]._id;
      this.streamFollow[i] = 3;

      await this.peopleService.toggleFollow(4, 0, itemId, toFollow);
      this.userService.toggleFollow(toFollow, itemId, "group");
      this.streamFollow[i] = 0;
      this.groups[i].followStatus = toFollow;

    } else {

      this.action = "follow";
      this.toggleSignUp.nativeElement.click();

    }

  }

  async unGroupCompare(i: number) {
    const itemId: string = this.groups[i]._id;

    if (this.isAuthenticated) {

      const index =  this.userService.userCompareGroups.map(r => r.groupIndex.group._id).indexOf(itemId);
      if (index > -1) this.userService.userCompareGroups.splice(index, 1);

      await this.peopleService.toggleFollow(12, 0, itemId, false);

    } else {

      this.userService.userCompareGroups.splice(i, 1);

    }

    this.groups.splice(i, 1);

    this.groups.push.apply(this.groups, new Array(3-this.groups.length).fill(null));

    this.otherThanNull = this.groups.some(function (el) {
      return el !== null;
    });
  }

  openShareModalFunc(i: number) {
    if (this.userService.userEmailVerified) {
      this.shareFlag = true;
      this.activeIndex = i;
      this.toggleShare.nativeElement.click();
    } else {
      this.action = "share";
      this.toggleSignUp.nativeElement.click();
    }
  }

  closeShareModalFunc() {
    this.toggleShare.nativeElement.click();
    this.shareFlag = false;
  }

  openReportModalFunc(i: number) {
    if (this.userService.userEmailVerified) {
      this.reportFlag = true;
      this.activeIndex = i;
      this.toggleReport.nativeElement.click();
    } else {
      this.action = "report";
      this.toggleSignUp.nativeElement.click();
    }
  }

  closeReportModalFunc() {
    this.toggleReport.nativeElement.click();
    this.reportFlag = false;
  }

}
