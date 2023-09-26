import {Component, Input, OnInit} from '@angular/core';

import {OpenPositionDetails, OpenPositionService} from '../../../../services/position-service';

import {itemsAnimation} from '../../../../animations/index';

@Component({
  selector: 'position-interview',
  templateUrl: 'position-interview.html',
  animations: [itemsAnimation],
  styleUrls: ['position-interview.css']
})
export class PositionInterviewComponent implements OnInit {
  @Input() projId: string;
  @Input() sourceType: number;
  @Input() userStatus: number;

  // position: OpenPositionDetails;
  // showButton: boolean[] = [];
  // streamRetrieved: boolean;

  constructor(private positionService: OpenPositionService) {}
  ngOnInit() { }
}
