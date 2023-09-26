import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

import {MissionService} from '../../services/mission-service';

import {SharedService, objectMini} from '../../../shared/services/shared-service';

import {Gallery, GalleryService} from '../../../shared/services/gallery-service';

import {itemsAnimation} from '../../../shared/animations/index';

import {NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation} from 'ngx-gallery';

@Component({
  selector: 'group-gallery',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupGalleryComponent implements OnInit {
  streamGalleries: number[];
  itemFocus: number;

  galleries: Gallery[];
  streamRetrieved: boolean;

  galleryIndex: number;
  galleryNewFlag = false;
  galleryBuildFlag = false;

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[][];

  fragment: string;

  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  constructor(private route: ActivatedRoute,
              private galleryService: GalleryService,
              private sharedService: SharedService,
              private titleService: Title,
              public missionService: MissionService) {}

  async ngOnInit() {
    if (this.missionService.groupId) {
      this.titleService.setTitle('Gallery - ' + this.missionService.groupTitle + ' | Academig');
      this.streamRetrieved = false;
      this.galleries = await this.galleryService.getGalleries(this.missionService.groupId, 2);
      this.streamGalleries = new Array(this.galleries.length).fill(0);
      if (this.missionService.showEditBtn==false) this.ngxGallery();
      this.streamRetrieved = true;

      this.route.fragment.subscribe(fragment => {
        this.fragment = fragment
        this.scrollFunc()
      });
    }
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
           case "add": this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
      } catch (e) { }
    }, 1000);
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

      // const picsCount = gallery.groupPics[gallery.groupPics.length - 2];
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
                        ai: gallery.intelligence
                       }

      this.galleries.push(privateGallery);
      const loc = this.galleries.length - 1;
      let pointer: number;

      this.streamGalleries[loc] = 3;
      this.itemFocus = loc;

      const data = await this.galleryService.putGallery(privateGallery, this.missionService.groupId, 2);

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

      await this.galleryService.postGallery(privateGallery, this.missionService.groupId, 2);

      this.streamGalleries[this.galleryIndex] = 1;

    }
  }

  async galleryDelete(i: number) {
    this.itemFocus = null;
    this.streamGalleries[i] = 3;

    await this.galleryService.deleteGallery(this.galleries[i]._id, this.missionService.groupId, 2);

    this.galleries.splice(i, 1);
    this.streamGalleries[i] = 0;
    // if (this.galleries.length == 0) this.progress.emit(false);
  }

  streamFunc() {
    const loc: number = this.galleryNewFlag ? this.galleries.length - 1 : this.galleryIndex;
    this.streamGalleries[loc] = 0;
  }

}
