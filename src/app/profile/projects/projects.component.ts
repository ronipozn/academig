import {Component, Input, OnDestroy, Output, EventEmitter} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {CreateProject, UpdateProject, Project, ProjectService} from '../../shared/services/project-service';
import {PeopleService} from '../../shared/services/people-service';

import {Period} from '../../shared/services/shared-service';

import {MissionService} from '../services/mission-service';
import {UserService} from '../../user/services/user-service';

import {itemsAnimation} from '../../shared/animations/index';

@Component({
  selector: 'profile-projects',
  templateUrl: 'projects.html',
  styleUrls: ['projects.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class ProjectsComponent {
  projects: Project[];
  profileProjects: Project[];

  streamProjects: number[];
  streamProfileProjects: number[];

  streamProjectsFollow: number[];
  streamProfileProjectsFollow: number[];

  streamRetrieved: boolean[];

  itemFocus: number;

  projId: string;

  profileProjectNewFlag = false;
  profileProjectBuildFlag = false;
  profileProjectIndex: number;
  profileProjectBuild: Project;

  constructor(private titleService: Title,
              private projectService: ProjectService,
              private peopleService: PeopleService,
              private userService: UserService,
              public missionService: MissionService) {}

  ngOnInit() {
    this.projId = this.missionService.peopleId;
    this.titleService.setTitle('Projects - ' + this.missionService.peopleName + ' | Academig');
    this.updatePage()
  }

  async updatePage() {
    this.streamRetrieved = [false, false];

    this.projects = await this.projectService.getProjects(1, this.projId, 0);

    this.streamRetrieved[0] = true;
    this.streamProjects = new Array(this.projects.length).fill(0);
    this.streamProjectsFollow = new Array(this.projects.length).fill(0);

    this.profileProjects = await this.projectService.getProjects(4, this.projId, 0);

    this.streamRetrieved[1] = true;
    this.streamProfileProjects = new Array(this.profileProjects.length).fill(0);
    this.streamProfileProjectsFollow = new Array(this.profileProjects.length).fill(0);
  }

  projectSlide(flag: boolean, i: number, newFlag: boolean) {
    if (newFlag) {
      this.profileProjectBuild = null;
    } else {
      this.profileProjectBuild = this.profileProjects[i];
    }

    this.profileProjectIndex = i;
    this.profileProjectBuildFlag = flag;
    this.profileProjectNewFlag = newFlag;
  }

  async projectUpdate(event) {

    let createProject: CreateProject;
    let updateProject: UpdateProject;

    const period: Period = {
      start: event.start,
      end: event.end,
      mode: event.active[0] ? 2 : 0
    };

    if (this.profileProjectNewFlag == true) {

      createProject = {'name': event.title,
                       'pic': event.pic,
                       'period': period,
                       'description': event.description,
                       'groupId': this.missionService.peopleId,
                       'collaborations': event.collaborations,
                       'people': event.members,
                       'fundings': event.fundings,
                       'ai': null
                      };

    } else {

      updateProject = {'_id': this.profileProjects[this.profileProjectIndex]._id,
                       'name': event.title,
                       'pic': event.pic,
                       'period': period,
                       'description': event.description
                      };
    }

    const project: Project = {'_id': (this.profileProjectNewFlag) ? null : this.profileProjects[this.profileProjectIndex]._id,
                              'name': event.title,
                              'pic': event.pic,
                              'period': period,
                              'description': event.description,
                              'group': null,
                              'profile': null,
                              'views': [0, 0, 0, 0, 0],
                              'followStatus': false
                             };

    this.profileProjectBuildFlag = false;

    if (this.profileProjectNewFlag == true) {

      this.profileProjects.push(project);
      let loc = this.profileProjects.length - 1;

      this.streamProfileProjects[loc] = 3;
      this.streamProfileProjectsFollow[loc] = 0;

      this.itemFocus = loc;

      this.profileProjects[loc]._id = await this.projectService.putProject(createProject, 2);

      this.streamProfileProjects[loc] = 1;
      this.userService.userProgress[9] = true;

    } else {

      this.profileProjects[this.profileProjectIndex] = project;
      this.streamProfileProjects[this.profileProjectIndex] = 3;

      await this.projectService.postProject(updateProject, null, 2);

      this.streamProfileProjects[this.profileProjectIndex] = 1;
    }
  }

  async projectDelete(i: number) {
    let _id: string = this.profileProjects[i]._id;

    this.itemFocus = null;
    this.streamProfileProjects[i] = 3;

    await this.projectService.deleteProject(_id, null, 2);

    this.profileProjects.splice(i, 1);
    this.streamProfileProjects[i] = 0;
    if (this.profileProjects.length==0) this.userService.userProgress[9] = false;
  }

  streamFunc(modeNum: number) {
    let loc: number
    loc = this.profileProjectNewFlag ? this.profileProjects.length - 1 : this.profileProjectIndex;
    this.streamProfileProjects[loc] = 0;
  }

  async projectFollow(i: number, modeNum: number) {
    const itemId: string = (modeNum == 0) ? this.projects[i]._id : this.profileProjects[i]._id;
    let toFollow: boolean;
    if (modeNum == 0) {
      toFollow = !this.projects[i].followStatus;
      this.streamProjectsFollow[i] = 3;
    } else {
      toFollow = !this.profileProjects[i].followStatus;
      this.streamProfileProjectsFollow[i] = 3;
    }
    await this.peopleService.toggleFollow(2, 0, itemId, toFollow);
    this.userService.toggleFollow(toFollow, itemId, "project");
    if (modeNum == 0) {
      this.projects[i].followStatus = toFollow;
      this.streamProjectsFollow[i] = 0;
    } else {
      this.profileProjects[i].followStatus = toFollow;
      this.streamProfileProjectsFollow[i] = 0;
    }
  }

}
