import {Component, Input, OnInit} from '@angular/core';
import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'private-seminars',
  template: `<private-meetings-list class="mb-4 pb-4"
                                    [groupId]="missionService.groupId"
                                    [sourceType]=0
                                    [userStatus]=missionService.userStatus
                                    [userId]=missionService.userId
                                    (progress)=updateProgress($event)>
              </private-meetings-list>`

})
export class SeminarsComponent {
  constructor(public missionService: MissionService) {}

  updateProgress(progress: number) {
    this.missionService.groupProgress[25] = progress;
  }
}
