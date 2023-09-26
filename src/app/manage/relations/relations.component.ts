import {Component, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {PeopleService} from '../../shared/services/people-service';
import {Group, GroupService} from '../../shared/services/group-service';
import {Resource, ResourceService} from '../../shared/services/resource-service';
import {Project, ProjectService} from '../../shared/services/project-service';

import {UserService} from '../../user/services/user-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
    selector: 'relations',
    templateUrl: 'relations.html',
    styleUrls: ['relations.css'],
    animations: [itemsAnimation],
    host: { '[@itemsAnimation]': '' }
})
export class RelationsComponent implements OnInit {
  streamRetrieved: boolean[] = [];

  groupsActive: Group[] = [];
  groupsVisits: Group[] = [];
  groupsAlumnis: Group[] = [];

  resources: Resource[] = [];
  projects: Project[] = [];

  streamFollowActive: number[];
  streamFollowVisits: number[];
  streamFollowAlumnis: number[];

  streamProjects: number[];
  streamResources: number[];

  compareStatusesActive: boolean[] = [];
  compareStatusesVisits: boolean[] = [];
  compareStatusesAlumnis: boolean[] = [];

  constructor(private peopleService: PeopleService,
              private groupService: GroupService,
              private resourceService: ResourceService,
              private projectService: ProjectService,
              private titleService: Title,
              public userService: UserService) {
    this.titleService.setTitle('Relations | Academig');
  }

  ngOnInit() {
    this.updatePage()
  }

  async updatePage() {
    this.streamRetrieved = [false, false, false, false, false];

    this.groupsActive = await this.groupService.getGroups(4, this.userService.userId, this.userService.userId, 0);

    this.streamRetrieved[0] = true;
    this.streamFollowActive = new Array(this.groupsActive.length).fill(0);
    this.compareStatusesActive = new Array(this.groupsActive.length).fill(0);

    // this.groupsVisits = await this.groupService.getGroups(4, this.userService.userId, this.userService.userId, 2).subscribe(
    // this.streamRetrieved[1] = true;
    // this.streamFollowVisits = new Array(this.groupsVisits.length).fill(0);
    // this.compareStatusesVisits = new Array(this.groupsVisits.length).fill(0);
    // this.followsVisits = new Array(this.groupsVisits.length).fill(0);

    this.groupsAlumnis = await this.groupService.getGroups(4, this.userService.userId, this.userService.userId, 1);
    this.streamRetrieved[2] = true;
    this.streamFollowAlumnis = new Array(this.groupsAlumnis.length).fill(0);
    this.compareStatusesAlumnis = new Array(this.groupsAlumnis.length).fill(0);

    // this.projects = await this.projectService.getProjects(1, this.userService.userId, 0);
    // this.streamRetrieved[3] = true;
    // this.streamProjects = new Array(this.projects.length).fill(0);
    //
    // this.resources = await this.resourceService.getResources<Resource>(1, this.userService.userId, null, 0);
    // this.streamRetrieved[4] = true;
    // this.streamResources = new Array(this.resources.length).fill(0);
  }

  async groupFollow(i: number, type: number) {
    let itemId: string;
    let toFollow: boolean;
    if (type == 0) {
      toFollow = !this.groupsActive[i].followStatus;
      itemId = this.groupsActive[i]._id;
      this.streamFollowActive[i] = 3;
    } else if (type == 1) {
      toFollow = !this.groupsAlumnis[i].followStatus;
      itemId = this.groupsAlumnis[i]._id;
      this.streamFollowAlumnis[i] = 3;
    // } else if (type == 2) {
    //   toFollow = !this.groupsVisits[i].followStatus;
    //   itemId = this.groupsVisits[i]._id;
    //   this.streamFollowVisits[i] = 3;
    };
    await this.peopleService.toggleFollow(4, 0, itemId, toFollow);
    this.userService.toggleFollow(toFollow, itemId, "group");
    if (type == 0) {
      this.groupsActive[i].followStatus = toFollow;
      this.streamFollowActive[i] = 0;
    } else if (type == 1) {
      this.groupsAlumnis[i].followStatus = toFollow;
      this.streamFollowAlumnis[i] = 0;
    // } else if (type == 2) {
    //   this.groupsVisits[i].followStatus = toFollow;
    //   this.streamFollowVisits[i] = 0;
    };
  }

}
