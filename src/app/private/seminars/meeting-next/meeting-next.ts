import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';

import {privateMeeting} from '../../../shared/services/seminars-service';

@Component({
  selector: 'private-meeting-next',
  templateUrl: 'meeting-next.html',
  styleUrls: ['meeting-next.css']
})
export class PrivateMeetingNextComponent implements OnChanges {
  @Input() meeting: privateMeeting;
  @Input() sourceType: number; // 0 - group, 1 - wall
  @Input() userStatus: number;
  @Input() userId: string;
  @Input() streamRetrieved: boolean;
  @Input() stream: number;

  @Output() buttonClick: EventEmitter <number> = new EventEmitter(true);
  @Output() pdfClick: EventEmitter <{}> = new EventEmitter();

  meFlag = false; // profile match active user Flag

  ngOnChanges() {
    if (this.meeting) {
      this.meFlag = (this.userId == this.meeting.presenter._id)
    }
  }

  buttonFunc(i: number): void {
    this.buttonClick.emit(i);
  }

  isPDF(name: string) {
    return name.split('.').pop() == 'pdf';
  }

  pdfSlide(title: string, fileName: string) {
    this.pdfClick.emit({flag: true, title: title, fileName: fileName});
  }

  createRange(groupName: string) {
    // const picsCount = Number(groupName[groupName.length - 2]);
    const picsCount = Number(groupName.substring(groupName.lastIndexOf("~") + 1,groupName.lastIndexOf("/")));

    const items: number[] = [];
    for (let i = 1; i <= picsCount; i++) {
       items.push(i);
    }
    return items;
  }

  createFile(groupName: string, i: number) {
    return (groupName + 'nth/' + i + '/');
  }

}
