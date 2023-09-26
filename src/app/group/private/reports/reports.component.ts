import {Component, Input, OnInit} from '@angular/core';
import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'private-reports',
  template: `<private-analytics-list>
             </private-analytics-list>`
})
export class ReportsComponent {
  // (progress)=updateProgress($event)>

  constructor(public missionService: MissionService) {}

  updateProgress(progress: number) {
    this.missionService.groupProgress[26] = progress;
  }
}
