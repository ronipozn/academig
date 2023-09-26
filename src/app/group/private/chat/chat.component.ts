import {Component, Input, OnInit} from '@angular/core';
import {MissionService} from '../../services/mission-service';

@Component({
  selector: 'private-group-chat',
  templateUrl: 'chat.html'
})
export class ChatComponent {
  constructor(public missionService: MissionService) {}
}
