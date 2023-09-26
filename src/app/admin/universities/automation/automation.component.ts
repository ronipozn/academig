import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';

import {SharedService} from '../../../shared/services/shared-service';
import {AdminService} from '../../../shared/services/admin-service';

@Component({
    selector: 'universities-automation',
    templateUrl: 'automation.html'
})
export class UniversityAutomationComponent {
  csvBuildFlag: boolean = false;
  streamRetrieved: boolean = false;

  files: string[] = [];
  statuses: number[] = [];
  current: number;

  schedules: any[] = [];

  constructor(private sharedService: SharedService,
              private adminService: AdminService) {
  }

  csvOp(mode: number, flag: boolean, filesEvent) {
    let status: number;

    this.csvBuildFlag = flag;

    if (mode == 2) {
      this.files = [];
      this.statuses = [];
      this.current = 0;

      const filesCount = filesEvent.substring(filesEvent.lastIndexOf("~") + 1,filesEvent.lastIndexOf("/"));
      // const filesCount = filesEvent[filesEvent.length - 2];

      for (let _i = 0; _i < filesCount; _i++) {
        this.files[_i] = filesEvent + 'nth/' + _i + '/';
      }

      this.files.push('empty');

      this.files.forEach((file, i) => {
        setTimeout(() => {
          if (i<filesCount) {
            this.uploadOp(file, i);
          }
          this.current = i;
        }, i * 1000);
      });
    }
  }

  async uploadOp(file: string, i: number) {
    const s: number = await this.sharedService.uploadCSV(file, null, null, null, 0);
    this.statuses[i] = s;
  }

}

// https://travishorn.com/delaying-foreach-iterations-2ebd4b29ad30
