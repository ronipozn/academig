import {Component, Input, OnInit} from '@angular/core';
import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'private-personal-info',
  template: `<private-personal-list [groupId]=missionService.groupId
                                    [sourceType]=0
                                    [userId]=missionService.userId>
             </private-personal-list>`

})
export class PersonalInfoComponent {
  constructor(public missionService: MissionService) {}
}
