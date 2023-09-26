import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormGroup, FormControl, FormBuilder} from '@angular/forms';

import {MissionService} from '../../services/mission-service';
import {groupAccount, SettingsService} from '../../../shared/services/settings-service';
import {PeopleService, People} from '../../../shared/services/people-service';
import {GroupSize, CompanySize, GroupService} from '../../../shared/services/group-service';
import {Rank, UniversityService} from '../../../shared/services/university-service';

import {UserService} from '../../../user/services/user-service';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'settings-account',
  templateUrl: 'account.html'
})
export class AccountComponent implements OnInit {
  @Input() labFlag: boolean = false;

  acronym: string;
  streamRetrieved: boolean[];
  streamPrivacy: number = 0;

  adminFlag: boolean = false;

  streamGroup: number = 0;
  streamData: number = 0;
  streamRank: number = 0;

  account: groupAccount;

  groupFlag: boolean;
  dataFlag: boolean;
  rankFlag: boolean;

  actives: People[] = [];

  sizeRange: string;
  sizeLow: number;
  sizeHigh: number;
  groupSize = GroupSize;
  companySize = CompanySize;

  form: FormGroup;

  constructor(private router: Router,
              public missionService: MissionService,
              private settingsService: SettingsService,
              private universityService: UniversityService,
              private groupService: GroupService,
              private peopleService: PeopleService,
              private userService: UserService,
              private authService: AuthService,
              private fb: FormBuilder) {
    const matches = missionService.groupIndex.group.name.match(/\b(\w)/g);
    this.acronym = matches.join('').substring(0, 2).toUpperCase();
    this.streamRetrieved = [false, false];
  }

  async ngOnInit() {
    this.account = await this.settingsService.getGroupAccount(this.missionService.groupId);
    this.form = this.fb.group({
      privacy: new FormControl(this.account.privacy ? this.account.privacy.toString() : "0")
    });
    this.authService.token.subscribe(token => this.adminFlag = this.authService.userHasScopes(token, ['write:groups']));
    if (this.account.size!=null) this.sizeOp()
    this.streamRetrieved[0] = true;
    this.peoplesFunc();
  }

  sizeOp() {
    const i: number = this.missionService.groupType ? this.groupSize.findIndex(y => y.id == this.account.size) : this.companySize.findIndex(y => y.id == this.account.size);
    this.sizeRange = this.missionService.groupType ? this.groupSize[i].name : this.companySize[i].name;
    this.sizeLow = this.missionService.groupType ? this.groupSize[i].low : this.companySize[i].low;
    this.sizeHigh = this.missionService.groupType ? this.groupSize[i].high : this.companySize[i].high;
  }

  async peoplesFunc() {
    this.actives = await this.peopleService.getPeoples(1, this.missionService.groupId, null, 0, 4);
    this.streamRetrieved[1] = true;
  }

  async groupOp(mode: number, flag: boolean, event) {
    this.groupFlag = flag;

    if (mode==2) {

      this.missionService.groupName = event.text;
      this.missionService.groupIndex.group.name = event.text;
      this.missionService.groupIndex.group.link = event.text.replace(/ /g, '_').toLowerCase();

      this.missionService.groupIndex.group.pic = event.pic;

      if (this.userService.userPositions[0]) {
        this.userService.userPositions.filter(r => r.group.group._id == this.missionService.groupId)[0].group.group.name = this.missionService.groupIndex.group.name;
        this.userService.userPositions.filter(r => r.group.group._id == this.missionService.groupId)[0].group.group.link = this.missionService.groupIndex.group.link;
      }

      this.streamGroup = 3;

      await this.groupService.postGroupMini(this.missionService.groupId, event.text, event.pic);

      this.streamGroup = 1;

      this.router.navigate(['/', this.missionService.groupIndex.university.link,
                                 this.missionService.groupIndex.department.link,
                                 this.missionService.groupIndex.group.link,
                                 'settings',
                                 'account'
                           ]);

    } else if (mode==3) {

      this.streamGroup = 0;

    }
  }

  async dataOp(mode: number, flag: boolean, event) {
    this.dataFlag = flag;
    if (mode==2) {
      this.streamData = 3;
      this.account.topic = event.topic;
      this.account.establish = event.establish;
      this.account.size = event.size;
      this.sizeOp();
      await this.settingsService.postGroupData(this.missionService.groupId, event.topic, event.establish, event.size);
      this.streamData = 0;
    } else if (mode==3) {
      this.streamData = 0;
    }
  }

  async rankOp(mode: number, flag: boolean, rank) {
    this.rankFlag = flag;

    if (mode == 1) {
      this.account.rank = rank;
      this.streamRank = 3;
      await this.universityService.postRank(rank, this.missionService.groupId, 1);
      this.streamRank = 0;
    }
  }

  async privacyOp() {
    if (this.form.valid) {
      this.streamPrivacy = 3;
      await this.settingsService.postGroupPrivacy(this.missionService.groupId, 0, this.form.value.privacy);
      this.streamPrivacy = 1;
    }
  }

  animationDone() {
    this.streamPrivacy = 0;
  }

}
