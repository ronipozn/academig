import {Component, Input, OnInit} from '@angular/core';
import {MissionService} from '../services/mission-service';

@Component({
  selector: 'group-seminars',
  template: `<private-meetings-list *ngIf="missionService.showPage" class="mb-4 pb-4"
                                    [groupId]="missionService.groupId"
                                    [sourceType]=0
                                    [userStatus]=missionService.userStatus
                                    [userId]=missionService.userId
                                    (progress)=updateProgress($event)>
              </private-meetings-list>`

})
export class GroupSeminarsComponent {
  constructor(public missionService: MissionService) {}

  updateProgress(progress: number) {
    this.missionService.groupProgress[25] = progress;
  }
}
