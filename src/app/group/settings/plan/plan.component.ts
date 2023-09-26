import {Component} from '@angular/core';

import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'settings-plan',
  templateUrl: 'plan.html',
  styleUrls: ['plan.css']
})
export class PlanComponent {
  constructor(public missionService: MissionService) { }
}
