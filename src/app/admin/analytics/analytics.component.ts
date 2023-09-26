import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';

import * as moment from 'moment';

import * as Chartist from 'chartist';

import {PublicationMarketing, PeopleAdmin, GroupApprove, AdminService} from '../../shared/services/admin-service';

@Component({
    selector: 'analytics',
    templateUrl: 'analytics.html',
    styleUrls: ['analytics.css'],
})
export class AnalyticsComponent {
  streamLabs: boolean;
  streamUsers: boolean;
  streamInvites: boolean;
  streamPublications: boolean;

  mainFunnel: string[] = ['ACQUISITION', 'ACTIVATION', 'RETENTION', 'REVENUE', 'REFERRAL'];
  subFunnel: string[] = [
                          'UVP (Landing Page)', 'Features Page', 'About Us', 'Pricing Page', 'Click Sign Up',
                          'Sign Up', 'Additional Steps', 'Key Activity',
                          'Key Activity 1', 'Key Activity 2',
                          'Upgrade 1', 'Upgrade 2',
                          'Referral 1', 'Referral 2',
                        ];
  subSteps: number[] = [4, 7, 9, 11, 13];

  // acquisition: 5 cells
  // activation: 3 cells
  // retention: 2 cells
  // revenue: 2 cells
  // referral: 2 cells

  subData: number[][] = [
             [250, 180, 140, 100, 80,     60, 45, 30,        15, 12,      10, 9,       8, 5],    // JUN 1
             [100, 78, 65, 60, 58,        40, 30, 15,        12, 11,      8, 6,        3, 2],    // JUN 8
             [700, 550, 512, 476, 430,    350, 322, 301,     276, 234,    155, 121,    101, 86], // JUN 15
             [275, 270, 260, 210, 200,    187, 175, 164,     143, 121,    98, 76,      65, 34],  // JUN 22
            ];

  subDataPercent: number[][];
  mainData: number[][];
  mainDataPercent: number[][];

  publications: PublicationMarketing[];
  adminsInvitesCounts: number[] = [];

  users: PeopleAdmin[];

  groups: GroupApprove[];
  groupStats: number[][];
  groupTypes: string[] = [
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

  public lineChartLabels:Array<any> = [];
  public lineChartData:Array<any> = [];

  public lineUsersDailyLabels:Array<any> = [];
  public lineUsersDailyData:Array<any> = [];

  public linePublicationsLabels:Array<any> = [];
  public linePublicationsData:Array<any> = [];

  public lineDailyData:Array<any> = [];

  public lineChartOptions:any = { responsive: true };
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';
  public lineChartColors:Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
  ];

  constructor(private titleService: Title,
              private adminService: AdminService) {
    this.titleService.setTitle('Admin Analytics - Academig');
  }

  ngOnInit() {
    // this.mainData = Array(4).fill(0).map(x => Array(5).fill(0));
    // this.mainDataPercent = Array(4).fill(0).map(x => Array(5).fill(0));
    // this.subDataPercent = Array(4).fill(0).map(x => Array(14).fill(0));

    // for (let _i = 0; _i < 4; _i++) {
    //
    //   for (let _j = 0; _j < 5; _j++) {
    //     this.mainData[_i][_j] = this.subData[_i][this.subSteps[_j]];
    //     this.mainDataPercent[_i][_j] = Math.round(this.subData[_i][this.subSteps[_j]] / this.subData[_i][0] * 100);
    //   }
    //
    //   for (let _j = 0; _j < 14; _j++) {
    //     this.subDataPercent[_i][_j] = _j ?
    //       Math.round(this.subData[_i][_j] / this.subData[_i][_j - 1] * 100) : 100;
    //   }
    //
    // }
  }

  async updateLabsList() {
    this.streamLabs = false;
    this.groups = await this.adminService.getGroups(0);
    this.groupStats = Array(this.groupTypes.length).fill(0).map(() => new Array(5).fill(0));
    var groupsIndex: GroupApprove[];
    this.groupTypes.forEach((title, index) => {
      groupsIndex = this.groups.filter(r=>r.onBehalf==index);
      this.groupStats[index][0] = groupsIndex.length;
      this.groupStats[index][1] = groupsIndex.filter(r=>r.stage==-1).length;
      this.groupStats[index][2] = groupsIndex.filter(r=>r.stage==1).length;
      this.groupStats[index][3] = groupsIndex.filter(r=>r.stage==2).length;
      this.groupStats[index][4] = groupsIndex.filter(r=>(r.interview && r.interview.status==true)).length;
      this.groupStats[index][5] = groupsIndex.filter(r=>r.buildPro==1).length;
      this.groupStats[index][6] = groupsIndex.filter(r=>r.buildPro==2).length;
      this.groupStats[index][7] = groupsIndex.filter(r=>(r.papersKit && r.papersKit.status==true)).length;
    });
    // https://stackoverflow.com/questions/38720885/find-the-sum-of-each-row-as-well-as-that-of-each-column-in-2-dimensional-matrix
    // var rowSum = this.groupStats.map(r => r.reduce((a, b) => a + b)); // sums of rows
    var colSum: number[] = this.groupStats.reduce((a, b) => a.map((x, i) => x + b[i])); // sums of columns
    this.groupStats[10] = colSum;
    this.groupTypes.push("Sum")
    this.streamLabs = true;
  }

  async updateUsersList() {
    this.streamUsers = false;
    this.users = await this.adminService.getPeoples(-1, false, false, false, false, false, false, false);

    const dates = this.users.map(r => r.date).sort();
    const growth = this.calcUsersGrowth(dates);
    const daily = this.calcUsersDaily(dates);

    this.lineChartLabels = growth[0];
    this.lineChartData = [{data: growth[1], label: 'Users'}];

    this.lineUsersDailyLabels = daily[0];
    this.lineUsersDailyData = [{data: daily[1], label: 'Users Daily'}];

    this.streamUsers = true;
  }

  async updatePublicationsList() {
    this.streamPublications = false;
    this.publications = await this.adminService.getPublications(null, 1);
    var authors = this.publications.map(r => r.authors);
    // var reInvites: number[];

    authors.forEach((singePublicationAuthors, index) => {
      this.adminsInvitesCounts[index]=singePublicationAuthors ? singePublicationAuthors.filter(r => r.email).length : 0;
    });

    var dates0 = this.publications.map(r => r.dates[0]).sort();
    var growth0 = this.calcPublicationsGrowth(dates0, this.adminsInvitesCounts);

    var dates1 = this.publications.map(r => r.dates[1]).sort();
    var growth1 = this.calcPublicationsGrowth(dates1, this.adminsInvitesCounts);

    var dates2 = this.publications.map(r => r.dates[2]).sort();
    var growth2 = this.calcPublicationsGrowth(dates2, this.adminsInvitesCounts);

    this.linePublicationsLabels = growth0[0];
    this.linePublicationsData = [
      {data: growth0[1], label: 'Publications'},
      {data: growth0[2], label: 'Invites'},
      {data: growth1[2], label: 'Re Invites'},
      {data: growth2[2], label: 'Last Invites'}
    ];

    this.streamPublications = true;

    // this.inviteCount = [].concat(...authors).filter(r => r.email).length;
    // this.usersCount = [].concat(...authors).filter(r => r.pic).length;
    //
    // reInvites = [].concat(...authors).filter(r=>r.dates).map(r => (3-(r.dates ? r.dates.length : 3)));
    // if (reInvites[0]!=null) this.reInviteCount = reInvites.reduce((x, y) => x + y);
    //
    // this.updateAdmins();
  }

  // https://valor-software.com/ng2-charts/
  // https://stackoverflow.com/questions/47811098/charts-in-angular-2
  calcUsersGrowth(dates: Date[]): [string[], number[]] {
    var a = [], b = [], prev, mm, ww, pp = 0; //1;

    for (let _i = 0; _i < dates.length; _i++) {
      mm = moment(dates[_i]).week();
      if (mm !== prev) {
        // a.push(moment(dates[_i]).format("MM YY"));
        a.push(moment(dates[_i]).format("YYYY-MM-DD"));
        pp++;
        b.push(pp);
      } else {
        b[b.length-1]++;
        pp=b[b.length-1];
      }
      prev = mm;
    }

    return [a, b];
  }

  calcUsersDaily(dates: Date[]): [string[], number[]] {
    var a = [], b = [], prev, mm, ww, pp = 0; //1;

    for (let _i = 0; _i < dates.length; _i++) {
      mm = moment(dates[_i]).day();
      if (mm !== prev) {
        a.push(moment(dates[_i]).format("YYYY-MM-DD"));
        pp++;
        b.push(pp);
        b[b.length-1]=0;
      } else {
        b[b.length-1]++;
        pp=b[b.length-1];
      }
      prev = mm;
    }

    return [a, b];
  }

  calcPublicationsGrowth(dates: Date[], invites: number[]): [string[], number[], number[]] {
    var a = [], b = [], c = [], prev, ww, pp = 1, ii = invites[0];

    var sum = invites.reduce((a, b) => a + b, 0);

    for (let _i = 0; _i < dates.length; _i++) {
      ww = moment(dates[_i],"YYYY-MM-DD").day();
      if ( ww !== prev ) {
        a.push(moment(dates[_i],"YYYY-MM-DD").format("DD MM YYYY"));

        pp++;
        b.push(pp);

        ii=ii+(invites[_i] ? invites[_i] : 0);
        c.push(ii);

      } else {

        b[b.length-1]++;
        pp=b[b.length-1];
        // pp=b[b.length-1] + 1;

        c[c.length-1]+=(invites[_i] ? invites[_i] : 0);
        ii=c[c.length-1];
        // ii=c[c.length-1] + (invites[_i+1] ? invites[_i+1] : 0);
      }
      prev = ww;
    }

    return [a, b, c];
  }

  calcRatio() {
    const users = this.lineChartData[0].data;
    const invites = this.linePublicationsData[1].data;

    this.streamInvites = false;

    var usersSub: number[] = [];
    var invitesSub: number[] = [];

    for (let _i = 1; _i < this.lineChartLabels.length-1; _i++) {
      usersSub[_i]= users[_i]-users[_i-1];
      invitesSub[_i]= invites[_i]-invites[_i-1];
    }

    // this.linePublicationsLabels = growth[0];
    this.lineDailyData = [
      {data: usersSub, label: 'Users Daily'},
      {data: invitesSub, label: 'Invites Daily'}
      // {data: sub, label: 'Sub'}
    ];

    this.streamInvites=true;
  }

  chartHovered() {}

  chartClicked() {}
}
