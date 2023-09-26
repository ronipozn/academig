import {Component, Input, OnInit} from '@angular/core';
import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'private-group-calendar',
  template: `<private-calendar-list [groupId]=missionService.groupId
                                    [sourceType]=0
                                    [showEditBtn]=missionService.showEditBtn>
             </private-calendar-list>`
})
export class CalendarComponent {
  constructor(public missionService: MissionService) {}
}
