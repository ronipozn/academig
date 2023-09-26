import {Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ActivatedRoute} from '@angular/router';

import * as moment from 'moment';

import {privateMeeting, futureMeetingsItems, pastMeetingsItems, settingsMeetings, SeminarService} from '../../../shared/services/seminars-service';
import {objectMini} from '../../../shared/services/shared-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'private-meetings-list',
  templateUrl: 'meetings-list.html',
  styleUrls: ['meetings-list.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class PrivateMeetingsListComponent implements OnInit {
  @Input() groupId: string;
  @Input() sourceType: number; // 0 - regular, 1 - wall
  @Input() userStatus: number;
  @Input() userId: string;

  @Output() progress: EventEmitter <boolean> = new EventEmitter(true);

  pastYears: string[];

  pdfSlideFlag = false;
  pdfTitle: string;
  pdfFileName: string;

  futureMeetings: futureMeetingsItems;
  pastMeetings: pastMeetingsItems;
  yearPastMeetings: privateMeeting[];

  singleMeetingIndex: number;
  singleMeetingPlaceMode: number;
  singleMeetingNewFlag = false;
  singleMeetingBuildFlag = false;

  meetingNewFlag = false;
  meetingBuildFlag = false;

  streamRetrieved: boolean[] = [];
  streamMeetings: number;
  streamMeeting: number[] = [0];
  streamPastMeeting: number[] = [0];

  meetingsShown: number;

  fragment: string;

  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  constructor(private route: ActivatedRoute,
              private seminarService: SeminarService,
              private datepipe: DatePipe) {}

  async ngOnInit() {
    this.streamRetrieved = [false, false];

    this.futureMeetings = await this.seminarService.getMeetings(this.groupId, 0);

    this.streamRetrieved[0] = true;
    this.streamMeeting = new Array(this.futureMeetings.meetings.length).fill(0);
    if (this.futureMeetings.settings) {
      this.meetingsShown = (this.futureMeetings.settings.participants.length > 10) ? this.futureMeetings.settings.participants.length : 16;
    }

    this.pastMeetings = await this.seminarService.getMeetings(this.groupId, 1);

    this.pastYears = this.uniq(this.pastMeetings.meetings.map(r => this.datepipe.transform(r.date, 'yyyy'))).reverse(),
    this.onYearChange(this.pastYears[0]),
    this.streamPastMeeting = new Array(this.pastMeetings.meetings.length).fill(0);
    this.streamRetrieved[1] = true;

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

  onYearChange(selectValue: string) {
    this.yearPastMeetings = this.pastMeetings.meetings
                            .filter(r => (this.datepipe.transform(r.date, 'yyyy') == selectValue));

    // console.log(this.yearPastMeetings)
  }

  uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
  }

  meetingSlide(mode: number, i: number) {
    switch (mode) {
      case 9: { // Add Future Meetings
        this.meetingBuildFlag = true;
        this.meetingNewFlag = true;
        break;
      }
      case 2: { // Reschedule all
        this.meetingBuildFlag = true;
        this.meetingNewFlag = false;
        break;
      }
      case 0: { // Cancel all
        this.meetingsDelete();
        break;
      }



      case 7: { // Add Single Meeting
        this.singleMeetingBuildFlag = true;
        this.singleMeetingNewFlag = true;
        break;
      }
      case 3: { // Edit meeting details
        this.singleMeetingIndex = i
        this.singleMeetingPlaceMode = (i == 0) ? 0 : ((i == this.futureMeetings.meetings.length - 1) ? 2 : 1);
        this.singleMeetingBuildFlag = true;
        this.singleMeetingNewFlag = false;
        break;
      }
      case 1: { // Cancel meeting
        this.singleMeetingPost(i, 0);
        break;
      }
      case 11: { // Resume meeting
        this.singleMeetingPost(i, 1);
        break;
      }
      case 12: { // Delete future meeting
        this.singleMeetingDelete(i, 0);
        break;
      }
      case 4: { // Delete past meeting
        this.singleMeetingDelete(i, 1);
        break;
      }



      case 8: { // Cancel Single Meeting Slide
        this.singleMeetingBuildFlag = false;
        break;
      }
      case 10: { // Cancel Future Meetings Slide
        this.meetingBuildFlag = false;
        break;
      }
    }
  }

  meetingsCreate(event) {
    let settingsMeetings: settingsMeetings;

    if (this.meetingNewFlag == false) this.futureMeetings.meetings.splice(1);

    settingsMeetings = {
                        'location': event.location,
                        'time': event.time,
                        'startDate': event.start,
                        'endDate': event.end,
                        // "duration": event.duration,
                        'howOften': event.howOften,
                        'howToAdd': event.howToAdd,
                        'day': event.day,
                        'secondDay': event.secondDay,
                        'order': event.order,
                        'participants': event.participants
                       };

    this.populateMeetings(settingsMeetings, this.futureMeetings.meetings[0] ? this.futureMeetings.meetings[0]._id + 1 : 0);

    this.meetingBuildFlag = false;
  }

  async meetingsDelete() {
    await this.seminarService.deleteMeetings(this.futureMeetings.meetings[0]._id, this.groupId);

    this.futureMeetings.meetings.splice(1);
    this.progress.emit(false);
  };

  async singleMeetingPut(event) {
    this.singleMeetingBuildFlag = false;

    const updateDate: Date = moment(event.date).set({
                                                     hour: parseInt(event.time.substr(0, 2)),
                                                     minute: parseInt(event.time.substr(3, 2))
                                                   }).toDate();

    const meeting: privateMeeting = {
                                   '_id': this.singleMeetingNewFlag ? 1 : this.futureMeetings.meetings[this.singleMeetingIndex]._id,
                                   'date': updateDate,
                                   'location': event.location,
                                   'presenter': event.presentor,
                                   'topic': event.topic,
                                   'files': event.files,
                                   'activeFlag': true
                                  };

    if (this.singleMeetingNewFlag == true) {
      this.futureMeetings.meetings.push(meeting);
    } else {
      this.futureMeetings.meetings[this.singleMeetingIndex] = meeting;
    }

    this.streamMeeting[this.singleMeetingIndex] = 3,

    await this.seminarService.putSingleMeeting(meeting, this.groupId);

    this.streamMeeting[this.singleMeetingIndex] = 0;
  }

  async singleMeetingPost(i: number, j: number) {
    this.streamMeeting[i] = 3;

    await this.seminarService.postSingleMeeting(this.futureMeetings.meetings[i]._id, this.groupId, j);

    this.streamMeeting[i] = 0;

    if (j == 0) { // Cancel meeting
      this.futureMeetings.meetings[i].activeFlag = false;
    } else if (j == 1) { // Resume meeting
      this.futureMeetings.meetings[i].activeFlag = true;
    }
  };

  async singleMeetingDelete(i: number, type: number) {
    let _id: number;

    if (type == 0) {
      _id = this.futureMeetings.meetings[i]._id;
      this.streamMeeting[i] = 3;
    } else {
      _id = this.pastMeetings.meetings[i]._id;
      this.streamPastMeeting[i] = 3;
    }

    await this.seminarService.deleteSingleMeeting(_id, this.groupId, type);

    if (type == 0) {
      this.futureMeetings.meetings.splice(i, 1);
      this.streamMeeting[i] = 0;
    } else {
      this.pastMeetings.meetings.splice(i, 1);
      this.streamPastMeeting[i] = 0;
      this.onYearChange(this.pastYears[0]);
    }
  };

  async populateMeetings(settings: settingsMeetings, f: number) {
    const currentDate: Date = new Date();
    const daysToAdd: number[] = [1, 0, 0, 0, 0];
    const weeksToAdd: number[] = [0, 0, 1, 2, 4];
    let _i = 0;
    let _j = 0;
    let nextDay: number;
    let nextDate: Date;
    let endDate: Date;
    let participantsShuffled: objectMini[];

    // fix Second Day because it always excludes the day of the First Day
    const secondDayFix: number = settings.secondDay + ((settings.secondDay >= settings.day) ? 1 : 0);

    // How to Add
    if (settings.howToAdd == 0) { // Randmoize
      participantsShuffled = settings.participants
        .map((a) => ({sort: Math.random(), value: a}))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value)
    } else { // By last name
      participantsShuffled = settings.participants.sort((a, b) => a.name.localeCompare(b.name));
    }

    // How Often
    if (settings.howOften >= 1) {
      nextDate = this.upcomingDay(settings.day, settings.startDate).toDate();
    } else {
      nextDate = moment(settings.startDate).toDate();
      for (let _j = 0; _j < 2; _j++) {
        if (moment(nextDate).day() == secondDayFix || moment(nextDate).day() == settings.day) {
          nextDate = moment(nextDate).add(daysToAdd[settings.howOften], 'days').toDate();
        }
      }
    };

    // Set Time
    nextDate = moment(nextDate).set({
                                     hour: parseInt(settings.time.substr(0, 2)),
                                     minute: parseInt(settings.time.substr(3, 2))
                                   }).toDate();

    endDate = moment(settings.endDate).toDate();

    this.meetingsShown = (settings.participants.length > 10) ? settings.participants.length : 16;

    while (_i < 200 && nextDate < endDate) {
    // while (
    //        _i<100 &&
    //        (nextDate.getMonth()<=currentDate.getMonth() || settings.duration!=0) &&
    //        (nextDate.getFullYear()<=currentDate.getFullYear() || settings.duration==2) &&
    //        (nextDate.getFullYear()<=new Date(new Date().setFullYear(new Date().getFullYear() + 1)).getFullYear() || settings.duration!=2)
    //       ){

      this.futureMeetings.meetings.push({
                                        // "_id": (f+_i).toString(),
                                        '_id': (f + _i),
                                        'date': nextDate,
                                        'location': settings.location,
                                        'presenter': participantsShuffled[_i % settings.participants.length],
                                        'topic': null,
                                        'files': null,
                                        'activeFlag': true
                                       })

      _i++;

      if (settings.howOften > 1) {
        nextDate = moment(nextDate)
                   .add(weeksToAdd[settings.howOften], 'weeks').toDate();

      } else if (settings.howOften == 1) { // twice a week
        nextDay = (_j % 2 == 0) ? secondDayFix : settings.day;
        nextDate = this.upcomingDay(nextDay, nextDate).toDate();
        _j++;

      } else if (settings.howOften == 0) { // daily (exclude 2 days)
        nextDate = moment(nextDate).add(daysToAdd[settings.howOften], 'days').toDate();
        for (let _j = 0; _j < 2; _j++) {
          if (moment(nextDate).day() == secondDayFix || moment(nextDate).day() == settings.day) {
            nextDate = moment(nextDate).add(daysToAdd[settings.howOften], 'days').toDate();
          }
        }
      }

    }

    this.streamMeeting = new Array(this.futureMeetings.meetings.length).fill(0);

    // to include everyone in the last round
    for (let _j = 0; _j < _i % settings.participants.length; _j++) {
      this.futureMeetings.meetings.pop()
    }

    this.streamMeetings = 3;

    await this.seminarService.putMeetings(settings, this.futureMeetings.meetings, this.groupId);

    this.streamMeetings = 0;
    this.futureMeetings.settings = settings;
    this.progress.emit(true);
  }

  upcomingDay(dayINeed: number, date: Date) {
    // if we haven't yet passed the day of the week that I need:
    if (moment(date).isoWeekday() <= dayINeed) {
      // then just give me this week's instance of that day
      return(moment(date).isoWeekday(dayINeed));
    } else {
      // otherwise, give me next week's instance of that day
      return(moment(date).add(1, 'weeks').isoWeekday(dayINeed));
    }
  }

  pdfSlide(event) {
    this.pdfSlideFlag = event.flag;
    if (event.flag == true) {
      this.pdfTitle = event.title;
      this.pdfFileName = event.fileName;
    }
  }

  alphabetizer(names) {
    return names.map(function(name) {
      const full = name.split(' '),
        last = full.pop();
      return last + ', ' + full.join(' ');
    }).sort();
  }

}
