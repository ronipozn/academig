import {Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ActivatedRoute} from '@angular/router';

import * as moment from 'moment';

import {peopleReport, privateReportsItems, settingsReports, currentReport, PrivateService} from '../../../shared/services/private-service';
import {ReportItem, PeopleService} from '../../../shared/services/people-service';
import {objectMini} from '../../../shared/services/shared-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'private-assignments-list',
  templateUrl: 'assignments-list.html',
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' },
  styleUrls: ['assignments-list.css']
})
export class PrivateAssignmentsListComponent implements OnInit {
  @Input() groupId: string;
  @Input() sourceType: number; // 0 - regular, 1 - wall
  @Input() userStatus: number;
  @Input() userId: string;

  @Output() progress: EventEmitter <boolean> = new EventEmitter(true);

  pastYears: string[];

  reportsItems: privateReportsItems;

  actives: objectMini[] = [];
  alumnis: objectMini[] = [];

  personReports: ReportItem[] = [];
  yearPersonReports: ReportItem[] = [];

  validFlag = false; // valid date based on HowOften field

  profileName: string;
  profileId: string;

  streamRetrieved: boolean[] = [];
  alumniFlag = false;

  streamReports = true;

  streamRemindAll = 0;
  streamReport: number[];
  streamPastReport: number[];

  streamAddSchedule: number;

  reportsBuildFlag = false;

  singleReportBuildFlag = false;
  singleReportExtendFlag = false;

  reportSubmitFlag = false;
  reportSubmitNewFlag = false;

  reportSubmitIndex: number;

  settings: settingsReports;

  reportNewFlag = false;

  remindAllFlag = false;
  expiredFlag = false;

  fragment: string;

  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  constructor (private route: ActivatedRoute,
               private peopleService: PeopleService,
               private datepipe: DatePipe,
               private privateService: PrivateService) {}

  ngOnInit() {
    this.streamRetrieved = [false, false, false, false];

    this.getReports()
    this.peoplesFunc(0)
    this.peoplesFunc(1)

    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment
      this.scrollFunc()
    });
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
           case "manage": this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
      } catch (e) { }
    }, 1000);
  }

  async getReports() {
    this.reportsItems = await this.privateService.getPrivateReports(this.groupId, 0);

    if (this.reportsItems.currentReport) {
      this.streamReport = new Array(this.reportsItems.currentReport.whoSubmit.length).fill(0);
      this.validFlag = true;
      this.remindAllFlag = this.reportsItems.currentReport.whoSubmit.filter(x => x._id != this.userId && x.submitStatus == 0).length ? true : false;
      this.expiredFlag = (moment().isBefore(this.reportsItems.currentReport.submissionDate)) ? true : false;
    }

    this.streamRetrieved[0] = true;
  }

  async peoplesFunc(itemNum: number) {
    if (this.streamRetrieved[itemNum] == false) {

      const data = await this.peopleService.getPeoples(1, this.groupId, null, (itemNum == 1) ? 2 : 0, 1);

      if (itemNum == 0) {
        this.actives = data.filter(r=>r.pic!=null);
      } else if (itemNum == 1) {
        this.alumnis = data.filter(r=>r.pic!=null);
      }

      this.streamRetrieved[itemNum + 1] = true;

      if (itemNum==0 && this.actives.length>0) {
        this.changeId(this.actives[0]._id, this.actives[0].name);
      } else {
        this.streamRetrieved[3]=true;
      }

    }
  }

  // reportsSlide(mode: number, i: number, profileId: string) {
  reportsSlide(mode: number, i: number) {
    switch (mode) {
      case 0: { // Edit future reports
        this.reportsBuildFlag = true;
        break;
      }
      case 1: { // Cancel upcoming report
        this.submissionDateCalc(this.reportsItems.settings, 1);
        break;
      }
      case 2: { // Cancel all reports
        this.reportsDelete();
        break;
      }
      case 3: { // Send reminders to all
        this.remindUser(0, 1);
        break;
      }
      case 4: { // Edit current report details
        this.singleReportBuildFlag = true;
        this.singleReportExtendFlag = false;
        break;
      }
      case 5: { // Cancel "Edit Future Reports" Slide
        this.reportsBuildFlag = false;
        break;
      }
      case 6: { // Cancel "Single Report" Slide
        this.singleReportBuildFlag = false;
        break;
      }
      case 7: { // Extend current report submission
        this.singleReportBuildFlag = true;
        this.singleReportExtendFlag = true;
        break;
      }
      case 8: { // Finalize report submission
        this.reportFinalize();
        break;
      }
      case 9: { // Download all
        break;
      }
    }
  }

  async userAction(event, i: number) { // Applied for current submission
    switch (event[1]) {
      case 0: // Delete report
      case 1: // Resume submission
      case 2: // Skip submission

        this.streamReport[event[0]] = 3;

        await this.privateService.deletePrivateReportSubmit(this.groupId, event[1]);

        this.streamReport[event[0]] = 0;
        this.reportsItems.currentReport.whoSubmit[event[0]].submitStatus = (event[1] == 2) ? 2 : 0;
        this.reportsItems.currentReport.whoSubmit[event[0]].title = null;
        this.reportsItems.currentReport.whoSubmit[event[0]].file = null;

        break;

      case 3: // Download report

        break;

      case 4: // Submit report
      case 5: // ReSubmit report

        this.reportSubmitFlag = true;
        this.reportSubmitNewFlag = true;
        this.reportSubmitIndex = event[0];
        break;

      case 6: // Remind User

        this.remindUser(event[0], 0);
        break;

      case 7: // Cancel "Submit Report" Slide

        this.reportSubmitFlag = false;
        break;

    }
  }

  async pastReports(i: number, userId: string) {
    // this.personReports.filter(r => r._id==this.yearPersonReports[i]._id);

    this.streamPastReport[i] = 3;

    await this.privateService.deletePrivatePastReport(this.yearPersonReports[i]._id);

    this.streamPastReport[i] = 0;
    this.yearPersonReports.splice(i, 1);
  }

  async reportsUpdate(event) {
    let settingsReports: settingsReports;
    let currentReport: currentReport;
    let submissionDate: Date;

    settingsReports = {
                       'day': event.day,
                       'time': event.time,
                       'duration': event.duration,
                       'howOften': event.howOften,
                       'whoSubmit': event.participants,
                       'whoSee': event.whoSee
                      };

    submissionDate = this.upcomingDay(event.day).set({hour: parseInt(event.time.substr(0, 2)),minute: parseInt(event.time.substr(3, 2))}).toDate();

    currentReport = {
                     'submissionDate': submissionDate,
                     'whoSee': event.whoSee,
                     'whoSubmit': event.participants
                    };

    this.streamReports = false;

    if (this.reportsItems.currentReport) {

      await this.privateService.postPrivateReports(settingsReports, this.groupId);

      this.streamReports = true;
      this.reportsItems.settings = settingsReports;

    } else {

      await this.privateService.putPrivateReports(settingsReports, submissionDate, this.groupId);

      this.streamReports = true;
      this.reportsItems.settings = settingsReports;
      this.reportsItems.currentReport = currentReport;
      this.validFlag = true;
      this.remindAllFlag = currentReport.whoSubmit.filter(x => x._id != this.userId && x.submitStatus == 0).length ? true : false;
      this.expiredFlag = (moment().isBefore(this.reportsItems.currentReport.submissionDate)) ? true : false;
      this.streamReport = new Array(settingsReports.whoSubmit.length).fill(0);
      this.progress.emit(true);

    }

    this.reportsBuildFlag = false;
  }

  async reportsDelete() {
    this.streamReports = false;
    this.reportsItems.settings = null;
    this.reportsItems.currentReport = null;
    this.validFlag = false;

    await this.privateService.deletePrivateReports(this.groupId);

    this.streamReports = true,
    this.progress.emit(false)
  }

  async singleReportUpdate(event) {
    let submissionDate: Date;
    let currentReport: currentReport;

    submissionDate = moment(event.date).set({
                                             hour: parseInt(event.time.substr(0, 2)),
                                             minute: parseInt(event.time.substr(3, 2))
                                           }).toDate();

    let existwho: peopleReport;

    event.participants.forEach((participant, index) => {
      existwho = this.reportsItems.currentReport.whoSubmit.filter(r => r._id == participant._id)[0];
      if (existwho) { event.participants[index] = existwho; }
    });

    currentReport = {
                     'submissionDate': submissionDate,
                     'whoSee': event.whoSee,
                     'whoSubmit': event.participants
                    };

    await this.privateService.postSinglePrivateReport(currentReport, this.groupId, 0);

    this.reportsItems.currentReport = currentReport;
    this.expiredFlag = (moment().isBefore(this.reportsItems.currentReport.submissionDate)) ? true : false;
    this.singleReportBuildFlag = false;
  }

  async reportSubmit(event) {
    this.reportSubmitFlag = false;

    this.streamReport[this.reportSubmitIndex] = 3;

    await this.privateService.putPrivateReportSubmit(this.groupId, event.title, event.current, event.next, event.delay, event.file);

    this.streamReport[this.reportSubmitIndex] = 0,
    this.reportsItems.currentReport.whoSubmit[this.reportSubmitIndex].title = event.title;
    this.reportsItems.currentReport.whoSubmit[this.reportSubmitIndex].current = event.current;
    this.reportsItems.currentReport.whoSubmit[this.reportSubmitIndex].next = event.next;
    this.reportsItems.currentReport.whoSubmit[this.reportSubmitIndex].delay = event.delay;
    this.reportsItems.currentReport.whoSubmit[this.reportSubmitIndex].file = event.file;
    this.reportsItems.currentReport.whoSubmit[this.reportSubmitIndex].submitStatus = 1;
  }

  async reportFinalize() {
    const peopleReports: ReportItem[] = [];

    this.streamReports = false;

    this.reportsItems.currentReport.whoSubmit.forEach((who, index) => {
      peopleReports[index] = {
                            '_id': who._id, // pay attention who._id==peopleId just for PUT purposes, after PUT it would be a regaulr index ID.
                            'groupId': this.groupId,
                            'date': this.reportsItems.currentReport.submissionDate,
                            'title': who.title,
                            'file': who.file,
                            'submitStatus': who.submitStatus
                           }
    });

    await this.privateService.putPrivateReportFinalize(peopleReports, this.groupId);

    this.streamReports = true;

    const activeIndex: number = this.reportsItems.currentReport.whoSubmit.findIndex(r => r._id == this.profileId);

    // if (peopleReports[activeIndex].submitStatus>0) {
      // console.log('peopleReports[activeIndex]', peopleReports[activeIndex])
      if (!this.personReports) { this.personReports = []; }
      this.personReports.unshift(peopleReports[activeIndex]);
      this.pastYearsGenerator();
    // };

    this.submissionDateCalc(this.reportsItems.settings, 2);
  }

  async remindUser(loc: number, type: number) {
    let _ids: string[] = [];

    if (type == 0) {
      _ids =  [this.reportsItems.currentReport.whoSubmit[loc]._id];
      this.streamReport[loc] = 3;
      this.streamRemindAll = 2;
    } else if (type == 1) {
      loc = 0;
      this.streamRemindAll = 3;
      this.reportsItems.currentReport.whoSubmit.forEach((people, index) => {
        if (people.submitStatus == 0 && people._id != this.userId) {_ids.push(people._id)}
      });
    };

    await this.privateService.putPrivatReportRemind(_ids, this.groupId);

    if (type == 0) {
      this.streamReport[loc] = 1;
    }
    this.streamRemindAll = 0;
  }

  async submissionDateCalc(settings: settingsReports, type: number) { // howOften: number, duration: number, day: number, time: Date

    const currentDate = new Date();
    const weeksToAdd: number[] = [1, 2, 4];
    const subDate: Date = new Date(this.reportsItems.currentReport.submissionDate);
    let newDate: Date;

    const tempDate: Date = moment(subDate)
                           .set(
                                {
                                 day: settings.day,
                                 hour: parseInt(settings.time.substr(0, 2)),
                                 minute: parseInt(settings.time.substr(3, 2))
                                })
                           .add(weeksToAdd[settings.howOften], 'weeks').toDate();

    this.validFlag = true;

    switch (settings.duration) {
      case 0: { // Indefently
        newDate = tempDate
        break;
      }
      case 1: { // Till end of Current Year
        if (tempDate.getFullYear() <= currentDate.getFullYear()) {
          newDate = tempDate
        } else {
          this.validFlag = false;
        }
        break;
      }
      case 2: { // Till end of Current Month
        if (tempDate.getMonth() <= currentDate.getMonth() &&
            tempDate.getFullYear() <= currentDate.getFullYear()) {
          newDate = tempDate
        } else {
          this.validFlag = false;
        }
        break;
      }
    }

    if (this.validFlag == true) {
      // take into account settings.whoSee, settings.whoSubmit in order to take into accout upcoming settings changes.
      settings.whoSubmit.map(r => {r.submitStatus = 0, r.file = '', r.title = '0'}); // I'm not sure why this line is necessary

      const currentReport: currentReport = {
                                            'submissionDate': newDate,
                                            'whoSee': settings.whoSee,
                                            'whoSubmit': settings.whoSubmit
                                           };

      await this.privateService.postSinglePrivateReport(currentReport, this.groupId, type);

      this.reportsItems.currentReport = currentReport;
      this.expiredFlag = (moment().isBefore(this.reportsItems.currentReport.submissionDate)) ? true : false;
    }
  }

  async changeId(newId: string, newName: string) {
    if (newId != this.profileId) {
      this.profileName = newName;
      this.profileId = newId;
      this.streamRetrieved[3] = false;

      this.personReports = await this.peopleService.getPrivateReport(newId, this.groupId);

      this.streamPastReport = new Array(this.personReports.length).fill(0);
      this.pastYearsGenerator();
      this.streamRetrieved[3] = true;
    }
  }

  // showAlumni(element: HTMLInputElement): void {
    // console.log(`Checkbox ${element.value} was ${element.checked ? '' : 'un'}checked\n`)
    // this.alumniFlag = element.checked;
  // }

  pastYearsGenerator() {
    // generate years
    this.pastYears = this.personReports[0] ?
        this.uniq(this.personReports.map(r => this.datepipe.transform(r.date, 'yyyy'))).reverse() :
        null;

    // sort selected member reports for selected year
    if (this.pastYears) {this.onYearChange(this.pastYears[0])}
  }

  onYearChange(selectValue: string) {
    this.yearPersonReports = this.personReports
                             .filter(r => (this.datepipe.transform(r.date, 'yyyy') == selectValue));
  }

  uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
  }

  upcomingDay(dayINeed: number) {
    // if we haven't yet passed the day of the week that I need:
    // if (moment().isoWeekday() <= dayINeed) {
    if (moment().isoWeekday() < dayINeed) {
      // then just give me this week's instance of that day
      return(moment().isoWeekday(dayINeed));
    } else {
      // otherwise, give me next week's instance of that day
      return(moment().add(1, 'weeks').isoWeekday(dayINeed));
    }
  }

}
