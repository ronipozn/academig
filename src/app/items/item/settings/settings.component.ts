import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../../services/mission-service';

@Component({
    selector: 'settings',
    templateUrl: 'settings.html',
    styleUrls: ['settings.css'],
})
export class SettingsComponent {

  constructor(private titleService: Title,
              public missionService: MissionService) {}

  ngOnInit() {
    this.titleService.setTitle('Settings - ' + this.missionService.name + ' | Academig');
  }

}
