import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs/Subscription';

import {MissionService} from '../../services/mission-service';
import {Talk, Poster, Press, MediaService} from '../../../shared/services/media-service';

@Component({
  selector: 'department-media',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class DepartmentMediaComponent implements OnInit {
  talks: Talk[] = [];
  posters: Poster[] = [];
  presses: Press[] = [];

  streamTalk: number[];
  streamPoster: number[];
  streamPress: number[];

  activeTab: number;
  streamRetrieved: boolean[] = [false, false, false];

  pdfSlideFlag = false;
  fileTitle: string;
  fileName: string;

  streamMore: boolean;

  count: number[] = [0, 0, 0];
  more: number[] = [0, 0, 0];
  moreFlag = false;

  tabs = ['Talks', 'Posters', 'Press'];

  constructor(public titleService: Title,
              public mediaService: MediaService,
              public missionService: MissionService) {

  }

  ngOnInit() {
    if (this.missionService.departmentId) {
      this.titleService.setTitle('Media - ' + this.missionService.departmentTitle + ' | Academig');
      this.activeTab = 0;
      this.mediaFunc(this.activeTab)
    }
  }

  async mediaFunc(tabNum: number) {
    this.activeTab = tabNum;

    if (this.streamRetrieved[tabNum] == false) {
      const data = await this.mediaService.getMedia(this.missionService.searchFlag ? 5 : 4, this.missionService.departmentId, tabNum, 0, this.more[this.activeTab], this.missionService.searchText);

      if (tabNum == 0) {
        this.talks = data;
        this.count[tabNum] = Number(this.talks[this.talks.length - 1]);
        this.talks.pop();
        this.streamTalk = new Array(this.talks.length).fill(0);
      } else if (tabNum == 1) {
        this.posters = data;
        this.count[tabNum] = Number(this.posters[this.posters.length - 1]);
        this.posters.pop();
        this.streamPoster = new Array(this.posters.length).fill(0);
      } else if (tabNum == 2) {
        this.presses = data;
        this.count[tabNum] = Number(this.presses[this.presses.length - 1]);
        this.presses.pop();
        this.streamPress = new Array(this.presses.length).fill(0);
      }

      this.streamRetrieved[tabNum] = true;
      this.moreFlag = this.count[tabNum] > ((this.more[tabNum] + 1) * 10);
      this.streamMore = true;
    }
  }

  showMoreFunc() {
    this.streamRetrieved[this.activeTab] = false;
    this.more[this.activeTab] += 1;

    this.streamMore = false;
    this.mediaFunc(this.activeTab);
  }

  showTabFunc(t: number) {
    this.streamMore = false;
    if (this.more[t]==0) this.mediaFunc(t);
  }

  pdfSlide(flag: boolean, event) {
    this.pdfSlideFlag = flag;
    if (flag == true) {
      this.fileTitle = event.title;
      this.fileName = event.fileName;
    }
  }

}
