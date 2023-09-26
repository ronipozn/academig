import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../../services/mission-service';
import {PeopleService} from '../../../shared/services/people-service';
import {UserService} from '../../../user/services/user-service';
import {Resource, ResourceService} from '../../../shared/services/resource-service';

@Component({
  selector: 'department-resources',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class DepartmentResourcesComponent implements OnInit {
  stream: number[];
  streamFollow: number[];

  resources: Resource[] = [];

  streamRetrieved: boolean;

  streamMore: boolean;

  text: string;
  type: number;
  count = 0;
  more = 0;
  moreFlag = false;

  constructor(public titleService: Title,
              public peopleService: PeopleService,
              public userService: UserService,
              public resourceService: ResourceService,
              public missionService: MissionService) {
  }

  ngOnInit() {
    if (this.missionService.departmentId) {
      this.titleService.setTitle('Resources - ' + this.missionService.departmentTitle + ' | Academig');
    }

    this.findResources()
  }

  async findResources() {
    this.streamRetrieved = false;

    const resources = await this.resourceService.getResources<Resource>(this.missionService.searchFlag ? 8 : 7, this.missionService.departmentId, null, this.more, this.missionService.searchText);

    if (resources) {

      this.resources.push.apply(this.resources, resources);

      this.count = Number(this.resources[this.resources.length - 1]);
      this.resources.pop();
      this.moreFlag = this.count > ((this.more + 1) * 10);
      this.streamMore = true;
      this.stream = new Array(this.resources.length).fill(0);
      this.streamFollow = new Array(this.resources.length).fill(0);

    } else {

      this.resources = [];

    }

    this.streamRetrieved = true;
  }

  async resourceFollow(i: number) {
    const itemId: string = this.resources[i]._id;
    const toFollow: boolean = !this.resources[i].followStatus;
    this.streamFollow[i] = 3;
    await this.peopleService.toggleFollow(1, 0, itemId, toFollow);
    this.userService.toggleFollow(toFollow, itemId, "resource");
    this.resources[i].followStatus = toFollow;
    this.streamFollow[i] = 0;
  }

  showMoreFunc() {
    this.more += 1;
    this.streamMore = false;
    this.findResources();
  }

}
