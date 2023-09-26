import {Component, OnInit, OnDestroy, ElementRef, ViewChild} from '@angular/core';

import {MissionService} from '../../services/mission-service';
import {objectMini, SharedService} from '../../../shared/services/shared-service';

@Component({
  selector: 'department-slideshow-build',
  templateUrl: 'slideshow-build.html'
})
export class DepartmentSlideshowBuildComponent {
  picModal: string;
  titleModal: string;

  picsIndex: number;
  picsNewFlag: boolean;
  picsAddFlag = false;

  streamPics: number[];

  picIndex: number;
  picNewFlag: boolean = false;
  picFlag: boolean = false;

  constructor(public sharedService: SharedService,
              public missionService: MissionService) {}

  ngOnInit() {
    if (this.missionService.departmentPics) {
      // const x = Math.floor((this.missionService.departmentPics.length-1)/3)+1;
      this.streamPics = new Array(this.missionService.departmentPics.length).fill(0);
    }
  }

  async galleryPicsUpdate(gallery) {
    this.picsAddFlag = false;

    if (!this.picsNewFlag) { // edit a single picture
      this.streamPics[this.picsIndex] = 3;

      const item: objectMini = {
                                '_id': this.missionService.departmentPics[this.picsIndex]._id,
                                'name': gallery.text,
                                'pic': gallery.pic
                               };

      this.missionService.departmentPics[this.picsIndex] = item;

      await this.sharedService.postShowcase(4, this.missionService.departmentId, this.missionService.departmentId, item);

    } else { // add multiple pictures

      // const picsCount = gallery[gallery.length - 2];
      const picsCount = gallery.substring(gallery.lastIndexOf("~") + 1,gallery.lastIndexOf("/"));

      const items: objectMini[] = [];

      for (let _i = 0; _i < picsCount; _i++) {
        items[_i] = { '_id': null, 'pic': gallery + 'nth/' + _i + '/', 'name': null };
      }

      for (const item of items) {
        this.missionService.departmentPics.push(item);
      }

      var x = Math.floor((this.missionService.departmentPics.length-1)/3)+1;

      const newLen: number = items.length;
      let last: number = this.missionService.departmentPics.length - 1;

      const data = await this.sharedService.putShowcase(4, this.missionService.departmentId, this.missionService.departmentId, items);

      for (const _id of data.reverse()) {
        this.missionService.departmentPics[last]._id = _id;
        last += -1;
      }

    }
  }

  async picDelete(i: number) {
    const _id: string = this.missionService.departmentPics[i]._id;
    var x: number;

    this.streamPics[i] = 3;

    await this.sharedService.deleteShowcase(4, this.missionService.departmentId, this.missionService.departmentId, _id);

    this.missionService.departmentPics.splice(i, 1);
    x = Math.floor((this.missionService.departmentPics.length-1)/3)+1;
    this.streamPics[i] = 0;
  }

  picsSlide(flag: boolean, i: number, newFlag: boolean) {
    this.picsAddFlag = flag;
    this.picsIndex = i;
    this.picsNewFlag = newFlag;
  }

}
