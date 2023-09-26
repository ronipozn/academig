import {Component, Input, OnInit} from '@angular/core';

import {UserService} from '../../user/services/user-service';
import {SettingsService} from '../../shared/services/settings-service';
import {PeopleService} from '../../shared/services/people-service';
import {Report} from '../../shared/services/settings-service';

import {objectMini} from '../../shared/services/shared-service';

@Component({
  selector: 'settings-report',
  templateUrl: 'report.html',
  styleUrls: ['report.css']
})
export class ReportComponent implements OnInit {
  streamRetrieved: boolean[] = [false, false];

  reports: Report[];
  blocks: objectMini[];

  type: string[] = ['Unspam', 'Unfake', 'Unoffensive']
  reportMode: string[] = ['User', 'Group', 'Publication', 'Resource', 'Project', 'Position']

  constructor(public userService: UserService,
              public peopleService: PeopleService,
              public settingsService: SettingsService) {}

  async ngOnInit() {
    this.reports = await this.settingsService.getUserReports();
    this.streamRetrieved[0] = true

    this.blocks = await this.settingsService.getUserBlocks();
    this.streamRetrieved[1] = true
  }

  async reportFunc(i: number) {
    await this.settingsService.deleteReport(this.reports[i]._id);
    this.reports.splice(i, 1);
  }

  async blockFunc(i: number) {
    await this.peopleService.toggleBlock(this.blocks[i]._id, false);
    this.blocks.splice(i, 1);
  }

}
