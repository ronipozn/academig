import { Component, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';

import {GroupCompare} from '../../shared/services/group-service';
import {UserService} from '../../user/services/user-service';
import {People, titlesTypes} from '../../shared/services/people-service';

@Component({
  selector: '[compare-people]',
  templateUrl: 'compare-people.html',
  styleUrls: ['compare-people.css']
})
export class ComparePeopleComponent {
  @Input() countsMembers: number[];
  @Input() countsAlumni: number[];
  @Input() peopleInput: People[] = [];
  @Input() index: number;

  titlesSelect = titlesTypes;
  titlesCategories: string[] = ['Staff','Postdoc','Phd','Msc','Bsc'];

  peoples: People[] = [];
  memberIndex: number;

  streamFollow: number[] = [];

  @ViewChild('togglePeoplesModal', { static: false }) togglePeoples: ElementRef;

  constructor(public userService: UserService) { }

  ngOnInit() { }

  openPeoplesModalFunc(i: number, index: number) {
    this.peoples = [];
    this.memberIndex = i;

    let title: number;
    let alumniFlag: boolean;
    const that = this;

    this.peopleInput.map(function(p) {
      title = p.positions[0].titles[0];
      alumniFlag = p.positions[0].period.mode==0;
      switch (true) {
        case (title < 200): // Staff
          if (i==0 && ((!alumniFlag && index==0) || (alumniFlag && index==1))) that.peoples.push(p); break;
        case (title < 300): // Postdoc
          if (i==1 && ((!alumniFlag && index==0) || (alumniFlag && index==1))) that.peoples.push(p); break;
        case (title == 301): // Phd
          if (i==2 && ((!alumniFlag && index==0) || (alumniFlag && index==1))) that.peoples.push(p); break;
        case (title == 300): // Msc
          if (i==3 && ((!alumniFlag && index==0) || (alumniFlag && index==1))) that.peoples.push(p); break;
        case (title < 500): // Undergraduate
          if (i==4 && ((!alumniFlag && index==0) || (alumniFlag && index==1))) that.peoples.push(p); break;
        default:
          break;
      }
    })

    that.streamFollow = new Array(that.peoples.length).fill(0);
    this.togglePeoples.nativeElement.click();
  }

}
