import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

import {SharedService} from '../../../shared/services/shared-service';
import {MissionService} from '../../services/mission-service';
import {Period} from '../../../shared/services/shared-service';
import {collaborationsPageItems, Group, GroupService} from '../../../shared/services/group-service';
import {PeopleService} from '../../../shared/services/people-service';
import {CollaborationService, Collaboration, Sponsor} from '../../../shared/services/collaboration-service';

// import {DragulaService} from 'ng2-dragula';

import {UserService} from '../../../user/services/user-service';
import {PusherService} from '../../../user/services/pusher.service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-collaborations',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupCollaborationsComponent implements OnInit, OnDestroy {
  // subscriptionDrag = new Subscription();
  // subscriptionDrop = new Subscription();

  activeTab: number = 0;

  items: collaborationsPageItems;

  approveCollaborations: Group[];
  currentCollaborations: Group[];
  pastCollaborations: Group[];

  industries: Sponsor[];
  governments: Sponsor[];

  streamApproveCollaborations: number[];
  streamCurrentCollaborations: number[];
  streamPastCollaborations: number[];

  streamCurrentCollaborationsFollow: number[];
  streamCurrentCollaborationsAdminFollow: number[][];

  streamPastCollaborationsFollow: number[];
  streamPastCollaborationsAdminFollow: number[][];

  streamApproveCollaborationsFollow: number[];
  streamApproveCollaborationsAdminFollow: number[][];

  streamRetrieved: boolean[] = [];

  itemFocus: number;
  dragIndex: number;
  modeNum: number;
  adminGroupsLength: number;

  collaborationNewFlag: number = 0;
  collaborationBuildFlag: boolean = false;
  collaborationIndex: number;
  collaborationBuild: Collaboration;
  collaborationName: string;

  streamIndustries: number[];
  streamGovernments: number[];
  streamHowTo: number = 0;

  sponsorIndex: number;
  sponsorNewFlag: boolean = false;
  sponsorBuildFlag: boolean = false;
  sponsorBuild: Sponsor;

  howToBuildFlag: boolean = false;

  fragment: string;

  @ViewChild('scrollHowTo', { static: false }) private scrollHowTo: ElementRef;
  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  constructor(public route: ActivatedRoute,
              public titleService: Title,
              public groupService: GroupService,
              public peopleService: PeopleService,
              public userService: UserService,
              public pusherService: PusherService,
              public collaborationService: CollaborationService,
              public sharedService: SharedService,
              public missionService: MissionService) { }

  ngOnInit() {
    if (this.missionService.groupId) {

      if (this.missionService.userId) this.notifications();

      this.titleService.setTitle('Collaborations - ' + this.missionService.groupTitle + ' | Academig');
      this.streamRetrieved = [false, false, false, false, false, false];
      this.adminGroupsLength = this.userService.userPositions ? this.userService.userPositions.length : 0;

      this.tabFunc(0);

      this.route.fragment.subscribe(fragment => {
        this.fragment = fragment
        this.scrollFunc()
      });
    }
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
           case "howto": this.scrollHowTo.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
           case "add": this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
      } catch (e) { }
    }, 1000);
  }

  async updatePage() {
    this.items = await this.groupService.getCollaborationsPageByGroupId(this.missionService.groupId);
    this.streamRetrieved[0] = true;
  }

  async tabFunc(tabNum: number) {
    this.activeTab = tabNum;
    // if (this.streamRetrieved[tabNum] == false) {
      if (tabNum == 0) {
        this.updatePage();
        this.updateCollaborations();
      } else if (tabNum == 1) {
        this.updateSponsors();
      }
    // }
  }

  async updateCollaborations() {
    this.approveCollaborations = await this.collaborationService.getCollaborations(this.missionService.groupId, 3, 0);

    this.streamRetrieved[5] = true;
    this.streamApproveCollaborations = new Array(this.approveCollaborations.length).fill(0);
    this.streamApproveCollaborationsFollow = new Array(this.approveCollaborations.length).fill(0);
    this.streamApproveCollaborationsAdminFollow = Array(this.approveCollaborations.length).fill(0).map(() => new Array(this.adminGroupsLength).fill(0));

    this.currentCollaborations = await this.collaborationService.getCollaborations(this.missionService.groupId, 0, 0);

    this.streamRetrieved[1] = true;
    this.streamCurrentCollaborations = new Array(this.currentCollaborations.length).fill(0);
    this.streamCurrentCollaborationsFollow = new Array(this.currentCollaborations.length).fill(0);
    this.streamCurrentCollaborationsAdminFollow = Array(this.currentCollaborations.length).fill(0).map(() => new Array(this.adminGroupsLength).fill(0));

    this.pastCollaborations = await this.collaborationService.getCollaborations(this.missionService.groupId, 1, 0);

    this.streamRetrieved[2] = true;
    this.streamPastCollaborations = new Array(this.pastCollaborations.length).fill(0);
    this.streamPastCollaborationsFollow = new Array(this.pastCollaborations.length).fill(0);
    this.streamPastCollaborationsAdminFollow = Array(this.pastCollaborations.length).fill(0).map(() => new Array(this.adminGroupsLength).fill(0));
  }

  async updateSponsors() {
    this.industries = await this.collaborationService.getSponsors(this.missionService.groupId, 0);

    this.streamRetrieved[3] = true;
    this.streamIndustries = new Array(this.industries.length).fill(0);

    this.governments = await this.collaborationService.getSponsors(this.missionService.groupId, 1);

    this.streamRetrieved[4] = true;
    this.streamGovernments = new Array(this.governments.length).fill(0);
  }

  ngOnDestroy() {
    // if (this.subscriptionDrag) this.subscriptionDrag.unsubscribe();
    // if (this.subscriptionDrop) this.subscriptionDrop.unsubscribe();

    // this.dragulaService.destroy('industries-bag')
    // this.dragulaService.destroy('governments-bag')

    // if (this.userService.userId) this.pusherService.notificationsChannel.unbind();
  }

  collaborationSlide(flag: boolean, i: number, newFlag: number, newMode: number) {
    this.modeNum = newMode;

    if (newFlag >= 1 && flag) {
      if (newMode == 0) {
        this.collaborationBuild = this.currentCollaborations[i].collaboration;
        this.collaborationName = this.currentCollaborations[i].groupIndex.group.name;
      } else {
        this.collaborationBuild = this.pastCollaborations[i].collaboration;
        this.collaborationName = this.pastCollaborations[i].groupIndex.group.name;
      }
    }

    this.collaborationIndex = i;
    this.collaborationBuildFlag = flag;
    this.collaborationNewFlag = newFlag; // 0 - New Collabortation
                                         // 1 - Edit collaboration
                                         // 2 - End Collaboration
  }

  async collaborationUpdate(event) {
    let group: Group;
    let groups: Group[];
    let status: number;
    let groupId: string;

    const id = (this.collaborationNewFlag == 0) ? null : this.collaborationBuild._id;
               // (
               //  (this.modeNum==0) ? this.currentCollaborations[this.collaborationIndex].collaboration._id :
               //                      this.pastCollaborations[this.collaborationIndex].collaboration._id
               // );

    const period: Period = {start: event.start,
                            end: this.modeNum ? event.end : null,
                            mode: this.modeNum ? 0 : 2
                          };

    if (this.collaborationNewFlag == 0) {
      if (event.group._id) {
        groupId = event.group._id;
        status = 1;
      } else {
        groupId = event.group;
        status = 0;
      }
    } else if (this.collaborationNewFlag == 1) {
      groupId = null;
      status = 2;
    } else if (this.collaborationNewFlag == 2) {
      groupId = null;
      status = 3;
    }

    const createCollaboration: Collaboration = {
                                                '_id': id,
                                                'status': 0,
                                                'groupsIds': [this.missionService.groupId, groupId],
                                                'period': period,
                                                // "projects": event.projects,
                                                'projects': [],
                                                'text': event.text,
                                                'ai': event.intelligence ? event.intelligence[0] : null
                                               };

    if (status == 0) { // PUT NON-EXIST GROUP

     group = {
              '_id': null,
              'pic': null,
              'onInvite': 0,
              'onBehalf': 0,
              'welcome': 0,
              'plan': 0,
              'buildPro': 0,
              'domain': 0,
              'marketing': null,
              'contest': null,
              'privacy': 0,
              'stage': 0,
              'dates': null,
              'extScore': null,
              'intScore': null,
              'progress': null,
              'groupIndex': null,
              'topics': null,
              'piTitle': null,
              'piName': null,
              'piNames': [],
              'membersCount': 0,
              'unit': null,
              'publicInfo': null,
              'socialInfo': null,
              'country': 0,
              'state': null,
              'city': null,
              'topic': null,
              'size': null,
              'establish': null,
              'location': null,
              'interests': null,
              'background': null,
              'peoples': null,
              'projects': null,
              'resources': null,
              'positions': null,
              'relation': {
                           'status': null,
                           'mode': null,
                           'text': null,
                           'period': null,
                           'email_stage': null,
                          },
              'collaboration': createCollaboration,
              'userPlan': null,
              'compareStatus': false,
              'followStatus': false,
              'followAdminStatus': [false]
             };

      this.collaborationBuildFlag = false;
      this.collaborationCreate(group, createCollaboration, this.modeNum)

    } else if (status == 1) { // PUT EXISTING GROUP

      const groups = await this.groupService.getGroups(5, event.group._id, this.missionService.userId, 0);

      // this.streamGroupFollowing=new Array(group.length).fill(0);
      this.collaborationBuildFlag = false;
      groups[0].collaboration = createCollaboration;
      this.collaborationCreate(groups[0], createCollaboration, this.modeNum)

    } else if (status == 2) { // POST (update) COLLABORATION

      this.collaborationBuildFlag = false;
      this.collaborationCreate(null, createCollaboration, this.modeNum)

    } else if (status == 3) { // END COLLABORATION

      this.collaborationBuildFlag = false;
      this.collaborationEnd(this.modeNum)

    }
  }

  async collaborationCreate(group: Group, createCollaboration: Collaboration, modeNum: number) {
    if (this.modeNum == 0) {

      if (this.collaborationNewFlag == 0) {

        this.currentCollaborations.push(group);
        const loc = this.currentCollaborations.length - 1;

        this.streamCurrentCollaborations[loc] = 3;
        this.streamCurrentCollaborationsFollow[loc] = 0;
        this.streamCurrentCollaborationsAdminFollow[loc] = new Array(this.adminGroupsLength).fill(0);

        this.itemFocus = loc;

        this.currentCollaborations[loc].collaboration._id = await this.collaborationService.putCollaboration(createCollaboration, this.missionService.groupId, 0);

        this.streamCurrentCollaborations[loc] = 1;
        this.missionService.groupProgress[11] = 1;

      } else {

        this.currentCollaborations[this.collaborationIndex].collaboration.period = createCollaboration.period;
        this.currentCollaborations[this.collaborationIndex].collaboration.projects = createCollaboration.projects;
        this.currentCollaborations[this.collaborationIndex].collaboration.text = createCollaboration.text;

        this.streamCurrentCollaborations[this.collaborationIndex] = 3;

        await this.collaborationService.postCollaboration(createCollaboration, this.currentCollaborations[this.collaborationIndex].collaboration._id, this.missionService.groupId);

        this.streamCurrentCollaborations[this.collaborationIndex] = 1;
      }

    } else if (this.modeNum == 1) {

      if (this.collaborationNewFlag == 0) {

        this.pastCollaborations.push(group);
        const loc = this.pastCollaborations.length - 1;

        this.streamPastCollaborations[loc] = 3;
        this.streamPastCollaborationsFollow[loc] = 0;
        this.streamPastCollaborationsAdminFollow[loc] = new Array(this.adminGroupsLength).fill(0);

        this.itemFocus = loc;

        this.pastCollaborations[loc].collaboration._id = await this.collaborationService.putCollaboration(createCollaboration, this.missionService.groupId, 1);

        this.streamPastCollaborations[loc] = 1;
        this.missionService.groupProgress[11] = 1;

      } else {

        this.pastCollaborations[this.collaborationIndex].collaboration.period = createCollaboration.period;
        this.pastCollaborations[this.collaborationIndex].collaboration.projects = createCollaboration.projects;
        this.pastCollaborations[this.collaborationIndex].collaboration.text = createCollaboration.text;

        this.streamPastCollaborations[this.collaborationIndex] = 3;

        await this.collaborationService.postCollaboration(createCollaboration, this.pastCollaborations[this.collaborationIndex].collaboration._id, this.missionService.groupId);

        this.streamPastCollaborations[this.collaborationIndex] = 1;

      }

    }
  }

  async collaborationEnd(modeNum: number) {
    this.collaborationBuildFlag = false;

    let itemId: string;
    const i: number = this.collaborationIndex;

    if (modeNum == 0) {
      this.streamCurrentCollaborations[i] = 3;
      itemId = this.collaborationBuild._id;
    }

    await this.collaborationService.deleteCollaboration(itemId, this.missionService.groupId, modeNum, 1);

    this.streamPastCollaborationsAdminFollow = Array(this.pastCollaborations.length).fill(0).map(() => new Array(this.adminGroupsLength).fill(0));

    if (modeNum == 0) {
      this.streamCurrentCollaborations[i] = 0;
      this.currentCollaborations[i].collaboration.period.mode = 0;
      this.currentCollaborations[i].collaboration.period.end = new Date();

      this.pastCollaborations.push(this.currentCollaborations[i]);
      this.currentCollaborations.splice(i, 1);

      if (this.currentCollaborations.length == 0 && this.pastCollaborations.length == 0) this.missionService.groupProgress[11] = 0;

      this.streamPastCollaborationsFollow[this.pastCollaborations.length - 1] = this.streamCurrentCollaborationsFollow[i];
      this.streamPastCollaborationsAdminFollow[this.pastCollaborations.length - 1] = this.streamCurrentCollaborationsAdminFollow[i];
    }
  }

  async collaborationDelete(i: number, modeNum: number) {
    let itemId: string;

    if (modeNum == 0) {
      this.streamCurrentCollaborations[i] = 3;
      itemId = this.currentCollaborations[i].collaboration._id;
    } else {
      this.streamPastCollaborations[i] = 3;
      itemId = this.pastCollaborations[i].collaboration._id;
    }

    await this.collaborationService.deleteCollaboration(itemId, this.missionService.groupId, modeNum, 0);

    if (modeNum == 0) {
      this.streamCurrentCollaborations[i] = 0;
      this.currentCollaborations.splice(i, 1);
    } else {
      this.streamPastCollaborations[i] = 0;
      this.pastCollaborations.splice(i, 1);
    }
  }

  async collaborationApprove(i: number, mode: number) {
    // mode 2: APPROVE COLLABORATION
    //      3: DECLINE COLLABORATION

    let itemId: string;
    let type: number;

    this.streamApproveCollaborations[i] = 3;
    itemId = this.approveCollaborations[i].collaboration._id;
    type = (this.approveCollaborations[i].collaboration.period.mode == 2) ? 3 : 2;

    await this.collaborationService.deleteCollaboration(itemId, this.missionService.groupId, type, mode);

    this.streamApproveCollaborations[i] = 0;
    this.approveCollaborations[i].collaboration.status = 2;

    if (mode == 2) {
      if (type == 3) {
        this.currentCollaborations.push(this.approveCollaborations[i]);
        this.streamCurrentCollaborations[i] = 0;
        this.streamCurrentCollaborationsFollow[i] = 0;
        this.streamCurrentCollaborationsAdminFollow[i] = new Array(this.adminGroupsLength).fill(0);
        this.missionService.groupProgress[11] = 1;
      } else {
        this.pastCollaborations.push(this.approveCollaborations[i]);
        this.streamPastCollaborations[i] = 0;
        this.streamPastCollaborationsFollow[i] = 0;
        this.streamPastCollaborationsAdminFollow[i] = new Array(this.adminGroupsLength).fill(0);
      };
    }

    this.approveCollaborations.splice(i, 1);
  }

  async collaborationFollow(i: number, modeNum: number) {
    let itemId: string;
    let toFollow: boolean;
    if (modeNum == 0) {
      toFollow = !this.currentCollaborations[i].followStatus;
      itemId = this.currentCollaborations[i]._id;
      this.streamCurrentCollaborationsFollow[i] = 3;
    } else {
      toFollow = !this.pastCollaborations[i].followStatus;
      itemId = this.pastCollaborations[i]._id;
      this.streamPastCollaborationsFollow[i] = 3;
    }
    await this.peopleService.toggleFollow(4, 0, itemId, toFollow);
    this.userService.toggleFollow(toFollow, itemId, "group");
    if (modeNum == 0) {
      this.currentCollaborations[i].followStatus = toFollow;
      this.streamCurrentCollaborationsFollow[i] = 0;
    } else {
      this.pastCollaborations[i].followStatus = toFollow;
      this.streamPastCollaborationsFollow[i] = 0;
    }
  }

  async collaborationAdminFollow(index: number[], modeNum: number) {
    // index[0] - follow as
    // index[1] - group to follow

    let toFollow: boolean;

    const adminGroupId: string = this.userService.userPositions[index[0]].group.group._id;
    let groupId: string;

    if (modeNum == 0) {
      toFollow = !this.currentCollaborations[index[1]].followAdminStatus[index[0]];
      groupId = this.currentCollaborations[index[1]]._id;
      this.streamCurrentCollaborationsAdminFollow[index[1]][index[0]] = 3;
    } else {
      toFollow = !this.pastCollaborations[index[1]].followAdminStatus[index[0]];
      groupId = this.pastCollaborations[index[1]]._id;
      this.streamPastCollaborationsAdminFollow[index[1]][index[0]] = 3;
    };

    await this.groupService.toggleFollow(adminGroupId, groupId, toFollow);

    if (modeNum == 0) {
      this.currentCollaborations[index[1]].followAdminStatus[index[0]] = toFollow;
      this.streamCurrentCollaborationsAdminFollow[index[1]][index[0]] = 0;
    } else {
      this.pastCollaborations[index[1]].followAdminStatus[index[0]] = toFollow;
      this.streamPastCollaborationsAdminFollow[index[1]][index[0]] = 0;
    };

  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  ///////////////////// Sponsor //////////////////////
  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////

  sponsorSlide(flag: boolean, i: number, newFlag: boolean, newMode: number) {
    this.modeNum = newMode;
    this.sponsorIndex = i;
    this.sponsorBuildFlag = flag;
    this.sponsorNewFlag = newFlag;

    if (newMode == 0) this.sponsorBuild = this.industries[i];
    if (newMode == 1) this.sponsorBuild = this.governments[i];
  }

  async sponsorUpdate(event) {
    this.sponsorBuildFlag = false;

    const id = (this.sponsorNewFlag) ? null : ((this.modeNum == 0) ? this.industries[this.sponsorIndex]._id : this.governments[this.sponsorIndex]._id);

    const period: Period = {start: event.start,
                            end: event.single[0] ? null : event.end,
                            mode: event.single[0] ? 2 : 0
                           }

    const sponsor: Sponsor = {
                              '_id': id,
                              'period': period,
                              'projects': event.projects,
                              'name': event.name,
                              'link': event.link
                             };

    if (this.sponsorNewFlag == true) {

      if (this.modeNum == 0) {
        this.industries.push(sponsor);
        this.streamIndustries[this.industries.length - 1] = 3;
        this.itemFocus = this.industries.length - 1;
      } else {
        this.governments.push(sponsor);
        this.streamGovernments[this.governments.length - 1] = 3;
        this.itemFocus = this.governments.length - 1;
      }

      const _id = await this.collaborationService.putSponsor(sponsor, this.missionService.groupId, this.modeNum);

      if (this.modeNum == 0) {
        this.industries[this.industries.length - 1]._id = _id;
        this.streamIndustries[this.industries.length - 1] = 1;
      } else {
        this.governments[this.governments.length - 1]._id = _id;
        this.streamGovernments[this.governments.length - 1] = 1;
      }

    } else {

      if (this.modeNum == 0) {
        this.industries[this.sponsorIndex] = sponsor;
        this.streamIndustries[this.industries.length - 1] = 3;
      } else {
        this.governments[this.sponsorIndex] = sponsor;
        this.streamGovernments[this.governments.length - 1] = 3;
      }

      await this.collaborationService.postSponsor(sponsor, id, this.missionService.groupId, this.modeNum);

      if (this.modeNum == 0) {
        this.streamIndustries[this.sponsorIndex] = 1;
      } else {
        this.streamGovernments[this.sponsorIndex] = 1;
      }

    }
  }

  async sponsorDelete(i: number, modeNum: number) {
    let itemId: string;

    if (modeNum == 0) {
      this.streamIndustries[i] = 3;
      itemId = this.industries[i]._id;
    } else {
      this.streamGovernments[i] = 3;
      itemId = this.governments[i]._id;
    }

    await this.collaborationService.deleteSponsor(itemId, this.missionService.groupId, modeNum);

    if (modeNum == 0) {
      this.streamIndustries[i] = 0;
      this.industries.splice(i, 1);
    } else {
      this.streamGovernments[i] = 0;
      this.governments.splice(i, 1);
    }
  }

  async sponsorOrder(drag: number, drop: number, bagName: string) {
    let modeNum: number
    let itemId: string

    if (bagName == 'industries-bag') {
      modeNum = 0;
      this.streamIndustries[drop] = 3;
      itemId = this.industries[drag]._id;
    } else {
      modeNum = 1;
      this.streamGovernments[drop] = 3;
      itemId = this.governments[drag]._id;
    }

    await this.groupService.orderItems(this.missionService.groupId, itemId, 0, 0, modeNum, drag, drop);

    if (modeNum == 0) {
      this.streamIndustries[drop] = 0;
    } else {
      this.streamGovernments[drop] = 0;
    }
  }

  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////

  streamFunc(modeNum: number) {
    let loc: number

    if (modeNum == 0) {
      loc = this.sponsorNewFlag ? this.industries.length - 1 : this.sponsorIndex;
      this.streamIndustries[loc] = 0;
    } else if (modeNum == 1) {
      loc = this.sponsorNewFlag ? this.governments.length - 1 : this.sponsorIndex;
      this.streamGovernments[loc] = 0;
    } else if (modeNum == 2) {
      this.streamApproveCollaborations[loc] = 0;
    } else if (modeNum == 3) {
      this.streamCurrentCollaborations[loc] = 0;
    } else if (modeNum == 4) {
      this.streamPastCollaborations[loc] = 0;
    }
  }

  async howToOp(mode: number, flag: boolean, event) {
    this.howToBuildFlag = flag;

    if (mode == 1) {

      this.streamHowTo = 3;

      await this.sharedService.deleteText(this.missionService.groupId, this.missionService.groupId, 4);

      this.items.collaborateWithUs = null
      this.streamHowTo = 0;
      this.missionService.groupProgress[12] = 0;

    } else if (mode == 2) {

      this.streamHowTo = 3;

      this.items.collaborateWithUs = event.text

      await this.sharedService.postText(event.text, this.missionService.groupId, this.missionService.groupId, 4);

      this.streamHowTo = 1;
      this.missionService.groupProgress[12] = 1;

    } else if (mode == 3) {

      this.streamHowTo = 0;

    }
  }

  public notifications() {
    this.pusherService.notificationsChannel.bind('notifications', data => {
      // console.log('floor', Math.floor(data.verb / 1000), data.verb)
      if ((Math.floor(data.verb / 1000) == 10 || data.verb == 1004 || data.verb == 1104) && (data.actor != this.userService.userId)) {
        this.updateCollaborations();
      };
    });
  }

}
