import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../../services/mission-service';
import {UserService} from '../../../user/services/user-service';
import {PeopleService} from '../../../shared/services/people-service';
import {Publication, PublicationService} from '../../../shared/services/publication-service';

@Component({
  selector: 'department-publications',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class DepartmentPublicationsComponent implements OnInit {
  stream: number[];
  streamFolder: number[];

  publications: Publication[] = [];

  streamRetrieved: boolean;
  streamMore: boolean;

  pdfSlideFlag = false;
  pdfTitle: string;
  pdfFileName: string;

  text: string;
  type: number;
  count = 0;
  more = 0;
  moreFlag = false;

  constructor(public titleService: Title,
              public peopleService: PeopleService,
              public userService: UserService,
              public publicationService: PublicationService,
              public missionService: MissionService) {}

  ngOnInit() {
    if (this.missionService.departmentId) {
      this.titleService.setTitle('Publications - ' + this.missionService.departmentTitle + ' | Academig');
    }

    this.findPublications()
  }

  async findPublications() {
    this.streamRetrieved = false;

    const publications = await this.publicationService.getPublications(this.missionService.searchFlag ? 14 : 10, this.missionService.departmentId, this.more, this.missionService.searchText);

    this.publications.push.apply(this.publications, publications);

    this.count = Number(this.publications[this.publications.length - 1]);
    this.publications.pop();
    this.moreFlag = this.count > ((this.more + 1) * 10);
    this.stream = new Array(this.publications.length).fill(0);
    this.streamFolder = new Array(this.publications.length).fill(0);
    this.streamMore = true;
    this.streamRetrieved = true;
  }

  async publicationFolder(event) {
    // streamPublicationsRead array is not Sorted
    // publications array is sorted

    // event[0] - itemId
    // event[1] - item location "on the screen"

    // const i: number = this.publications.findIndex(x => x._id == event[0]);
    // const toRead: string[] = this.publications[i].folders;

    this.streamFolder[event[1]] = 3;
    // await this.peopleService.toggleRead(0, 0, event[0], toRead);
    // this.publications[i].folders = toRead;
    this.streamFolder[event[1]] = 0;
    // this.userService.toggleRead(toRead, event[0], 0);
  }

  pdfSlide(event) {
    this.pdfSlideFlag = event.flag;

    if (event.flag == true) {
      this.pdfTitle = event.title;
      this.pdfFileName = event.fileName;
    }
  }

  showMoreFunc() {
    this.more += 1;
    this.streamMore = false;
    this.findPublications();
  }

}
