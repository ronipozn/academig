import {Component, OnInit}                 from '@angular/core';
import {Title}                             from '@angular/platform-browser';
import {Subscription}                      from 'rxjs/Subscription';
import {Router}                            from '@angular/router';

import {UserService}                       from '../../user/services/user-service';
import {titlesTypes, PeopleService}        from '../../shared/services/people-service';
import {groupComplex}                      from '../../shared/services/shared-service';
import {OpenPosition, OpenPositionService} from '../../shared/services/position-service';

import {itemsAnimation}                    from '../../shared/animations/index';

import {CalendarEvent}                     from 'angular-calendar';

// import RRule from 'rrule';

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
  _id: string;
}

function getTimezoneOffsetString(date: Date): string {
  const timezoneOffset = date.getTimezoneOffset();
  const hoursOffset = String(
    Math.floor(Math.abs(timezoneOffset / 60))
  ).padStart(2, '0');
  const minutesOffset = String(Math.abs(timezoneOffset % 60)).padEnd(2, '0');
  const direction = timezoneOffset > 0 ? '-' : '+';

  return `T00:00:00${direction}${hoursOffset}:${minutesOffset}`;
}

interface RecurringEvent {
  title: string;
  color: any;
  rrule?: {
    freq: any;
    bymonth?: number;
    bymonthday?: number;
    byweekday?: any;
  };
}

// changeDetection: ChangeDetectionStrategy.OnPush,
@Component({
    selector: 'calendar',
    templateUrl: 'calendar.html',
    styleUrls: ['calendar.css'],
    animations: [itemsAnimation],
    host: { '[@itemsAnimation]': '' }
})
export class CalendarComponent implements OnInit {
  streamTasksRetrieved: boolean = false;
  streamApplicationsRetrieved: boolean = false;

  titlesTypes = titlesTypes;
  positionSteps: string[] = ['Submission deadline',
                             'Submission answers',
                             'Online interviews - Start',
                             'Online interviews - End',
                             'Online interviews answers',
                             'In-person interviews - Start',
                             'In-person interviews - End',
                             'Final decision date',
                             'Start date'];

  view: string = 'month';
  viewDate: Date = new Date();
  events: AcademigEvent[] = [];

  mode: number = 1;

  constructor(private titleService: Title,
              private userService: UserService,
              private peopleService: PeopleService,
              private openPositionService: OpenPositionService,
              private _router: Router) {
    this.titleService.setTitle('Calendar | Academig');
  }

  ngOnInit() {
    this.findTasks();
    this.findOpenPositions();
  }

  async findTasks() {
    this.streamTasksRetrieved = false;
    const calendar = await this.peopleService.getCalendar();
    const tasks = calendar.tasks;
    const personal = calendar.personal;

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
            groupIndex: null,
            _id: member._id
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
            groupIndex: null,
            _id: member._id
          });

        }
      }
    }

    for (let _j = 0; _j <= tasks.length-1; _j++) {

      // this.tasks[_j].group = this.userService.userPositions[0] ? this.userService.userPositions.filter(r => r.group.group._id==this.tasks[_j]._id)[0].group : null;
      const meetings = tasks[_j].meetings;

      if (meetings && meetings.length>0) {
        for (let _m = 0; _m <= meetings.length-1; _m++) {
          if (meetings[_m].activeFlag) {
            this.events.push({
              title: '<u>Lab seminar</u><br>' +
                     'Presenter: ' + meetings[_m].presenter.name + '<br>' +
                     'Lab: ' + tasks[_j].groupIndex.group.name + '<br>' +
                     'Location: ' + meetings[_m].location + '<br>' +
                     'Topic: ' + (meetings[_m].topic ? meetings[_m].topic : 'unspecified'),
              color: colors.blue,
              // type: "Lab Seminars",
              start: new Date(meetings[_m].date),
              type: 2,
              groupIndex: tasks[_j].groupIndex,
              _id: null
            });
          }
        }
      }
      // <single-pic [pic]=meeting.presenter.pic [width]=32 [height]=32></single-pic>
      // <a [routerLink]="['people',meeting.presenter._id]">{{ meeting.presenter.name }}</a>
      // <span class="text-muted">Date:</span> {{ meeting.date | date }}, {{ meeting.date | date:'HH:mm' }}
      // <span class="text-muted">Date:</span> {{ meeting.date | date }}, {{ meeting.date | date:'HH:mm' }}
      // {{task.groupIndex.group.name}} <a class="btn btn-link p-0" [routerLink]="['/',task.groupIndex.university.link,task.groupIndex.department.link,task.groupIndex.group.link,'seminars']">view</a>

      const report = tasks[_j].report;

      if (report) {
        this.events.push({
          title: '<u>Lab report</u><br>' +
                 'Lab: ' + tasks[_j].groupIndex.group.name + '<br>' +
                 'Submission date: ' + new Date(tasks[0].report.submissionDate),
          color: colors.yellow,
          start: new Date(report.submissionDate),
          type: 3,
          groupIndex: tasks[_j].groupIndex,
          _id: null
        });
      }
      // {{task.groupIndex.group.name}} <a class="btn btn-link p-0" [routerLink]="['/',task.groupIndex.university.link,task.groupIndex.department.link,task.groupIndex.group.link,'private','reports']">view</a>
      // <span class="text-muted">Date:</span> {{ task.reportsItems.currentReport.submissionDate | date }}, {{ task.reportsItems.currentReport.submissionDate | date:'HH:mm' }}

    };

    this.streamTasksRetrieved = true;
  }

  async findOpenPositions() {
    const applications: OpenPosition[][] = [[]];

    this.streamApplicationsRetrieved = false;

    const positions: OpenPosition[] = await this.openPositionService.getPositions(0, null, 2);

    applications[0] = positions.filter(r => r.apply[0].status<100 && r.apply[0].status>9);
    applications[1] = positions.filter(r => r.apply[0].status==1);

    // console.log('applications',applications)

    for (let _i = 0; _i <= 1; _i++) {
      for (let _j = 0; _j <= applications[_i].length-1; _j++) {
        for (let _m = 0; _m <= applications[_i][_j].stepsDates.length-1; _m++) {
          if (applications[_i][_j].stepsDates[_m]) {
            // console.log('kkk',_j,applications[_i][_j])
            this.events.push({
              title: '<u>Application</u><br>' +
                     this.positionSteps[_m] + '<br>' +
                     'Title: ' + applications[_i][_j].title + '<br>' +
                     'Position: ' + this.titlesTypes[applications[_i][_j].position] + '<br>' +
                     'Lab: ' + applications[_i][_j].group.group.name + '<br>',
              color: colors.yellow,
              // type: (_i==0) ? "Applications" : "Jobs posting watchlist",
              start: new Date(applications[_i][_j].stepsDates[_m]),
              type: 4,
              groupIndex: applications[_i][_j].group,
              _id: applications[_i][_j]._id
            });
          }
        }
      }
    }

    this.streamApplicationsRetrieved = true;
  }

  // <div class="card" [@itemsAnimation]="('active')">
  //   <div class="card-header mb-0 pb-2">Active Applications</div>
  //   <div *ngIf="streamApplicationsRetrieved" class="card-body">
  //     <p *ngIf="applications[0]?.length==0" class="text-muted mb-0">The applications list is empty.</p>
  //     <ng-container *ngFor="let application of applications[0]">
  //       <h5 class="mb-0">{{application.title}}</h5>
  //       <ng-container *ngFor="let date of application.stepsDates; let i=index">
  //         <ng-container *ngIf="date">
  //           <div>{{ positionStepsTitle[i] }}: {{ date[i] | date:'dd MMM y' }}</div>
  //         </ng-container>
  //       </ng-container>
  //     </ng-container>
  //   </div>
  // </div>
  // <a class="btn btn-link" [routerLink]="['/',task.group.university.link,task.group.department.link,task.group.group.link]">{{task.group.group.name}}</a>

  // <div class="card mt-0" [@itemsAnimation]="('active')">
  //   <div class="card-header mb-0 pb-2">Jobs Posting Watchlist</div>
  //   <div *ngIf="streamApplicationsRetrieved" class="card-body">
  //     <p *ngIf="applications[1]?.length==0" class="text-muted mb-0">The jobs posting watchlist is empty</p>
  //     <ng-container *ngFor="let application of applications[1]">
  //       <h5 class="mb-0">{{application.title}}</h5>
  //       <ng-container *ngFor="let date of application.stepsDates; let i=index">
  //         <ng-container *ngIf="date">
  //           <div>{{ positionStepsTitle[i] }}: {{ date[i] | date:'dd MMM y' }}</div>
  //         </ng-container>
  //       </ng-container>
  //     </ng-container>
  //   </div>
  // </div>
  // <a class="btn btn-link" [routerLink]="['/',task.group.university.link,task.group.department.link,task.group.group.link]">{{task.group.group.name}}</a>

  eventClicked({ event }: { event: AcademigEvent }): void {
    switch (event.type) {
      case 0: { // Birthday
        this._router.navigate(['people',event._id]); break;
      }
      case 1: { // Vacation
        this._router.navigate(['people',event._id]); break;
      }
      case 2: { // Seminars
        this._router.navigate([event.groupIndex.university.link,event.groupIndex.department.link,event.groupIndex.group.link,'private','seminars']); break;
      }
      case 3: { // Reports
        this._router.navigate([event.groupIndex.university.link,event.groupIndex.department.link,event.groupIndex.group.link,'private','reports']); break;
      }
      case 4: { // Applications
        this._router.navigate([event.groupIndex.university.link,event.groupIndex.department.link,event.groupIndex.group.link,'jobs',event._id]); break;
      }
    }
  }

  listClicked(event) {
    switch (event.type) {
      case 0: { // Birthday
        this._router.navigate(['people',event._id]); break;
      }
      case 1: { // Vacation
        this._router.navigate(['people',event._id]); break;
      }
      case 2: { // Seminars
        this._router.navigate([event.groupIndex.university.link,event.groupIndex.department.link,event.groupIndex.group.link,'private','seminars']); break;
      }
      case 3: { // Reports
        this._router.navigate([event.groupIndex.university.link,event.groupIndex.department.link,event.groupIndex.group.link,'private','reports']); break;
      }
      case 4: { // Applications
        this._router.navigate([event.groupIndex.university.link,event.groupIndex.department.link,event.groupIndex.group.link,'jobs',event._id]); break;
      }
    }
  }

}
