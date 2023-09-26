import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {UserService} from '../../../user/services/user-service';
import {PublicationMarketing, PeopleAdmin, AdminService} from '../../../shared/services/admin-service';

import {AuthService} from '../../../auth/auth.service';

import * as moment from 'moment';

@Component({
    selector: 'peoples',
    templateUrl: 'peoples.html'
})
export class PeoplesComponent implements OnInit {
  streamRetrieved: boolean[];

  stageText: string[] = ["non-user", "not verified", "verified"];

  peoples: PeopleAdmin[] = [];
  userId: string;

  count = 0;
  more = 0;
  moreFlag = false;

  streamMore: boolean;
  adminFlag: boolean = false;
  alumniFlag: boolean = false;

  verifiedFlag: boolean = false;
  challengesFlag: boolean = false;
  librariesFlag: boolean = false;
  domainsFlag: boolean = false;
  followingsFlag: boolean = false;
  updatesFlag: boolean = false;
  suggestionsFlag: boolean = false;

  tasks: string[] = ['Profile picture',
                     'Research Interests',
                     'About Me',
                     'Positions and Education',
                     'Cover Picture',
                     'Pesonal Website Flow',

                     'Publications',
                     'News',
                     'Follow',

                     'Resource',
                     'Project',
                     'Funding',
                     'Teaching',
                     'Gallery',

                     'Talk',
                     'Poster',
                     'Press'
                    ];

  constructor(private titleService: Title,
              private adminService: AdminService,
              private userService: UserService,
              private authService: AuthService) {
    this.titleService.setTitle('Admin People | Academig');
    this.userId = this.userService.userId;
  }

  ngOnInit() {
    this.streamRetrieved = [false, false, false, false, false];
    this.findPeoples();
    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:groups']);
    });
  }

  updateList() {
    this.more = 0;
    this.peoples = [];
    this.streamRetrieved[0] = false;
    this.streamMore = false;
    this.findPeoples();
  }

  showMoreFunc() {
    this.more += 1;
    this.streamMore = false;
    this.findPeoples();
  }

  async findPeoples() {
    const peoples = await this.adminService.getPeoples(this.more, this.verifiedFlag, this.challengesFlag, this.librariesFlag, this.domainsFlag, this.followingsFlag, this.updatesFlag, this.suggestionsFlag);
    this.peoples.push.apply(this.peoples, peoples);
    this.count = Number(this.peoples[this.peoples.length - 1]);
    this.peoples.pop();

    if (this.challengesFlag) this.peoples = this.peoples.filter(l => (l.challenge && l.challenge['2020']>0)); // || l.library

    this.moreFlag = this.count > ((this.more + 1) * 10);
    this.streamMore = true;
    this.streamRetrieved = [true, true, true, true, true];
  }

  async postProgressById(peopleId: string) {
    this.streamRetrieved[3] = false;
    await this.adminService.postProgressById(peopleId);
    this.streamRetrieved[3] = true;
  }

  async newsUpdates(peopleId: string) {
    this.streamRetrieved[4] = false;
    await this.adminService.newsUpdatesById(peopleId);
    this.streamRetrieved[4] = true;
  }

  public chartClicked(e:any):void {
    // console.log(e);
  }

  public chartHovered(e:any):void {
    // console.log(e);
  }

  // PeopleExtractEmailComponent
  // async findPeoples() {
  //   this.peoples = await this.adminService.getPeoples(-1, this.verifiedFlag);
  //   this.count = Number(this.peoples[this.peoples.length - 1]);
  //   this.peoples.pop();
  //   this.streamRetrieved = [true];
  // }
  // <ng-container *ngIf="streamRetrieved[0]">
  //   <table class="table">
  //     <thead>
  //       <tr>
  //         <th scope="col">Name</th>
  //         <th scope="col">Email</th>
  //       </tr>
  //     </thead>
  //     <tbody *ngFor="let people of peoples; let i=index;">
  //       <tr *ngIf="people.stage==2 && (people.subscribe && people.progress[5] ? people.subscribe[0] : true)">
  //         <td>{{people.name}}</td>
  //         <td>{{people.personalInfo.email}}</td>
  //       </tr>
  //     </tbody>
  //   </table>
  // </ng-container>
}
