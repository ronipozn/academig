import {Component, Input, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {Group, GroupService} from '../../../shared/services/group-service';
import {DepartmentService} from '../../../shared/services/department-service';
import {MissionService} from '../../services/mission-service';

import {objectMini} from '../../../shared/services/shared-service';

@Component({
  selector: 'settings-delete',
  templateUrl: 'delete.html'
})
export class DeleteComponent implements OnInit {
  groupsLength: number;
  streamRetrieved: boolean;
  streamDelete = true;

  constructor(public router: Router,
              public activatedRoute: ActivatedRoute,
              public groupService: GroupService,
              public missionService: MissionService,
              private departmentService: DepartmentService) {}


  async ngOnInit() {
    let groups: Group[];

    if (this.missionService.departmentId) {
      this.streamRetrieved = false;
      const groups = await this.groupService.getGroups(1, this.missionService.departmentId, this.missionService.userId);
      this.groupsLength = groups.length,
      this.streamRetrieved = true;
    }
  }

  async deleteFunc() {
    this.streamDelete = false;

    await this.departmentService.deleteDepartment(this.missionService.departmentId);

    this.streamDelete = true;
    this.router.navigate(['../../../../'], { relativeTo: this.activatedRoute });
  }

}
