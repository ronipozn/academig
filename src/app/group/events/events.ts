import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../services/mission-service';

@Component({
  selector: 'group-events',
  templateUrl: 'events.html',
  styleUrls: ['events.css']
})
export class GroupEventsComponent implements OnInit {
  constructor(public titleService: Title,
              public missionService: MissionService) {}

  ngOnInit() {
    this.titleService.setTitle('Events - ' + this.missionService.groupTitle + ' | Academig');
  }

}
