import {Component, OnInit, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../../services/mission-service';
import {PeopleService} from '../../../shared/services/people-service';
import {UserService} from '../../../user/services/user-service';
import {Publication, PublicationService} from '../../../shared/services/publication-service';

@Component({
  selector: 'university-publications',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class UniversityPublicationsComponent implements OnInit {
  stream: number[];
  streamFolder: number[];

  publications: Publication[] = [];

  publicationPDFFlag = false;

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
    if (this.missionService.universityId) {
      this.titleService.setTitle('Publications - ' + this.missionService.universityName + ' | Academig');
    }

    this.findPublications()
  }

  async findPublications() {
    this.streamRetrieved = false;

    const publications = await this.publicationService.getPublications(this.missionService.searchFlag ? 15 : 12, this.missionService.universityId, this.more, this.missionService.searchText);

    if (publications) {
      this.publications.push.apply(this.publications, publications);

      this.count = Number(this.publications[this.publications.length - 1]);
      this.publications.pop();
      this.moreFlag = this.count > ((this.more + 1) * 10);
      this.streamMore = true;
      this.stream = new Array(this.publications.length).fill(0);
      this.streamFolder = new Array(this.publications.length).fill(0);

    } else {

      this.publications = [];

    }

    this.streamRetrieved = true;
  }

  async publicationFolder(event) {
    // streamPublicationsFolder array is not Sorted
    // publications array is sorted

    // event[0] - itemId
    // event[1] - item location "on the screen"

    // const i: number = this.publications.findIndex(x => x._id == event[0]);
    // const folders: string[] = this.publications[i].folders;

    this.streamFolder[event[1]] = 3;
    // await this.peopleService.toggleFollow(0, 0, event[0], toRead);
    // this.publications[i].folders = folders;
    this.streamFolder[event[1]] = 0;
    // this.userService.toggleFollow(toRead, event[0], "publication");
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
