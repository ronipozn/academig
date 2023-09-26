import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../../services/mission-service';
import {Project, ProjectService} from '../../../shared/services/project-service';
import {PeopleService} from '../../../shared/services/people-service';
import {UserService} from '../../../user/services/user-service';

@Component({
  selector: 'university-projects',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class UniversityProjectsComponent implements OnInit {
  stream: number[];
  streamFollow: number[];

  projects: Project[] = [];

  streamRetrieved: boolean;

  streamMore: boolean;

  count = 0;
  more = 0;
  moreFlag = false;

  constructor(private titleService: Title,
              private projectService: ProjectService,
              private peopleService: PeopleService,
              private userService: UserService,
              public missionService: MissionService) {
  }

  ngOnInit() {
    if (this.missionService.universityId) {
      this.titleService.setTitle('Projects - ' + this.missionService.universityName + ' | Academig');
    }

    this.findProjects()
  }

  async findProjects() {
    this.streamRetrieved = false;

    const projects = await this.projectService.getProjects(this.missionService.searchFlag ? 8 : 7, this.missionService.universityId, this.more, 0, this.missionService.searchText);

    if (projects) {
      this.projects.push.apply(this.projects, projects);

      this.count = Number(this.projects[this.projects.length - 1]);
      this.projects.pop();
      this.moreFlag = this.count > ((this.more + 1) * 10);
      this.streamMore = true;
      this.stream = new Array(this.projects.length).fill(0);
      this.streamFollow = new Array(this.projects.length).fill(0);

    } else {

      this.projects = [];

    }

    this.streamRetrieved = true;
  }

  async projectFollow(i: number) {
    const itemId: string = this.projects[i]._id;
    const toFollow: boolean = !this.projects[i].followStatus;
    this.streamFollow[i] = 3;
    await this.peopleService.toggleFollow(2, 0, itemId, toFollow);
    this.userService.toggleFollow(toFollow, itemId, "project");
    this.projects[i].followStatus = toFollow;
    this.streamFollow[i] = 0;
  }

  showMoreFunc() {
    this.more += 1;
    this.streamMore = false;
    this.findProjects();
  }

}
