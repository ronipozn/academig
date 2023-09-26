import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {PeopleService} from '../../../shared/services/people-service';
import {GroupService} from '../../../shared/services/group-service';
import {MissionService} from '../../services/mission-service';
import {SupportService} from '../../../shared/services/support-service';
import {objectMini} from '../../../shared/services/shared-service';

import {UserService} from '../../../user/services/user-service';

@Component({
  selector: 'settings-delete',
  templateUrl: 'delete.html'
})
export class DeleteComponent implements OnInit {
  holdString = 'Put on hold';
  holdIcon = 'lock';

  streamRetrieved: boolean[] = [false, false, false, true];
  deleteType: number;

  actives: objectMini[] = [];
  visitors: objectMini[] = [];
  alumnis: objectMini[] = [];

  category = 0;
  message: string;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              public missionService: MissionService,
              private peopleService: PeopleService,
              private userService: UserService,
              private groupService: GroupService,
              private supportService: SupportService) {}

  ngOnInit() {
     if (this.missionService.groupStage == 3) {
       this.holdString = 'Unlock',
       this.holdIcon = 'unlock'
     }

     this.peoplesFunc(0);
     this.peoplesFunc(1);
     this.peoplesFunc(2);
  }

  async peoplesFunc(itemNum: number) {
    const data = await this.peopleService.getPeoples(1, this.missionService.groupId, null, itemNum, 1);

    if (itemNum == 0) this.actives = data;
    if (itemNum == 1) this.visitors = data;
    if (itemNum == 2) this.alumnis = data;

    this.streamRetrieved[itemNum] = true;
  }

  async changeStageFunc(mode: number) {
    this.streamRetrieved[3] = false;
    this.deleteType = mode;

    if (mode == 0) { // on hold

      if (this.missionService.groupStage == 2) {
        this.holdString = 'Unlock'
        this.holdIcon = 'unlock'
        this.missionService.groupStage = 3;
        this.missionService.showEditBtn = false;
      } else {
        this.holdString = 'Put on hold'
        this.holdIcon = 'lock'
        this.missionService.groupStage = 2;
      }

    } else if (mode == 1) { // from scratch

      this.missionService.groupStage = 5;

    } else if (mode == 2) { // delete

      this.missionService.groupStage = 6;
    }

    await this.groupService.postGroupStage(this.missionService.groupStage, this.missionService.groupId);

    // console.log('Stage is set:', this.missionService.groupStage);

    if (this.missionService.groupStage == 6) {
      this.userService.userPositions = this.userService.userPositions.filter(r => r.group.group._id! != this.missionService.groupId);
      this.userService.userSuperQuantity = this.userService.userSuperQuantity - 1;
      this.supporPut(1) // Group delete
    } else if (this.missionService.groupStage == 5) { // 5 was sent to the server just to indicate From Scratch (and is back to 2 in SupportPut)
      this.supporPut(0) // From Scratch
    } else {
      this.streamRetrieved[3] = true;
    }

  }

  async supporPut(mode: number) {
    await this.supportService.putSupport(this.userService.userName + '. User ID: ' + this.userService.userId + '. Lab ID: ' + this.missionService.groupId,
                                         this.userService.userEmail,
                                         this.category,
                                         (mode == 1) ? 'Lab Delete' : 'From Scratch',
                                         this.message);

    this.category = 0;
    this.message = '';
    this.streamRetrieved[3] = true;

    if (mode == 0) {
      this.missionService.groupStage = 2;
      this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
    } else if (mode == 1) {
      this.router.navigate(['/'], { relativeTo: this.activatedRoute });
    }
  }

}
