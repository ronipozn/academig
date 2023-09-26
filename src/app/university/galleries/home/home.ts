import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../../services/mission-service';

import {Gallery, GalleryService} from '../../../shared/services/gallery-service';

@Component({
  selector: 'university-galleries',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class UniversityGalleriesComponent implements OnInit {

  constructor(private titleService: Title,
              private galleryService: GalleryService,
              public missionService: MissionService) { }

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
    if (this.missionService.universityId) {
      this.titleService.setTitle('Galleries - ' + this.missionService.universityName + ' | Academig');
    }

    this.findGalleries()
  }

  async findGalleries() {
    this.streamRetrieved = false;

    const galleries = await this.galleryService.getGalleries(this.missionService.universityId, this.missionService.searchFlag ? 6 : 5, this.more, this.missionService.searchText);

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
