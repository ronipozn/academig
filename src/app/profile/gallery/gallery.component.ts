import {Component, Input, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {Title} from '@angular/platform-browser';

import {MissionService} from '../services/mission-service';

import {SharedService, objectMini} from '../../shared/services/shared-service';

import {Gallery, GalleryService} from '../../shared/services/gallery-service';
import {UserService} from '../../user/services/user-service';

import {itemsAnimation} from '../../shared/animations/index';

import {NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation} from 'ngx-gallery';

@Component({
  selector: 'profile-gallery',
  templateUrl: 'gallery.html',
  styleUrls: ['gallery.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GalleryComponent implements OnInit {
  streamGalleries: number[];
  itemFocus: number;

  galleries: Gallery[];
  streamRetrieved: boolean;

  galleryIndex: number;
  galleryNewFlag = false;
  galleryBuildFlag = false;

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[][];

  // await this.sharedService.deleteShowcase(3, this.galleries[this.galleryIndex]._id, this.missionService.peopleId, _id);

  constructor(private galleryService: GalleryService,
              private sharedService: SharedService,
              private userService: UserService,
              private titleService: Title,
              public missionService: MissionService) {}

  async ngOnInit() {
    this.titleService.setTitle('Gallery - ' + this.missionService.peopleName + ' | Academig');
    this.streamRetrieved = false;

    const galleries = await this.galleryService.getGalleries(this.missionService.peopleId, 1);

    this.galleries = galleries || [];

    if (this.missionService.meFlag==false) this.ngxGallery();

    this.streamRetrieved = true;
    this.streamGalleries = new Array(this.galleries.length).fill(0);
  }

  ngxGallery() {
    this.galleryOptions = [
      {
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide
      },
      {
        width: '100%',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20,
        thumbnailsAutoHide: true
      },
      {
        breakpoint: 400,
        preview: false
      }
    ];

    this.galleryImages = Array(this.galleries.length).fill(0).map(() => new Array(1));

    this.galleries.forEach((gallery, i) => {
      gallery.pics.forEach((item, j) => {
        this.galleryImages[i][j]= {
          small: item.pic,
          medium: item.pic,
          big: item.pic,
          // description: item.description
        }
      });
    });
  }

  gallerySlide(flag: boolean, i: number, newFlag: boolean) {
    this.galleryBuildFlag = flag;
    this.galleryIndex = i;
    this.galleryNewFlag = newFlag;
  }

  async galleryUpdate(gallery) {
    this.galleryBuildFlag = false;
    let privateGallery: Gallery;

    if (this.galleryNewFlag == true) {

      const picsCount = gallery.groupPics.substring(gallery.groupPics.lastIndexOf("~") + 1,gallery.groupPics.lastIndexOf("/"));
      const pics: objectMini[] = [];

      for (let _i = 0; _i < picsCount; _i++) {
        pics[_i] = { '_id': null, 'pic': gallery.groupPics + 'nth/' + _i + '/', 'name': null };
      }

      privateGallery = {
                      _id: null,
                      date: gallery.date,
                      title: gallery.title,
                      description: gallery.description,
                      pics: pics,
                      group: null,
                      ai: null
                     }

      this.galleries.push(privateGallery);
      const loc = this.galleries.length - 1;
      let pointer: number;

      this.streamGalleries[loc] = 3;
      this.itemFocus = loc;

      const data = await this.galleryService.putGallery(privateGallery, this.missionService.peopleId, 1);

      pointer = this.galleries[loc].pics.length - 1;
      for (const _id of data) {
        if (pointer == -1) {
          this.galleries[loc]._id = _id;
        } else {
          this.galleries[loc].pics[pointer]._id = _id;
        }
        pointer += -1;
      }

      this.streamGalleries[loc] = 1;
      this.userService.userProgress[12] = true;

    } else {

      privateGallery = {
                        _id: this.galleries[this.galleryIndex]._id,
                        date: gallery.date,
                        title: gallery.title,
                        description: gallery.description,
                        pics: null,
                        group: null,
                        ai: null
                       }

      this.galleries[this.galleryIndex].date = privateGallery.date;
      this.galleries[this.galleryIndex].title = privateGallery.title;
      this.galleries[this.galleryIndex].description = privateGallery.description;

      this.streamGalleries[this.galleryIndex] = 3;

      await this.galleryService.postGallery(privateGallery, this.missionService.peopleId, 1);

      this.streamGalleries[this.galleryIndex] = 1;
    }
  }

  async galleryDelete(i: number) {
    this.itemFocus = null;
    this.streamGalleries[i] = 3;

    await this.galleryService.deleteGallery(this.galleries[i]._id, this.missionService.peopleId, 1);

    this.galleries.splice(i, 1);
    this.streamGalleries[i] = 0;
    if (this.galleries.length==0) this.userService.userProgress[12] = false;

  }

  streamFunc() {
    const loc: number = this.galleryNewFlag ? this.galleries.length - 1 : this.galleryIndex;
    this.streamGalleries[loc] = 0;
  }

}
