import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {SharedService, objectMini} from '../../../shared/services/shared-service';

import {Gallery, GalleryService} from '../../../shared/services/gallery-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'gallery-details',
  templateUrl: 'gallery-details.html',
  styleUrls: ['gallery-details.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GalleryDetailsComponent implements OnInit {
  @Input() parentId: string;
  @Input() projId: string;
  @Input() userId: string;
  @Input() sourceType: number;
  @Input() groupStage: number;
  @Input() showEditBtn: boolean;

  @Input() streamSuggestion: number[];

  @Output() title: EventEmitter <string> = new EventEmitter(true);

  gallery: Gallery;

  picsIndex: number;
  picsNewFlag: boolean;
  picsAddFlag = false;

  showButton: boolean[] = [];
  streamRetrieved: boolean;

  streamPics: number[];
  picIndex: number;
  picNewFlag: boolean = false;
  picFlag: boolean = false;

  constructor(private titleService: Title,
              private sharedService: SharedService,
              private galleryService: GalleryService) {}


  ngOnInit() {
    this.gallery = null;
    this.updatePage();
  }

  async updatePage() {
    this.streamRetrieved = false;

    this.gallery = await this.galleryService.getGalleryDetails(this.projId, this.parentId);

    if (this.gallery) {
      this.titleService.setTitle(this.gallery.title + ' | Academig'),
      this.title.emit(this.gallery.title),
      this.streamPics = new Array(this.gallery.pics.length).fill(0);
    } else {
      this.gallery = null,
      this.title.emit('[Gallery not available]');
    }

    this.streamRetrieved = true;
  }

  async galleryPicsUpdate(gallery) {
    this.picsAddFlag = false;

    if (!this.picsNewFlag) { // edit a single picture
      this.streamPics[this.picsIndex] = 3;

      const item: objectMini = {
                                '_id': this.gallery.pics[this.picsIndex]._id,
                                'name': gallery.text,
                                'pic': gallery.pic
                               };

      this.gallery.pics[this.picsIndex] = item;

      await this.sharedService.postShowcase(3, this.gallery._id, this.parentId, item);

      this.streamPics[this.picsIndex] = 1;

    } else { // add multiple pictures

      // const picsCount = gallery[gallery.length - 2];
      const picsCount = gallery.substring(gallery.lastIndexOf("~") + 1,gallery.lastIndexOf("/"));
      const items: objectMini[] = [];

      for (let _i = 0; _i < picsCount; _i++) {
        items[_i] = { '_id': null, 'pic': gallery + 'nth/' + _i + '/', 'name': null };
      }

      for (const item of items) {
        this.gallery.pics.push(item);
      }

      const newLen: number = items.length;
      let last: number = this.gallery.pics.length - 1;

      const data = await this.sharedService.putShowcase(3, this.gallery._id, this.parentId, items);

      for (const _id of data.reverse()) {
        this.gallery.pics[last]._id = _id;
        last += -1;
      }

    }
  }

  async galleryPicDelete(i: number) {
    const _id: string = this.gallery.pics[i]._id;
    this.streamPics[i] = 3;

    await this.sharedService.deleteShowcase(3, this.gallery._id, this.parentId, _id);

    this.gallery.pics.splice(i, 1),
    this.streamPics[i] = 0
  }

  picsSlide(flag: boolean, i: number, newFlag: boolean) {
    this.picsAddFlag = flag;
    this.picsIndex = i;
    this.picsNewFlag = newFlag;
  }

  streamFunc() {
    let loc: number = this.picsNewFlag ? this.gallery.pics.length - 1 : this.picsIndex;
    this.streamPics[loc] = 0;
  }

}
