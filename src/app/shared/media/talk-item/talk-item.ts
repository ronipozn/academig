import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {Talk, MediaService} from '../../services/media-service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'media-talks-item',
  templateUrl: 'talk-item.html',
  styleUrls: ['talk-item.css']
})
export class MediaTalksItemComponent {
  @ViewChild('toggleTalkModal', { static: false }) toggleTalk: ElementRef;

  @Input() talk: Talk;
  @Input() sourceType: number; // 0 - group,
                               // 1 - profile,
                               // 2 - project
                               // 3 - department
                               // 4 - university
                               // 5 - group AI
  @Input() showEditBtn: boolean;
  @Input() stream: number;

  @Input() streamSuggestion: number = 0;

  @Output() buttonEditClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();

  @Output() buttonAcceptClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonRejectClick: EventEmitter <boolean> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  // clipFlag = true;
  url: any;

  // dragFlag = false;
  // this.dragFlag = this.sourceType == 0 && showStatus && this.stream == 0;

  constructor(private sanitizer: DomSanitizer) {}

  // clipStop() {
  //   // this.toggleTalk.nativeElement.click();
  //   this.clipFlag = false;
  // }

  ngOnInit() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.talk.linkConvert);
  }

  buttonEditFunc(): void {
    this.buttonEditClick.emit(true);
  }

  buttonDeleteFunc(): void {
    this.buttonDeleteClick.emit(true);
  }

  buttonAccpetFunc() {
    this.buttonAcceptClick.emit(true);
  }

  buttonRejectFunc() {
    this.buttonRejectClick.emit(true);
  }

  animationDone(event): void {
    this.animationDoneEvent.emit(true);
  }

}
