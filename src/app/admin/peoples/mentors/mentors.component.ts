import {Component, OnInit} from '@angular/core';

import {AdminService} from '../../../shared/services/admin-service';
import {MentorService} from '../../../shared/services/mentor-service';

import * as moment from 'moment';

@Component({
    selector: 'mentors',
    templateUrl: 'mentors.html'
})
export class MentorsComponent implements OnInit {
  streamRetrieved: boolean = false;
  csvBuildFlag: boolean = false;

  mentors: any[];

  streamEmail: number = 0;

  streamStatus: number = 0;
  statusTypes = [
    "Invite Requested", // 0
    "Form Submitted", // 1
    "Approved", // 2
    "Active", // 3
    "On Hold", // 4
    "Declined", // 5
    "Deleted" // 6
  ];

  moment: any = moment;

  constructor(private mentorService: MentorService,
              private adminService: AdminService) { }

  ngOnInit() {
    this.updateList();
  }

  async updateList() {
    this.streamRetrieved = false;
    this.mentors = await this.adminService.getMentors();
    this.streamRetrieved = true;
  }

  async statusOp(status: number, i: number) {
    this.mentors[i].status = status;
    this.streamStatus = 3;
    await this.mentorService.postStatus(this.mentors[i]._id, status);
    this.streamStatus = 0;
  }

  async emailOp(type: number, i: number) {
    this.mentors[i].emails[type] = new Date();
    this.streamEmail = 3;
    await this.mentorService.postEmail(this.mentors[i]._id, type);
    this.streamEmail = 0;
  }

}
