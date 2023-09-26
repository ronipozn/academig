import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {UserService} from '../../../user/services/user-service';
import {AdminService} from '../../../shared/services/admin-service';
import {SettingsService} from '../../../shared/services/settings-service';
import {Report} from '../../../shared/services/settings-service';

@Component({
    selector: 'reports',
    templateUrl: 'reports.html'
})
export class ReportsComponent implements OnInit {
  streamRetrieved: boolean[] = [false, false];

  reports: Report[];

  type: string[] = ['Spam', 'Fake', 'Offensive']
  reportMode: string[] = ['Group', 'User', 'Publication', 'Resource', 'Project', 'Position']

  btnsNames = ['Approve', 'Decline'];

  reportIndex: number;
  reportAction: number;
  reportBuildFlag = false;

  constructor(private titleService: Title,
              private userService: UserService,
              private adminService: AdminService,
              private settingsService: SettingsService) {
    this.titleService.setTitle('Admin Reports - Academig');
  }

  ngOnInit() {
    this.updateList();
  }

  async updateList() {
    this.reports = await this.adminService.getReports();
    this.streamRetrieved[0] = true;
  }

  async sendRepsonse(event) {
    this.reportBuildFlag = false;
    this.streamRetrieved[1] = true;

    await this.settingsService.postReport(this.reports[this.reportIndex]._id, event.text, this.reportAction + 1);
    this.streamRetrieved[1] = false;
  }

  setActiveIndex(i: number, j: number, flag: boolean) {
    this.reportIndex = i;
    this.reportAction = j;
    this.reportBuildFlag = flag;
  }

}
