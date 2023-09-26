import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';

import {privateMeeting} from '../../../shared/services/seminars-service';

@Component({
  selector: '[private-meeting-item]',
  templateUrl: 'meeting-item.html'
})
export class PrivateMeetingItemComponent implements OnChanges {
  @Input() meeting: privateMeeting;
  @Input() sourceType: number; // 0 - group, 1 - wall
  @Input() userStatus: number;
  @Input() userId: string;
  @Input() buttonType: number;
  @Input() stream: number;

  @Output() buttonClick: EventEmitter <number> = new EventEmitter(true);
  @Output() pdfSlideClick: EventEmitter <{flag: boolean, title: string, fileName: string}> = new EventEmitter(true);

  meFlag = false; // profile match active user Flag

  ngOnChanges() {
    if (this.meeting.presenter) {
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
    this.pdfSlideClick.emit({flag: true, title: title, fileName: fileName});
    // HTML of pdfSlide is one component up because of z-index issues
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
