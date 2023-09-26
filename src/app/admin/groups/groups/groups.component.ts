import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {FormGroup, FormControl, Validators} from '@angular/forms';

import {UserService} from '../../../user/services/user-service';
import {MarketingItem, AdminApprove, GroupApprove, AdminService} from '../../../shared/services/admin-service';
import {AuthService} from '../../../auth/auth.service';
import {PeopleSendgrid} from '../../../shared/services/people-service';

import {complexName} from '../../../shared/services/shared-service';

// import * as Chartist from 'chartist';

@Component({
  selector: 'groups',
  templateUrl: 'groups.html'
})
export class GroupsComponent implements OnInit {
  formModel: FormGroup;

  more: number;

  streamRetrieved: boolean[];

  streamMarketingRetrieved: boolean[];
  marketingBuildFlag: boolean;
  marketingIndex: number;
  marketingItem: MarketingItem;

  activeIndex: number;
  activeAction: number;

  groups: GroupApprove[];
  groupsToggle: GroupApprove[];
  peoples: PeopleSendgrid[] = [];

  stats: number[][];

  btnsNames = ['Build', 'Approve', 'Improve', 'On Hold', 'Decline', 'Delete', 'Off Hold', 'Institute', 'Notes'];
  resNums = [2, 2, 7, 9, 8, 6, 2];

  adminBuildFlag: boolean = false;
  adminChangeFlag: boolean = false;
  adminFlag: boolean = false;
  stripeIdFlag: boolean = false;

  onbehalfFlags: number[] = [];
  stagesFlags: number[] = [];

  onbehalf: string[] = [
    'Lab PI (New)',
    'Lab PI (From Position)',
    'Lab OnBehalf (New)',
    'Lab OnBehalf (From Position)',
    'Company (New)',
    'Company (From Position)',
    'Marketing - Lab',
    'Marketing - Company',
    'Job Posting PI (New)',
    'Job Posting OnBehalf (New)'
  ]

  stages: string[] = [
    'Build for me', // -1
    'Initial', // 0
    'Under review', // 1
    'Published', // 2
    'On hold', // 3
    'null', // 4
    'From scratch', // 5
    'Delete', // 6
    'Improve (Academig)', // 7
    'Decline (Academig)', // 8
    'On hold (Academig)', // 9
  ]

  tasks: string[] = [
    'Cover Photo',
    'Background Text',
    'Quote',
    'Research Interests',
    'People',
    'Publications',
    'Services Background',
    'Services',
    'Projects Background',
    'Projects Layman',
    'Projects',
    'How to collaborate with us',
    'Collaboration',
    'Funding',
    'Why Join',
    'About Diversity',
    'Position', //
    'Talk',
    'Poster',
    'Press',
    'Question',
    'Find Us',
    'Contact',
    'Followings',
    'Meetings',
    'Reports',
    'News',
    'Events'
  ];

  @ViewChild('toggleSendgridModal', { static: true }) toggleSendgrid: ElementRef;

  constructor(private titleService: Title,
              private adminService: AdminService,
              private userService: UserService,
              private authService: AuthService) {
    this.titleService.setTitle('Admin Labs Approve - Academig');
    this.streamRetrieved = [false, true, false, true, true];
  }

  ngOnInit() {
    this.updateList();

    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:groups']);
    });

    // const dataPreferences = {
    //   labels: ['62%', '32%', '6%'],
    //   series: [62, 32, 6]
    // };
    //
    // const optionsPreferences = {
    //   height: '230px'
    // };
    //
    // new Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);
  }

  stripeidToggle() {
    this.stripeIdFlag = !this.stripeIdFlag;
    this.updateList(true);
  }

  typeToggle(i: number, value: boolean) {
    if (value) this.onbehalfFlags.push(i); else this.onbehalfFlags = this.onbehalfFlags.filter(f => f!=i);
    this.updateToggle();
  }

  stageToggle(i: number, value: boolean) {
    if (value) this.stagesFlags.push(i-1); else this.stagesFlags = this.stagesFlags.filter(f => f!=(i-1));
    this.updateToggle()
  }

  async postProgress() {
    this.streamRetrieved[2] = false;
    await this.adminService.postProgress();
    this.streamRetrieved[2] = true;
  }

  async sendRepsonse(newStage: number, event) {
    var university: complexName;
    var department: complexName;

    const groupId: string = this.groupsToggle[this.activeIndex].groupIndex.group._id;
    const currentStage: number = this.groupsToggle[this.activeIndex].stage;

    if (this.activeAction==7) {
      this.adminChangeFlag = false;
      university = event.university;
      department = event.department;
    } else {
      this.adminBuildFlag = false;
      university = this.groupsToggle[this.activeIndex].groupIndex.university;
      department = this.groupsToggle[this.activeIndex].groupIndex.department;
    }

    const adminApprove: AdminApprove = {
      currentStage: currentStage,
      newStage: newStage,
      text: event.text,
      department: department,
      university: university
    };

    this.streamRetrieved[1] = false;

    if (this.activeAction==7) {
      await this.adminService.postGroupInstitute(groupId, adminApprove);
    } else {
      await this.adminService.postGroupStage(groupId, adminApprove);
    }

    this.streamRetrieved[1] = true;
    this.updateList(true);
  }

  async emailsStats(i: number) {
    const groupId: string = this.groupsToggle[i].groupIndex.group._id;
    this.activeIndex = i;
    this.streamRetrieved[4] = false;
    const groups = await this.adminService.getEmailsStats(groupId);
    // this.groupsToggle = groups;
    this.streamRetrieved[4] = true;
    this.toggleSendgrid.nativeElement.click();
  }

  async setStripeIndex(i: number) {
    const groupId: string = this.groupsToggle[i].groupIndex.group._id;
    this.activeIndex = i;
    this.streamRetrieved[3] = false;
    const stripe = await this.adminService.postGroupStripe(groupId);
    this.streamRetrieved[3] = true;
  }

  setActiveIndex(i: number, j: number, flag: boolean, mode: number = 0) {
    this.activeIndex = i;
    this.activeAction = j;
    if (mode == 0) {
      this.adminBuildFlag = flag;
    } else {
      this.adminChangeFlag = flag;
    };
  }

  async updateList(toggle: boolean = false) {
    this.marketingIndex = 0;
    this.streamRetrieved[0] = false;
    this.groups = await this.adminService.getGroups(this.stripeIdFlag ? 1 : 0);

    this.stats = Array(this.onbehalf.length).fill(0).map(() => new Array(5).fill(0));

    this.onbehalf.forEach((title, index) => {
      this.stats[index][0] = this.groups.filter(r=>r.onBehalf==index).length;
    });

    console.log('qqq',this.stats)

    // console.log('this.groups',this.groups.filter(r=>r.onBehalf==0).length)

    this.streamMarketingRetrieved = new Array(this.groups.length).fill(true);
    if (toggle) this.updateToggle();
    this.streamRetrieved[0] = true;
  }

  updateToggle() {
    this.more = 1;
    this.groupsToggle = this.groups.filter(
      group => (
        this.stagesFlags.includes(group.stage) &&
        this.onbehalfFlags.includes(group.onBehalf)
      )
    ).reverse();
  }

  showMoreFunc() {
    this.more+=1;
  }

  marketingSlide(i: number, flag: boolean) {
    this.marketingIndex = i;
    this.marketingBuildFlag = flag;
  }

  async marketingUpdate(event) {
    this.streamMarketingRetrieved[this.marketingIndex] = false;
    const groupId: string = this.groupsToggle[this.marketingIndex].groupIndex.group._id;
    await this.adminService.postMarketing(groupId, event.text, 1);
    this.marketingBuildFlag = false;
    if (this.groupsToggle[this.marketingIndex].marketing) {
      this.groupsToggle[this.marketingIndex].marketing.counter+=1;
      this.groupsToggle[this.marketingIndex].marketing.dates.push(new Date());
      this.groupsToggle[this.marketingIndex].marketing.user.push(this.userService.userId);
    } else {
      this.groupsToggle[this.marketingIndex].marketing = {counter: 1, url: null, text: event.text, pics: null, dates: [new Date()], user: [this.userService.userId]};
    }
    this.streamMarketingRetrieved[this.marketingIndex] = true;
  }

}

// <h5>Some improvments are needed before making your site public. Please make the following changes:</h5>
// Please send us a message to tell us why we are wrong.
// We are going to delete your lab profile because:
// We put your site on hold because:
