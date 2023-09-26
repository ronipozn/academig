import {Component, Input, OnInit, OnDestroy} from '@angular/core';

import {OpenPositionDetails, OpenPositionService} from '../../../../services/position-service';

import {itemsAnimation} from '../../../../animations/index';

@Component({
  selector: 'position-hire',
  templateUrl: 'position-hire.html',
  animations: [itemsAnimation],
  styleUrls: ['position-hire.css']
})
export class PositionHireComponent implements OnInit {
  @Input() projId: string;
  @Input() sourceType: number;
  @Input() userStatus: number;

  position: OpenPositionDetails;
  showButton: boolean[] = [];
  streamRetrieved: boolean;

  constructor(private positionService: OpenPositionService) {}
  ngOnInit() { }
}
