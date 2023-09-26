import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {AdminService} from '../../shared/services/admin-service';
import {OpenPosition} from '../../shared/services/position-service';
import {titlesTypes} from '../../shared/services/people-service';

import * as moment from 'moment';

@Component({
    selector: 'positions',
    templateUrl: 'positions.html'
})
export class PositionsComponent implements OnInit {
  streamRetrieved: boolean;
  streamPositions: number[];
  positions: OpenPosition[];
  // buildFlag = false;

  titlesTypes = titlesTypes;
  lengthSelect: string[] = ['Months', 'Years'];
  typeSelect: string[] = ["Full-time", "Part-time", "Contract", "Internship", "Volunteer"];
  feedbackSelect: string[] = ["Search Engine", "Social Media (Facebook, Twitter, Linkedin, etc.)", "Friend or Co-worker", "Podcast", "Email", "Website", "Blog", "Conference or Trade-show", "Other"];

  moment: any = moment;

  constructor(private titleService: Title,
              private adminService: AdminService) {
    this.titleService.setTitle('Admin Jobs Posting - Academig');
  }

  ngOnInit() {
    this.updateList();
  }

  async updateList() {
    this.streamRetrieved = false;
    this.positions = await this.adminService.getPositions();
    this.streamRetrieved = true;
    this.streamPositions = new Array(this.positions.length).fill(0);
  }

}
