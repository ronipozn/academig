import {Component, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {Gallery} from '../../../shared/services/gallery-service';
import {groupComplex} from '../../../shared/services/shared-service';

@Component({
  selector: 'gallery-item',
  templateUrl: 'gallery-item.html',
  styleUrls: ['gallery-item.css']
})
export class GalleryItemComponent {
  @Input() showEditBtn: boolean;
  @Input() stream: number;

  @Input() _id: string;
  @Input() pic: string;
  @Input() title: string;
  @Input() date: Date;
  @Input() description: string;
  @Input() group: groupComplex;

  @Input() mode: number; // 0 - Gallery Collection
                         // 1 - Gallery item
                         // 2 - Figure Item
                         // 3 - University / Department
                         // 4 - Group AI
  @Input() picsLen: number = 0;

  @Input() streamSuggestion: number = 0;

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonSuggestionClick: EventEmitter <number> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  @ViewChild('togglePicModal', { static: true }) togglePic: ElementRef;

  constructor(private _router: Router,
              private activatedRoute: ActivatedRoute) {}

  showButton = false;

  buttonOver(showStatus: boolean) {
    if (this.showEditBtn) {
      this.showButton = showStatus;
    }
  }

  buttonViewFunc(event): void {
    if ((this.mode==1 || this.mode==2) && (event.offsetX>75 || event.offsetY>30)) {
      this.togglePic.nativeElement.click();
    } else if (this.mode==3) {
      this._router.navigate(['/',this.group.university.link,this.group.department.link,this.group.group.link,'gallery',this._id], { relativeTo: this.activatedRoute });
    } else if (this._id && this.mode==0 &&
               (
                !this.showEditBtn ||
                (this.showEditBtn && (event.offsetX>75 || event.offsetY>30))
               )
              ) {
      this._router.navigate([this._id], { relativeTo: this.activatedRoute });
    }
  }

  buttonEditFunc() {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc() {
    this.buttonDeleteClick.emit(true);
  }

  buttonSuggestionFunc(i: number) {
    this.buttonSuggestionClick.emit(i);
  }

  animationDone(): void {
    this.showButton = false;
    this.animationDoneEvent.emit(true);
  }

}
