import {Component, OnDestroy} from '@angular/core';

import {MissionService} from './services/mission-service';

@Component({
    selector: 'home',
    template: '<error-404 [source]=1></error-404>'
    // template: ''
})
export class _404Component implements OnDestroy {

  constructor(public missionService: MissionService) {
    this.missionService.errorFlag=true;
  }

  ngOnDestroy() {
    this.missionService.errorFlag=false;
  }

}
