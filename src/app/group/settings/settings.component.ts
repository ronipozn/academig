import {Component, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../services/mission-service';

@Component({
    selector: 'settings',
    templateUrl: 'settings.html'
})
export class SettingsComponent {

  labFlag: boolean;

  constructor(private titleService: Title,
              public missionService: MissionService) {}

  ngOnInit() {
    this.labFlag = !(this.missionService.onBehalf==4 || this.missionService.onBehalf==5 || this.missionService.onBehalf==7);
    this.titleService.setTitle('Settings - ' + this.missionService.groupTitle + ' | Academig');
  }

}
