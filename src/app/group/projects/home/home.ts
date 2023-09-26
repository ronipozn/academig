import {Component, OnDestroy} from '@angular/core';
import {ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';

import {MissionService} from '../../services/mission-service';
import {projectsPageItems, GroupService} from '../../../shared/services/group-service';
import {PeopleService} from '../../../shared/services/people-service';
import {TopicDetails, CreateProject, UpdateProject, Project, ProjectService} from '../../../shared/services/project-service';

import {SharedService, Period} from '../../../shared/services/shared-service';

import {UserService} from '../../../user/services/user-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-projects',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupProjectsComponent implements OnDestroy {
  navigationSubscription: Subscription;

  // subscriptionDrag = new Subscription();
  // subscriptionDrop = new Subscription();
  // dragIndex: number;

  streamCurrentProjects: number[];
  streamCurrentProjectsFollow: number[];

  streamPastProjects: number[];
  streamPastProjectsFollow: number[];

  items: TopicDetails;

  currentProjects: Project[];
  pastProjects: Project[];

  // currentProjectsHistory: Project[] = [];
  // pastProjectsHistory: Project[] = [];
  // undoProjects: boolean[] = [false,false];

  streamRetrieved: boolean[] = [];

  backgroundBuildFlag = false;
  layManBuildFlag = false;

  streamBackground = 0;
  streamLayMan = 0;

  itemFocus: number;
  modeNum: number;

  projectNewFlag: boolean = false;
  projectBuildFlag: boolean = false;
  projectIndex: number;
  projectBuild: Project;

  projId: string;
  topicIndex: number;

  @ViewChild('closeBtn', { static: true }) closeBtn: ElementRef;

  constructor(private titleService: Title,
              private peopleService: PeopleService,
              private groupService: GroupService,
              private projectService: ProjectService,
              private userService: UserService,
              private sharedService: SharedService,
              private route: ActivatedRoute,
              private router: Router,
              public missionService: MissionService) {

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.updatePage()
      }
    });
    this.updatePage();
  }

  async updatePage() {
    if (this.missionService.groupId) {
      this.titleService.setTitle('Projects - ' + this.missionService.groupTitle + ' | Academig');
      this.streamRetrieved = [false, false, false];

      this.projId = this.route.snapshot.params['topicId'];
      this.topicIndex = this.missionService.topics.findIndex(r=>this.projId==r.name.replace(/ /g,"_").toLowerCase());

      this.items = await this.projectService.getTopicDetails(this.projId, this.missionService.groupId);

      this.streamRetrieved[0] = true;

      this.currentProjects = await this.projectService.getProjects(2, this.missionService.groupId, 0, 0, this.projId);

      this.streamRetrieved[1] = true;
      this.streamCurrentProjects = new Array(this.currentProjects.length).fill(0);
      this.streamCurrentProjectsFollow = new Array(this.currentProjects.length).fill(0);

      this.pastProjects = await this.projectService.getProjects(2, this.missionService.groupId, 1, 0, this.projId);

      this.streamRetrieved[2] = true;
      this.streamPastProjects = new Array(this.pastProjects.length).fill(0);
      this.streamPastProjectsFollow = new Array(this.pastProjects.length).fill(0);
    }
  }

  ngOnDestroy() {
    if (this.navigationSubscription) this.navigationSubscription.unsubscribe();
    // if (this.subscriptionDrag) this.subscriptionDrag.unsubscribe();
    // if (this.subscriptionDrop) this.subscriptionDrop.unsubscribe();
    // this.dragulaService.destroy('current-bag')
    // this.dragulaService.destroy('past-bag')
  }

  projectSlide(flag: boolean, i: number, newFlag: boolean, newMode: number) {
    this.modeNum = newMode;

    if (newFlag) {
      this.projectBuild = null;
    } else {
      if (newMode == 0) this.projectBuild = this.currentProjects[i];
      if (newMode == 1) this.projectBuild = this.pastProjects[i];
    }

    this.projectIndex = i;
    this.projectBuildFlag = flag;
    this.projectNewFlag = newFlag;
  }

  async projectUpdate(event, modeNum: number) {
    let createProject: CreateProject;
    let updateProject: UpdateProject;

    this.projectBuildFlag = false;

    const period: Period = {start: event.start,
                            end: this.modeNum ? event.end : null,
                            mode: this.modeNum ? 0 : 2
                          };

    if (this.projectNewFlag == true) {

      createProject = {'name': event.title,
                       'pic': event.pic,
                       'period': period,
                       'description': event.description,
                       'groupId': this.missionService.groupId,
                       'collaborations': event.collaborations,
                       'people': event.members,
                       'fundings': event.fundings,
                       'ai': event.intelligence ? event.intelligence[0] : null
                      };

    } else {

      updateProject = {'_id': (this.modeNum == 0) ? this.currentProjects[this.projectIndex]._id : this.pastProjects[this.projectIndex]._id,
                       'name': event.title,
                       'pic': event.pic,
                       'period': period,
                       'description': event.description
                      };
    }

    const project: Project = {'_id': (this.projectNewFlag) ? null : ((this.modeNum == 0) ? this.currentProjects[this.projectIndex]._id : this.pastProjects[this.projectIndex]._id),
                              'name': event.title,
                              'pic': event.pic,
                              'period': period,
                              'description': event.description,
                              'group': this.missionService.groupIndex,
                              'profile': null,
                              'views': [0, 0, 0, 0, 0],
                              'followStatus': false
                             };

    if (this.modeNum == 0) {

      if (this.projectNewFlag == true) {

        this.currentProjects.push(project);
        const loc = this.currentProjects.length - 1;

        this.streamCurrentProjects[loc] = 3;
        this.streamCurrentProjectsFollow[loc] = 0;

        this.itemFocus = loc;

        this.currentProjects[loc]._id = await this.projectService.putProject(createProject, 0, this.projId);

        this.streamCurrentProjects[loc] = 1;
        this.missionService.topics[this.topicIndex].count++;
        this.missionService.groupProgress[10] = 1;

      } else {

        this.currentProjects[this.projectIndex] = project;
        this.streamCurrentProjects[this.projectIndex] = 3;

        await this.projectService.postProject(updateProject, this.missionService.groupId, 0);

        this.streamCurrentProjects[this.projectIndex] = 1;

      }

    } else if (this.modeNum == 1) {

      if (this.projectNewFlag == true) {

        this.pastProjects.push(project);
        this.missionService.topics[this.topicIndex].count++;
        const loc = this.pastProjects.length - 1;

        this.streamPastProjects[loc] = 3;
        this.streamPastProjectsFollow[loc] = 0;

        this.itemFocus = loc;

        this.pastProjects[this.pastProjects.length - 1]._id = await this.projectService.putProject(createProject, 1, this.projId);

        this.streamPastProjects[loc] = 1;
        this.missionService.topics[this.topicIndex].count++;
        this.missionService.groupProgress[10] = 1;

      } else {

        this.pastProjects[this.projectIndex] = project;
        this.streamPastProjects[this.projectIndex] = 3;

        await this.projectService.postProject(updateProject, this.missionService.groupId, 1);

        this.streamPastProjects[this.projectIndex] = 1;

      }

    }

  }

  async projectDelete(i: number, modeNum: number) {
    this.itemFocus = null;
    let _id: string

    if (modeNum == 0) {
      _id = this.currentProjects[i]._id;
      this.streamCurrentProjects[i] = 3;
    } else if (modeNum == 1) {
      _id = this.pastProjects[i]._id;
      this.streamPastProjects[i] = 3;
    }

    await this.projectService.deleteProject(_id, this.missionService.groupId, modeNum, this.projId);

    if (modeNum == 0) {
      // this.currentProjectsHistory.push(this.currentProjects[i]);
      this.currentProjects.splice(i, 1);
      // this.undoProjects[0]=true;
      this.streamCurrentProjects[i] = 0;
    } else if (modeNum == 1) {
      // this.pastProjectsHistory.push(this.pastProjects[i]);
      this.pastProjects.splice(i, 1);
      // this.undoProjects[1]=true;
      this.streamPastProjects[i] = 0;
    }

    this.missionService.topics[this.topicIndex].count--;

    if (this.currentProjects.length == 0 && this.pastProjects.length == 0) this.missionService.groupProgress[10] = 0;
  }

  async projectMove(i: number, modeNum: number) {
    let _id: string

    if (modeNum == 0) {
      _id = this.currentProjects[i]._id;
      this.streamCurrentProjects[i] = 3;
    } else {
      _id = this.pastProjects[i]._id;
      this.streamPastProjects[i] = 3;
    }

    await this.projectService.moveProject(_id, this.projId, this.missionService.groupId, modeNum);

    if (modeNum == 0) {
      this.currentProjects[i].period.mode = 0;
      this.currentProjects[i].period.end = new Date();
      this.pastProjects.push(this.currentProjects[i]);
      this.currentProjects.splice(i, 1);
      this.streamCurrentProjects[i] = 0;
      this.streamPastProjects[this.pastProjects.length - 1] = 0;
      this.streamPastProjectsFollow[this.pastProjects.length - 1] = 0;
    } else {
      this.pastProjects[i].period.mode = 2;
      this.pastProjects[i].period.end = null;
      this.currentProjects.push(this.pastProjects[i]);
      this.pastProjects.splice(i, 1);
      this.streamPastProjects[i] = 0;
      this.streamCurrentProjects[this.currentProjects.length - 1] = 0;
      this.streamCurrentProjectsFollow[this.currentProjects.length - 1] = 0;
    }

  }

  async projectFollow(i: number, modeNum: number) {
    const itemId: string = (modeNum == 0) ? this.currentProjects[i]._id : this.pastProjects[i]._id;
    let toFollow: boolean;
    if (modeNum == 0) {
      toFollow = !this.currentProjects[i].followStatus;
      this.streamCurrentProjectsFollow[i] = 3;
    } else {
      toFollow = !this.pastProjects[i].followStatus;
      this.streamPastProjectsFollow[i] = 3;
    }
    await this.peopleService.toggleFollow(2, 0, itemId, toFollow);
    this.userService.toggleFollow(toFollow, itemId, "project");
    if (modeNum == 0) {
      this.currentProjects[i].followStatus = toFollow;
      this.streamCurrentProjectsFollow[i] = 0;
    } else {
      this.pastProjects[i].followStatus = toFollow;
      this.streamPastProjectsFollow[i] = 0;
    }
  }

  // projectUndo(modeNum: number) {
  //   if (modeNum==0) {
  //     this.currentProjects.push(this.currentProjectsHistory.pop());
  //     this.itemFocus=this.currentProjects.length-1;
  //     this.undoProjects[0]=(this.currentProjectsHistory.length!=0);
  //   } else {
  //     this.pastProjects.push(this.pastProjectsHistory.pop());
  //     this.itemFocus=this.pastProjects.length-1;
  //     this.undoProjects[1]=(this.pastProjectsHistory.length!=0);
  //   }
  // }

  async projectOrder(drag: number, drop: number, bagName: string) {
    let modeNum: number
    let itemId: string

    if (bagName == 'current-bag') {
      modeNum = 0;
      this.streamCurrentProjects[drop] = 3;
      itemId = this.currentProjects[drag]._id;
    } else {
      modeNum = 1;
      this.streamPastProjects[drop] = 3;
      itemId = this.pastProjects[drag]._id;
    }

    await this.groupService.orderItems(this.missionService.groupId, itemId, 0, 2, modeNum, drag, drop, this.projId);

    if (modeNum == 0) {
      this.streamCurrentProjects[drop] = 0;
    } else {
      this.streamPastProjects[drop] = 0;
    }
  }

  streamFunc(modeNum: number) {
    let loc: number

    if (modeNum == 0) {
      loc = this.projectNewFlag ? this.currentProjects.length - 1 : this.projectIndex;
      this.streamCurrentProjects[loc] = 0;
    } else if (modeNum == 1) {
      loc = this.projectNewFlag ? this.pastProjects.length - 1 : this.projectIndex;
      this.streamPastProjects[loc] = 0;
    }
  }

  async backgroundOp(mode: number, flag: boolean, event) {
    this.backgroundBuildFlag = flag;
    if (mode == 1) {

      this.streamBackground = 3;

      await this.sharedService.deleteTextPic(13, this.projId, this.missionService.groupId);

      this.items.background = {"text": null, "pic": null, "caption": null};
      this.streamBackground = 0;
      this.missionService.groupProgress[8] = 0;

    } else if (mode == 2) {

      // this.items.background = event.text
      this.items.background = {"text": event.text, "pic": event.pic, "caption": event.caption};
      this.streamBackground = 3;

      await this.sharedService.postTextPic(13, this.projId, this.missionService.groupId, event.text, event.pic, event.caption);

      this.streamBackground = 1;
      this.missionService.groupProgress[8] = 1;

    } else if (mode == 3) {

      this.streamBackground = 0;

    }
  }

  async layManOp(mode: number, flag: boolean, event) {
    this.layManBuildFlag = flag;

    if (mode == 0) {

      this.closeBtn.nativeElement.click();

    } else if (mode == 1) {

      this.closeBtn.nativeElement.click();
      this.streamLayMan = 3;

      await this.sharedService.deleteTextPic(6, this.projId, this.missionService.groupId);

      this.items.layMan = {"text": null, "pic": null, "caption": null};
      this.streamLayMan = 0;
      this.missionService.groupProgress[9] = 0;

    } else if (mode == 2) {

      this.items.layMan = {"text": event.text, "pic": event.pic, "caption": event.caption};
      this.streamLayMan = 3;

      await this.sharedService.postTextPic(6, this.projId, this.missionService.groupId, event.text, event.pic, event.caption);

      this.streamLayMan = 1;
      this.missionService.groupProgress[9] = 1;

    } else if (mode == 3) {

      this.streamLayMan = 0;

    }
  }

}
