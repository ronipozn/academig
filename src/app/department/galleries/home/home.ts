import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../../services/mission-service';

import {Gallery, GalleryService} from '../../../shared/services/gallery-service';

@Component({
  selector: 'department-galleries',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class DepartmentGalleriesComponent implements OnInit {

  constructor(private titleService: Title,
              private galleryService: GalleryService,
              public missionService: MissionService) {
  }

  stream: number[];
  galleries: Gallery[] = [];
  streamRetrieved: boolean;
  streamMore: boolean;

  text: string;
  type: number;
  count = 0;
  more = 0;
  moreFlag = false;

  ngOnInit() {
    if (this.missionService.departmentId) {
      this.titleService.setTitle('Galleries - ' + this.missionService.departmentTitle + ' | Academig');
    }

    this.findGalleries()
  }

  async findGalleries() {
    this.streamRetrieved = false;

    const galleries = await this.galleryService.getGalleries(this.missionService.departmentId, this.missionService.searchFlag ? 4 : 3, this.more, this.missionService.searchText);

    if (galleries) {
      this.galleries.push.apply(this.galleries, galleries);

      this.count = Number(this.galleries[this.galleries.length - 1]);
      this.galleries.pop();
      this.moreFlag = this.count > ((this.more + 1) * 10);
      this.streamMore = true;
      this.streamRetrieved = true;
      this.stream = new Array(this.galleries.length).fill(0);
    } else {
      this.galleries = [],
      this.streamRetrieved = true
    }
  }

  showMoreFunc() {
    this.more += 1;
    this.streamMore = false;
    this.findGalleries();
  }

}
