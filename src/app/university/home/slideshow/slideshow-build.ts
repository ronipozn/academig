import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';

import {MissionService} from '../../services/mission-service';
import {objectMini, SharedService} from '../../../shared/services/shared-service';

@Component({
  selector: 'university-slideshow-build',
  templateUrl: 'slideshow-build.html'
})
export class UniversitySlideshowBuildComponent {
  streamRetrieved: boolean[];

  picModal: string;
  titleModal: string;

  picsIndex: number;
  picsNewFlag: boolean;
  picsAddFlag = false;

  streamPics: number[];

  picIndex: number;
  picNewFlag: boolean = false;
  picFlag: boolean = false;

  rowArr: number[] = [0,0,0];
  colArr: number[];

  constructor(public sharedService: SharedService,
              public missionService: MissionService) {}

  ngOnInit() {
    if (this.missionService.universityPics) {
      const x = Math.floor((this.missionService.universityPics.length-1)/3)+1;
      this.colArr = new Array(x).fill(0);
      this.streamPics = new Array(this.missionService.universityPics.length).fill(0);
    }
  }

  async galleryPicsUpdate(gallery) {
    this.picsAddFlag = false;

    if (!this.picsNewFlag) { // edit a single picture
      this.streamPics[this.picsIndex] = 3;

      const item: objectMini = {
                                '_id': this.missionService.universityPics[this.picsIndex]._id,
                                'name': gallery.text,
                                'pic': gallery.pic
                               };

      this.missionService.universityPics[this.picsIndex] = item;

      await this.sharedService.postShowcase(5, this.missionService.universityId, this.missionService.universityId, item);

    } else { // add multiple pictures

      // const picsCount = gallery[gallery.length - 2];
      const picsCount = gallery.substring(gallery.lastIndexOf("~") + 1,gallery.lastIndexOf("/"));
      const items: objectMini[] = [];

      for (let _i = 0; _i < picsCount; _i++) {
        items[_i] = { '_id': null, 'pic': gallery + 'nth/' + _i + '/', 'name': null };
      }

      for (const item of items) {
        this.missionService.universityPics.push(item);
      }

      var x = Math.floor((this.missionService.universityPics.length-1)/3)+1;
      this.colArr = new Array(x).fill(0);

      const newLen: number = items.length;
      let last: number;

      const data = await this.sharedService.putShowcase(5, this.missionService.universityId, this.missionService.universityId, items);

      last = this.missionService.universityPics.length - 1;
      for (const _id of data.reverse()) {
        this.missionService.universityPics[last]._id = _id;
        last += -1;
      }

    }
  }

  async picDelete(i: number) {
    const _id: string = this.missionService.universityPics[i]._id;
    var x: number;
    this.streamPics[i] = 3;

    const data = await this.sharedService.deleteShowcase(5, this.missionService.universityId, this.missionService.universityId, _id);

    this.missionService.universityPics.splice(i, 1);
    x = Math.floor((this.missionService.universityPics.length-1)/3)+1;
    this.colArr = new Array(x).fill(0);
    this.streamPics[i] = 0;
  }

  picsSlide(flag: boolean, i: number, newFlag: boolean) {
    this.picsAddFlag = flag;
    this.picsIndex = i;
    this.picsNewFlag = newFlag;
  }

}
