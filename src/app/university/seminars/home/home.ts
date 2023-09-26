import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../../services/mission-service';

import {privateMeeting, SeminarService} from '../../../shared/services/seminars-service';

@Component({
  selector: 'university-seminars',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class UniversitySeminarsComponent implements OnInit {

  constructor(private titleService: Title,
              private seminarService: SeminarService,
              public missionService: MissionService) { }

  stream: number[];

  seminars: privateMeeting[] = [];

  streamRetrieved: boolean;

  streamMore: boolean;

  text: string;
  type: number;
  count = 0;
  more = 0;
  moreFlag = false;

  ngOnInit() {
    if (this.missionService.universityId) {
      this.titleService.setTitle('Galleries - ' + this.missionService.universityName + ' | Academig');
    }

    this.findSeminars()
  }

  async findSeminars() {
    this.streamRetrieved = false;

    const seminars = await this.seminarService.getMeetings(this.missionService.universityId);

    if (seminars) {
      this.seminars.push.apply(this.seminars, seminars);

      this.count = Number(this.seminars[this.seminars.length - 1]);
      this.seminars.pop();
      this.moreFlag = this.count > ((this.more + 1) * 10);
      this.streamMore = true;
      this.stream = new Array(this.seminars.length).fill(0);
    }

    this.streamRetrieved = true
  }

  showMoreFunc() {
    this.more += 1;
    this.streamMore = false;
    this.findSeminars();
  }

}
