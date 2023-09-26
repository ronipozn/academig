import {Component, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../services/mission-service';

@Component({
    selector: 'settings',
    templateUrl: 'settings.html',
    styleUrls: ['settings.css'],
})
export class SettingsComponent {

  constructor(private titleService: Title,
              public missionService: MissionService) {}

  updatePage() {
    this.titleService.setTitle('Settings - ' + this.missionService.universityName + ' | Academig');
  }

  ngOnInit() {
    this.updatePage()
  }

  ngOnDestroy() {
  }

}
