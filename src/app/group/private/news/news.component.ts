import {Component, Input, OnInit} from '@angular/core';
import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'private-news',
  templateUrl: 'news.html'
})
export class NewsComponent {

  constructor(public missionService: MissionService) {}

  updateProgress(progress: number) {
    this.missionService.groupProgress[24] = progress;
  }
}
