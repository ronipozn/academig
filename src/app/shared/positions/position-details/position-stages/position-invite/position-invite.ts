import {Component, Input, OnInit} from '@angular/core';

import {OpenPositionDetails, OpenPositionService} from '../../../../services/position-service';

import {itemsAnimation} from '../../../../animations/index';

@Component({
  selector: 'position-invite',
  templateUrl: 'position-invite.html',
  animations: [itemsAnimation],
  styleUrls: ['position-invite.css']
})
export class PositionInviteComponent implements OnInit {
  @Input() projId: string;
  @Input() sourceType: number;
  @Input() userStatus: number;

  // position: OpenPositionDetails;
  // showButton: boolean[] = [];
  // streamRetrieved: boolean;

  constructor(private positionService: OpenPositionService) {}

  ngOnInit() { }
}
