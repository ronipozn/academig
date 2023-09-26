import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

import {UserService} from '../../../user/services/user-service';
import {MissionService} from '../../services/mission-service';
import {People, PeopleService} from '../../../shared/services/people-service';

@Component({
  selector: 'university-people',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class UniversityPeopleComponent implements OnInit {
  people: People[][] = [[],[],[],[],[]];

  stream: number[][] = [[],[],[],[],[]];
  streamFollow: number[][] = [[],[],[],[],[]];

  count: number[] = [0, 0, 0, 0, 0];
  more: number[] = [0, 0, 0, 0, 0];
  moreFlag = false;

  tabs = ['Faculty', 'Staff', 'Postdoc', 'Graduate', 'Undergraduate']

  streamMore: boolean;

  activeTab: number;
  streamRetrieved: boolean[] = [false, false, false, false, false];

  pdfSlideFlag = false;
  fileTitle: string;
  fileName: string;

  constructor(public titleService: Title,
              public userService: UserService,
              public peopleService: PeopleService,
              public missionService: MissionService,
              public _router: Router) {
  }

  ngOnInit() {
    if (this.missionService.universityId) {
      this.titleService.setTitle('People - ' + this.missionService.universityName + ' | Academig');
      this.activeTab = 0;
    }

    this.peopleFunc(this.activeTab)
  }

  async peopleFunc(tabNum: number) {
    this.activeTab = tabNum;

    if (this.streamRetrieved[tabNum] == false) {

      const people = await this.peopleService.getPeoples(this.missionService.searchFlag ? 16 : 13, this.missionService.universityId, null, tabNum, 0, this.more[this.activeTab], this.missionService.searchText);

      this.people[tabNum].push.apply(this.people[tabNum], people);

      this.count[tabNum] = Number(this.people[tabNum][this.people[tabNum].length - 1]);
      this.people[tabNum].pop();

      this.stream[tabNum] = new Array(this.people[tabNum].length).fill(0);
      this.streamFollow[tabNum] = new Array(this.people[tabNum].length).fill(0);

      this.streamRetrieved[tabNum] = true;
      this.moreFlag = this.count[tabNum] > ((this.more[tabNum] + 1) * 10);
      this.streamMore = true;
    }
  }

  showMoreFunc() {
    this.streamRetrieved[this.activeTab] = false;
    this.more[this.activeTab] += 1;

    this.streamMore = false;
    this.peopleFunc(this.activeTab);
  }

  showTabFunc(t: number) {
    this.streamMore = false;
    if (this.more[t]==0) this.peopleFunc(t);
  }

  pdfSlide(flag: boolean, event) {
    this.pdfSlideFlag = flag;
    if (flag == true) {
      this.fileTitle = event.title;
      this.fileName = event.fileName;
    }
  }

  async peopleFollow(i: number) {
    const itemId: string = this.people[this.activeTab][i]._id;
    const toFollow: boolean = !this.people[this.activeTab][i].followStatus;
    this.streamFollow[this.activeTab][i] = 3;
    await this.peopleService.toggleFollow(9, 0, itemId, toFollow);
    this.userService.toggleFollow(toFollow, itemId, "people");
    this.people[this.activeTab][i].followStatus = toFollow;
    this.streamFollow[this.activeTab][i] = 0;
  }

  peopleMessage(i: number) {
    const userMessage: People = this.people[this.activeTab][i];

    this.userService.newChannel = {
                                 _id: null,
                                 block: 0,
                                 usersIds: [userMessage._id],
                                 users: [userMessage],
                                 unread: 0,
                                 type: 0,
                                 message: {_id: null,
                                           type: null,
                                           userId: null,
                                           text: null,
                                           file: null,
                                           date: null
                                          }
                                };

    this._router.navigate(['/messages']);
  }

}
