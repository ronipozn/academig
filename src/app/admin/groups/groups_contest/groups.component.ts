import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {GroupApprove, AdminService} from '../../../shared/services/admin-service';
import {objectMini} from '../../../shared/services/shared-service';

@Component({
  selector: 'groups',
  templateUrl: 'groups.html'
})
export class GroupsComponentContest implements OnInit {
  streamContestsRetrieved: boolean;
  streamGroupsRetrieved: boolean;

  streamContest: boolean = true;

  contests: any[] = [];

  contest: any;
  archives: any[] = [];

  contestFlag: boolean;
  streamConfig: number;
  timeleft: number;

  buttonsNames = ['Start', 'End', 'Archive'];
  buttonsActions = [1, 2, 3];

  groups: GroupApprove[];

  tasks: string[] = [
    'Cover Photo',
    'Background Text',
    'Quote',
    'Research Interests',
    'People',
    'Publications',
    'Services Background',
    'Services',
    'Projects Background',
    'Projects Layman',
    'Projects',
    'How to collaborate with us',
    'Collaboration',
    'Funding',
    'Why Join',
    'About Diversity',
    'Position', //
    'Talk',
    'Poster',
    'Press',
    'Question',
    'Find Us',
    'Contact',
    'Followings',
    'Meetings',
    'Reports',
    'News',
    'Events'
  ];

  constructor(private titleService: Title,
              private adminService: AdminService) {
    this.titleService.setTitle('Admin Labs Contest - Academig');
    this.streamContestsRetrieved = false;
  }

  ngOnInit() {
    this.updateContests();
    this.updateList();
  }

  async updateContests() {
    this.streamContestsRetrieved = false;
    const contests = await this.adminService.getContests();

    const contestTmp = contests.filter(r => r.status<3);
    this.contest = contestTmp ? contestTmp[0] : null;
    this.archives = contests.filter(r => r.status==3);

    if (this.contest) this.timeleft = Math.floor((new Date(this.contest.deadline).getTime()-Date.now())/1000);

    // console.log("contest",this.contest)

    this.streamContestsRetrieved = true;
  }

  async updateList() {
    this.streamGroupsRetrieved = false;
    this.groups = await this.adminService.getGroups(0);
    this.streamGroupsRetrieved = true;
  }

  async contestOp(mode: number, flag: boolean, event) {
    // console.log('event',event)
    this.contestFlag = flag;
    const _id: string = this.contest ? this.contest._id : null;
    const status: number = this.contest ? this.contest.status : 0;

    if (mode == 1) {

      // const picsCount = event.pics[event.pics.length - 2];
      const picsCount = event.pics.substring(event.pics.lastIndexOf("~") + 1,event.pics.lastIndexOf("/"));
      const items: objectMini[] = [];

      for (let _i = 0; _i < picsCount; _i++) {
        items[_i] = { '_id': null, 'pic': event.pics + 'nth/' + _i + '/', 'name': null };
      }

      this.streamConfig = 3;
      this.contest = {
        "_id": _id,
        "status": status,
        "title": event.title,
        "deadline": event.deadline,
        "amount": event.amount,
        "prizes": event.prizes,
        "pics": []
      };

      for (const item of items) {
        this.contest.pics.push(item);
      }

      const _id2: string = await this.adminService.postContest(this.contest);
      // console.log("_id2",_id2)
      this.contest._id = _id2;
      this.streamConfig = 0;
    }
  }

  async contestAction(status: number) {
    const id: string = this.contest._id;

    // 0 - created
    // 1 - started
    // 2 - ended
    // 3 - archive

    if (status<3) {
      this.contest.status++;
    } else {
      this.archives.push(this.contest);
      this.contest=null;
    }

    this.streamConfig = 3;
    await this.adminService.actionContest(id, status);
    this.streamConfig = 0;
  }

}
