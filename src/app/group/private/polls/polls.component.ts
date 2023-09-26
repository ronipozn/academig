import {Component, Input, OnInit} from '@angular/core';
import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'private-polls',
  template: `<polls [groupId]=missionService.groupId
                    [sourceType]=0
                    [userId]=missionService.userId
                    (progress)=updateProgress($event)>
             </polls>`

})
export class PollsComponent {
  constructor(public missionService: MissionService) {}

  updateProgress(progress: number) {
    this.missionService.groupProgress[26] = progress;
  }
}
