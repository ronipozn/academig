import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Profile, titlesTypes} from '../../../shared/services/people-service';
import {Folder, Publication} from '../../../shared/services/publication-service';

import {itemsAnimation} from '../../../shared/animations/index';

import {PublicInfo, SocialInfo} from '../../../shared/services/shared-service';

@Component({
  selector: 'profile-about',
  templateUrl: 'about.html',
  styleUrls: ['about.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class AboutComponent {
  @Input() profile: Profile;
  @Input() readings: Publication[];
  @Input() currentFolder: Folder;

  @Input() publicInfo: PublicInfo;
  @Input() socialInfo: SocialInfo;

  @Input() streamInfo: number;
  @Input() streamQuote: number;
  @Input() streamCoverPic: number;
  @Input() streamTags: number;

  @Input() meFlag: boolean;
  @Input() userId: string;
  @Input() userEmailVerified: boolean;

  @Input() followingLength: number;
  @Input() followersLength: number;
  @Input() coauthorsLength: number;
  @Input() dummyCoauthorsLength: number;

  @Output() tagsOpClick: EventEmitter <number> = new EventEmitter();
  @Output() quoteOpClick: EventEmitter <number> = new EventEmitter();

  // @Output() coverPicEditClick: EventEmitter <boolean> = new EventEmitter();
  // @Output() coverPicDeleteClick: EventEmitter <boolean> = new EventEmitter();

  @Output() buildLabProfileClick: EventEmitter <{_id: string, mode: boolean}> = new EventEmitter(true);

  showButton: boolean;
  titlesSelect = titlesTypes;

  buttonOver(showStatus: boolean) {
    if (this.meFlag) {
      this.showButton = showStatus;
    }
  }

  buildLabProfileFunc(_id: string, mode: boolean) {
    this.buildLabProfileClick.emit({_id: _id, mode: mode});
  }

  // coverPicEdit() {
  //   this.coverPicEditClick.emit(true);
  // }
  // coverPicDelete() {
  //   this.coverPicDeleteClick.emit(true);
  // }
  
}
