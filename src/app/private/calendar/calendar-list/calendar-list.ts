import {Component, Input, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {PrivateService}           from '../../../shared/services/private-service';
import {groupComplex}             from '../../../shared/services/shared-service';
// privateCalendarItems

import {CalendarEvent}            from 'angular-calendar';

export const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

interface AcademigEvent extends CalendarEvent {
  groupIndex: groupComplex;
  type: number;
}

@Component({
  selector: 'private-calendar-list',
  templateUrl: 'calendar-list.html',
  styleUrls: ['calendar-list.css']
})
export class PrivateCalendarListComponent {
  @Input() groupId: string;
  @Input() sourceType: number; // 0 - regular, 1 - wall
  @Input() showEditBtn: number;

  showButton: boolean[] = [];

  calendarBuildFlag: boolean = false;
  streamTasksRetrieved: boolean = false;

  view: string = 'month';
  viewDate: Date = new Date();
  events: AcademigEvent[] = [];

  constructor(private privateService: PrivateService,
              private activatedRoute: ActivatedRoute,
              private _router: Router) {}

  ngOnInit() {
    this.findTasks();
  }

  async findTasks() {
    this.streamTasksRetrieved = false;
    const calendar = await this.privateService.getCalendar(this.groupId);

    const tasks = calendar.tasks;
    const personal = calendar.personal;

    // console.log('personal',personal)
    // console.log('tasks',tasks)

    if (personal) {
      for (let _j = 0; _j <= personal.length-1; _j++) {
        const member = personal[_j];

        if (member.birthday) {
          this.events.push({
            title: '<u>Lab member birthday</u><br>' +
                   'Name: ' + member.name,
            color: colors.blue,
            // rrule: {
            //   freq: RRule.YEARLY,
            //   bymonth: moment().month() + 1,
            //   bymonthday: 10
            // }
            start: new Date(member.birthday),
            type: 0,
            groupIndex: null
          });
        }

        for (let _v = 0; _v <= member.vacations.length-1; _v++) {
          const vacation = member.vacations[_v];
          this.events.push({
            title: '<u>Lab member vacation</u><br>' +
                   'Name: ' + member.name + '<br>' +
                   'Location: ' + vacation.where,
            color: colors.blue,
            start: new Date(vacation.start),
            end: new Date(vacation.end),
            type: 1,
            groupIndex: null
          });
        }

      }
    }

    // this.tasks[0].group = this.userService.userPositions[0] ? this.userService.userPositions.filter(r => r.group.group._id==this.tasks[0]._id)[0].group : null;
    const meetings = tasks[0].meetings;

    if (meetings && meetings.length>0) {
      for (let _m = 0; _m <= meetings.length-1; _m++) {
        if (meetings[_m].activeFlag) {
          this.events.push({
            title: '<u>Lab seminar</u><br>' +
                   'Presenter: ' + meetings[_m].presenter.name + '<br>' +
                   'Lab: ' + tasks[0].groupIndex.group.name + '<br>' +
                   'Location: ' + meetings[_m].location + '<br>' +
                   'Topic: ' + (meetings[_m].topic ? meetings[_m].topic : 'unspecified'),
            color: colors.blue,
            start: new Date(meetings[_m].date),
            type: 2,
            groupIndex: null
          });
        }
      }
    }
    // <single-pic [pic]=meeting.presenter.pic [width]=32 [height]=32></single-pic>
    // <span class="text-muted">Date:</span> {{ meeting.date | date }}, {{ meeting.date | date:'HH:mm' }}
    // {{task.groupIndex.group.name}} <a class="btn btn-link p-0" [routerLink]="['/',task.groupIndex.university.link,task.groupIndex.department.link,task.groupIndex.group.link,'seminars']">view</a>

    const report = tasks[0].report;

    if (report) {
      this.events.push({
        title: '<u>Lab report</u><br>' +
               'Lab: ' + tasks[0].groupIndex.group.name + '<br>' +
               'Submission date: ' + new Date(tasks[0].report.submissionDate),
        color: colors.yellow,
        start: new Date(report.submissionDate),
        type: 3,
        groupIndex: null
      });
    }
    // {{task.groupIndex.group.name}} <a class="btn btn-link p-0" [routerLink]="['/',task.groupIndex.university.link,task.groupIndex.department.link,task.groupIndex.group.link,'private','reports']">view</a>
    // <span class="text-muted">Date:</span> {{ task.reportsItems.currentReport.submissionDate | date }}, {{ task.reportsItems.currentReport.submissionDate | date:'HH:mm' }}

    this.streamTasksRetrieved = true;
  }

  eventClicked({ event }: { event: AcademigEvent }): void {
    // console.log('Event clicked', event);
    switch (event.type) {
      case 0: { // Birthday
        this._router.navigate(['../personal-info'], { relativeTo: this.activatedRoute }); break;
      }
      case 1: { // Vacation
        this._router.navigate(['../personal-info'], { relativeTo: this.activatedRoute }); break;
      }
      case 2: { // Seminars
        this._router.navigate(['../seminars'], { relativeTo: this.activatedRoute }); break;
      }
      case 3: { // Reports
        this._router.navigate(['../reports'], { relativeTo: this.activatedRoute }); break;
      }
    }
  }

  buttonOver(showStatus: boolean, i: number) {
    if (this.showEditBtn) {
      this.showButton[i] = showStatus;
    }
  }

  calendarSlide(flag: boolean) {
    this.calendarBuildFlag = flag;
  }

}
