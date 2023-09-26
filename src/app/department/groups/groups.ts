import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

import {MissionService} from '../services/mission-service';
import {SharedService} from '../../shared/services/shared-service';
import {UserService} from '../../user/services/user-service';

import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'department-groups',
  templateUrl: 'groups.html',
  styleUrls: ['groups.css']
})
export class DepartmentGroupsComponent implements OnInit {
  streamRetrieved = false;

  adminFlag: boolean = false;

  csvBuildFlag: boolean = false;
  streamCsv: number;

  constructor(public titleService: Title,
              private sharedService: SharedService,
              public missionService: MissionService,
              public userService: UserService,
              public authService: AuthService,
              private _router: Router) {
  }

  ngOnInit() {
    if (this.missionService.departmentId) {
      this.titleService.setTitle('Home - ' + this.missionService.departmentTitle + ' | Academig');
      this.authService.token.subscribe(token => this.adminFlag = this.authService.userHasScopes(token, ['write:groups']));
    }
  }

  buildWebsiteFunc() {
    this.userService.buildMarketingWebsiteFlag = true;

    const departmentName: string = this.missionService.departmentIndex.department.name;
    const universityName: string = this.missionService.departmentIndex.university.name;

    const group =
      {'group': {"_id": null, "name": null, "pic": null, "link": null},
       'department': {"_id": null, "name": departmentName, "pic": null, "link": departmentName.replace(/ /g,"_").toLowerCase()},
       'university': {"_id": null, "name": universityName, "pic": null, "link": universityName.replace(/ /g,"_").toLowerCase()}
      };

    this.userService.buildPositionWebsite = {
      group: group,
      period: null,
      titles: null,
    };

    this._router.navigate(['/build']);
  }

  async csvOp(mode: number, flag: boolean, file) {
    const departmentName: string = this.missionService.departmentIndex.department.name;
    const universityName: string = this.missionService.departmentIndex.university.name;

    this.csvBuildFlag = flag;

    if (mode == 2) {
      this.streamCsv = 3;
      await this.sharedService.uploadCSV(file, null, universityName, departmentName, 2);
      this.streamCsv = 1;
    }
  }

  streamCsvFunc() {
    this.streamCsv = 0;
  }

}
