import {Component, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: '[build-text-pic]',
  templateUrl: 'build-text-pic.html',
  styleUrls: ['build-text-pic.css']
})
export class GroupBuildTextPicComponent implements OnChanges {
  @Input() mode = false; // 0 - pic
                         // 1 - video

  @Input() text: string;
  @Input() textMax: number = 0;
  @Input() smallFlag: boolean = false;

  @Input() pic: string;
  @Input() caption: string;

  @Input() altText: string;
  @Input() titleText: string;
  @Input() bodyText: string;

  @Input() imgSize = 300;
  @Input() imgCenter: boolean;

  @Input() showEditBtn: number = 0;
  @Input() stream: number = 0;

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  videoUrl: any;
  toggleFlag = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    if (this.mode == true && this.pic != null) {
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pic);
    }
  }

  buttonEditFunc() {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc() {
    this.buttonDeleteClick.emit(true);
  }

  animationDone() {
    this.animationDoneEvent.emit(true);
  }

  toggleAbstract() {
    this.toggleFlag = !this.toggleFlag;
  }

}
