import {Component, Input, OnInit} from '@angular/core';
import {MissionService} from '../services/mission-service';

@Component({
  selector: 'group-papers-kit',
  template: `<papers-kit *ngIf="missionService.showPage" class="mb-4 pb-4"
                         [groupId]=missionService.groupId
                         [sourceType]=0
                         [userId]=missionService.userId
                         [showEditBtn]=missionService.showEditBtn>
             </papers-kit>`

})
export class GroupPapersKitComponent {
  constructor(public missionService: MissionService) {}

  updateProgress(progress: number) {
    this.missionService.groupProgress[30] = progress;
  }
}
