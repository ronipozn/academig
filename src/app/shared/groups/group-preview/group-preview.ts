import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';

import {GroupSize, CompanySize, Group} from '../../services/group-service';
import {itemsAnimation} from '../../animations/index';

import {NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation} from 'ngx-gallery';

@Component({
  selector: 'group-preview',
  templateUrl: 'group-preview.html',
  styleUrls: ['group-preview.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupPreviewComponent implements OnInit {
  @Input() group: Group;

  @Output() buttonInterestsClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonCloseClick: EventEmitter <boolean> = new EventEmitter();

  streamProjects: boolean[];
  streamResources: boolean[];
  streamPositions: boolean[];

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];

  pic = 'https://web.stanford.edu/group/axelrodlab/images/labparty2017.jpg';

  sizeRange: string;
  groupSize = GroupSize;
  companySize = CompanySize;

  buttonInterestsFunc(i: number): void {
    this.buttonInterestsClick.emit(i);
  }

  buttonCloseFunc(): void {
    this.buttonCloseClick.emit(true);
  }

  ngOnInit() {
    // console.log("555",this.group)
    if (this.group.projects) this.streamProjects = new Array(this.group.projects.length).fill(0);
    if (this.group.resources) this.streamResources = new Array(this.group.resources.length).fill(0);
    if (this.group.positions) this.streamPositions = new Array(this.group.positions.length).fill(0);

    if (this.group.size) {
      // this.labFlag
      this.sizeRange = 1 ? this.groupSize[this.groupSize.findIndex(y => y.id == this.group.size)].name : this.companySize[this.companySize.findIndex(y => y.id == this.group.size)].name;
    }

    // if (this.missionService.departmentPics) {
      // this.missionService.departmentPics.forEach((item, index) => {
        this.galleryImages.push({
          small: this.group.pic,
          medium: this.group.pic,
          big: this.group.pic
        })
      // });
    // }

    this.galleryOptions = [
      {
        width: '100%',
        height: '275px',
        thumbnails: false,
        imageAnimation: NgxGalleryAnimation.Slide
      },
      // max-width 800
      {
        thumbnails: false,
        breakpoint: 800,
        width: '100%',
        height: '275px',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      // max-width 400
      {
        thumbnails: false,
        breakpoint: 400,
        preview: false
      }
    ];
  }

}
