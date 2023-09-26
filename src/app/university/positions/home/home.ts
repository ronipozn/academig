import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {SharedService} from '../../../shared/services/shared-service';
import {MissionService} from '../../services/mission-service';
import {PeopleService} from '../../../shared/services/people-service';
import {OpenPosition, OpenPositionService} from '../../../shared/services/position-service';

@Component({
  selector: 'university-positions',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class UniversityPositionsComponent implements OnInit {
  stream: number[];
  streamFollow: number[];

  positions: OpenPosition[] = [];

  streamRetrieved: boolean;

  streamMore: boolean;

  text: string;
  type: number;
  count = 0;
  more = 0;
  moreFlag = false;

  constructor(public titleService: Title,
              public peopleService: PeopleService,
              public openPositionService: OpenPositionService,
              public missionService: MissionService) {}

  ngOnInit() {
    if (this.missionService.universityId) {
      this.titleService.setTitle('Positions - ' + this.missionService.universityName + ' | Academig');
    }

    this.findPositions()
  }

  async findPositions() {
    this.streamRetrieved = false;

    const positions = await this.openPositionService.getPositions(this.missionService.searchFlag ? 6 : 5, this.missionService.universityId, this.more, this.missionService.searchText);

    this.positions.push.apply(this.positions, positions);

    if (positions) {
      this.count = Number(this.positions[this.positions.length - 1]);
      this.positions.pop();
      this.moreFlag = this.count > ((this.more + 1) * 10);
      this.streamMore = true;
      this.stream = new Array(this.positions.length).fill(0);
      this.streamFollow = new Array(this.positions.length).fill(0);
    } else {
      this.positions = [];
    }

    this.streamRetrieved = true;
  }

  // async positionFollow(i: number) {
  //   const itemId: string = this.positions[i]._id;
  //   const toFollow: boolean = (this.positions[i].apply[0].status == 1) ? false : true;
  //
  //   this.streamFollow[i] = 3;
  //
  //   await this.peopleService.toggleFollow(3, 2, itemId, toFollow);
  //
  //   this.positions[i].apply[0].status = toFollow ? 1 : 0;
  //   this.streamFollow[i] = 0;
  // }

  showMoreFunc() {
    this.more += 1;
    this.streamMore = false;
    this.findPositions();
  }

}
