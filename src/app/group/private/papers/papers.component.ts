import {Component, Input, OnInit} from '@angular/core';
import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'private-papers-kit',
  template: `<papers-kit [groupId]=missionService.groupId
                         [sourceType]=0
                         [userId]=missionService.userId
                         [showEditBtn]=missionService.showEditBtn>
             </papers-kit>`

})
export class PapersKitComponent {
  constructor(public missionService: MissionService) {}

// (progress)=updateProgress($event)
  // [userStatus]=missionService.userStatus

  // updateProgress(progress: number) {
  //   this.missionService.groupProgress[26] = progress;
  // }
}
