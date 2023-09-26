import {Component, Input, OnInit} from '@angular/core';
import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'private-assignments',
  template: `<private-assignments-list [groupId]=missionService.groupId
                                       [sourceType]=0
                                       [userStatus]=missionService.userStatus
                                       [userId]=missionService.userId
                                       (progress)=updateProgress($event)>
             </private-assignments-list>`

})
export class AssignmentsComponent {
  constructor(public missionService: MissionService) {}

  updateProgress(progress: number) {
    this.missionService.groupProgress[26] = progress;
  }
}
