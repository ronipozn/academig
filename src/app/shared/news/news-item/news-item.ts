import {Component, Input, OnInit, DoCheck, IterableDiffers, Output, EventEmitter} from '@angular/core';

import {GroupCompareMini} from '../../../shared/services/group-service';
import {Followings, titlesTypes} from '../../../shared/services/people-service';
import {objectMini, groupComplex} from '../../services/shared-service';
import {ReactionsCounts, Reactions} from '../../services/news-service';

import {itemsAnimation} from '../../animations/index';

declare var uploadcare: any;

@Component({
  selector: '[news-item]',
  templateUrl: 'news-item.html',
  styleUrls: ['news-item.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' },
})
export class NewsItemComponent implements OnInit {
  // @Input() news: any;

  @Input() actor: objectMini;
  @Input() verb: number;
  @Input() object: any; // FIX
  // @Input() object: objectMini;
  @Input() target: groupComplex;
  @Input() members: objectMini[];
  @Input() commentors: objectMini[];

  @Input() own: Reactions;
  @Input() latest: Reactions;
  @Input() reactionsCounts: ReactionsCounts;

  @Input() time: string;
  @Input() text: string;
  @Input() pic: string;
  @Input() link: string;

  @Input() userId: string;
  @Input() userName: string;
  @Input() userPic: string;

  @Input() sourceType: number = 0;

  @Input() followings: Followings;
  @Input() compareStatus: boolean;

  @Output() pdf: EventEmitter <{title: string, fileName: string}> = new EventEmitter(true);

  @Output() buttonCompareClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonFollowClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonShareClick: EventEmitter <boolean> = new EventEmitter();

  @Output() buttonClapClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonUnClapClick: EventEmitter <boolean> = new EventEmitter();

  @Output() buttonNewCommentClick: EventEmitter <string> = new EventEmitter();
  @Output() buttonEditCommentClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonDeleteCommentClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonShowCommentsClick: EventEmitter <boolean> = new EventEmitter();

  @Output() buttonEditNewsClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteNewsClick: EventEmitter <boolean> = new EventEmitter();

  @Output() buttonModalClick: EventEmitter <string> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  objectName: string;
  objectStack: string;

  objectPicFlag: boolean;
  actorPicFlag: boolean;

  titlesSelect = titlesTypes;

  thumbnail: string;

  toggleAbstractFlag = false;

  htmlObjectPic: string = null;

  verbDigits: number[] = [];

  comments: any;
  commentsCount: number;
  claps: number;
  clapsMe: number;

  user: objectMini;

  url: any;

  editFlag = false;
  showButton = false;

  followStatus: boolean;

  clapDone: boolean = true;

  newCommentFlag: boolean = false;

  comment: string;
  file: string;

  iterableDiffer: any;

  constructor(private _iterableDiffers: IterableDiffers) {
    // setTimeout(() => {
    //   const btn = document.querySelector('.uploadcare--widget__button_type_open');
    //   btn.innerHTML = '<i class="fa fa-camera"></i>';
    //   (<HTMLElement>document.querySelector('.uploadcare--widget__text')).style.display = 'none';
    //   (<HTMLElement>document.querySelector('.uploadcare--widget__button_type_cancel')).style.display = 'none';
    //   (<HTMLElement>document.querySelector('.uploadcare--widget__button_type_open')).style.background = '#24a2b7';
    //   // document.querySelector('.uploadcare--widget__text').style.display = 'none';
    //   // document.querySelector('.uploadcare--widget__button_type_cancel').style.display = 'none';
    // }, 100);
    // this.iterableDiffer = _iterableDiffers.find([]).create(null);
  }

  ngOnInit() {
    this.clapsMe  = (this.own && this.own.claps) ? this.own.claps.length : 0;
    this.claps = this.reactionsCounts.claps || 0;

    this.user = {"_id": this.userId, "name": this.userName, "pic": this.userPic};

    this.commentsCount = this.reactionsCounts.comments || 0;
    this.comments = this.latest.comments;

    this.verbDigits[0] = Number(('' + this.verb)[0]);
    this.verbDigits[1] = Number(('' + this.verb)[1]);
    this.verbDigits[2] = Number(('' + this.verb)[2]);
    this.verbDigits[3] = Number(('' + this.verb)[3]);
    this.verbDigits[4] = Number(('' + this.verb)[4]);

    switch (Number(this.verb)) {
      case 1001: this.objectName = 'publications'; this.objectStack = 'description'; this.thumbnail = this.link + '.jpg'; break;
      case 1002: this.objectName = 'services'; this.objectStack = 'extension'; break;
      case 1003: this.objectName = 'projects'; this.objectStack = 'ballot'; break;
      case 1004: this.objectName = 'collaboration'; this.objectStack = 'group'; break;
      case 1005: this.objectName = 'positions'; this.objectStack = 'assignment'; break;
      case 1006: this.objectName = 'funding'; this.objectStack = 'money'; break;
      case 1008: this.objectName = 'teaching'; this.objectStack = 'school'; break;
      case 1010: this.objectName = 'question'; this.objectStack = 'question_answer'; break;
      case 1011: this.objectName = 'talk'; this.objectStack = 'keyboard_voice'; break;
      case 1012: this.objectName = 'poster'; this.objectStack = 'picture_in_picture'; this.thumbnail = this.link + '.jpg'; break;
      case 1013: this.objectName = 'press'; this.objectStack = 'format_align_left'; break;
      default: this.objectName = ''; this.objectStack = 'subject'; break;
    }

    this.objectPicFlag = this.objectName && this.verb!=1000 && this.verb!=1007 && this.verb!=1050 && this.verbDigits[0]==1;
    this.actorPicFlag = this.actor && (this.verb==1007 || this.verb==1050 || this.verb==20000 || this.verbDigits[0]==4 || this.verbDigits[0]==5 || this.verbDigits[0]==6);

    this.updateFollow();
  }

  ngAfterViewInit() {
    // const that = this;
    // const widget = uploadcare.Widget('#file');
    // const wfile = widget.value();
    //
    // widget.onChange(function(value) {
    //   if (value) {
    //     value.promise().done(function(info) {
    //       that.newFile(info.cdnUrl)
    //     });
    //   } else {
    //     that.file = '';
    //   }
    // });
    //
    // widget.onUploadComplete(() => {
    //   widget.value(null);
    // });
  }

  newFile(file: string): void {
    // this.messageService.send({_id: null,
    //                           type: 1,
    //                           userId: this.userId,
    //                           text: '',
    //                           file: file,
    //                           date: new Date()});
    //
    // this.createMessage.emit({_id: null,
    //                          type: 1,
    //                          userId: this.userId,
    //                          text: '',
    //                          file: file,
    //                          date: new Date()});
  }

  toggleAbstract(): void {
    this.toggleAbstractFlag = !this.toggleAbstractFlag;
  }

  pdfSlide(title: string, fileName: string) {
    this.pdf.emit({title, fileName})
  }

  buttonOver(showStatus: boolean): void {
    if (this.editFlag) {
      this.showButton = showStatus;
    }
  }




  buttonEditNewsFunc(): void {
    this.buttonEditNewsClick.emit(true);
  }

  buttonDeleteNewsFunc(): void {
    this.buttonDeleteNewsClick.emit(true);
  }




  updateFollow() {
    const v = Number(this.verb);

    if (v==1000 && this.object) {
      this.followStatus = (this.followings.groupsIds) ? this.followings.groupsIds.findIndex(x => x == this.object.group._id)>-1 : false;
    } else if ((v==1011 || v==1012 || v==1013) && this.actor) {
      this.followStatus = (this.followings.peoplesIds) ? this.followings.peoplesIds.findIndex(x => x == this.actor._id)>-1 : false;
    } else if (v==1001 && this.object) {
      this.followStatus = (this.followings.publicationsIds) ? this.followings.publicationsIds.findIndex(x => x == this.object._id)>-1 : false;
    } else if (v==1002 && this.object) {
      this.followStatus = (this.followings.resourcesIds) ? this.followings.resourcesIds.findIndex(x => x == this.object._id)>-1 : false;
    } else if (v==1003 && this.object) {
      this.followStatus = (this.followings.projectsIds) ? this.followings.projectsIds.findIndex(x => x == this.object._id)>-1 : false;
    } else if (v==1005 && this.object) {
      this.followStatus = (this.followings.positionsIds) ? this.followings.positionsIds.findIndex(x => x == this.object._id)>-1 : false;
    } else if ((v==1004 || v==1006 || 1010) && this.actor) {
      this.followStatus = (this.followings.peoplesIds) ? this.followings.peoplesIds.findIndex(x => x == this.actor._id)>-1 : false;
    } else if (v==1001 && this.actor) {
      this.followStatus = (this.followings.peoplesIds) ? this.followings.peoplesIds.findIndex(x => x == this.actor._id)>-1 : false;
    }
  }

  buttonFollowFunc(): void {
    if (this.userId) {
      var mode: number;
      if (this.verb==1000) { // group
        mode = 4;
      } else if (this.verb==1001) { // publication
        mode = 0; // ????
      } else if  (this.verb==1002) { // resource
        mode = 1;
      } else if  (this.verb==1003) { // project
        mode = 2;
      } else if  (this.verb==1005) { // position
        mode = 3;
      } else {
        mode = 5;
      }
      this.followStatus=!this.followStatus;
      this.buttonFollowClick.emit(mode);
    } else {
      this.buttonModalClick.emit("follow on");
    }
  }

  buttonCompareFunc(): void {
    this.buttonCompareClick.emit(true);
  }

  buttonClapsFunc(): void {
    if (this.userId) {
      this.buttonClapClick.emit(true);
      this.claps++;
      this.clapDone = false;
    } else {
      this.buttonModalClick.emit("clap on");
    }
  }

  buttonUnClapFunc(): void {
    if (this.userId) {
      this.buttonUnClapClick.emit(true);
      this.claps -= this.own.claps.length;
      this.own.claps = null;
    }
  }

  clapDoneFunc(event): void {
    this.clapDone = true;
  }

  buttonShareFunc(event): void {
    this.buttonShareClick.emit(true);
  }




  buttonCommentFunc(event): void {
    if (this.userId) {
      this.newCommentFlag = true;
    } else {
      this.buttonModalClick.emit('comment');
    }
  }

  newComment(): void {
    this.buttonNewCommentClick.emit(this.comment);
    this.commentsCount++;
    if (this.comments) {
      this.comments.unshift({
                             "user_id": this.userId,
                             "data": {
                                      "text": this.comment,
                                      "pic": null
                                     },
                             "time": new Date()
                            })
    } else {
      this.comments = [{
                        "user_id": this.userId,
                        "data": {
                                 "text": this.comment,
                                 "pic": null
                                },
                        "time": new Date()
                      }];
    }
    this.comment='';
  }

  editComment(i: number): void {
    // this.buttonEditCommentClick.emit(i);
  }

  deleteComment(i: number): void {
    // this.buttonDeleteCommentClick.emit(i);
  }

  showComments(event): void {
    // this.buttonShowCommentsClick.emit(true);
  }

  animationDone(event): void {
    this.showButton = false;
    this.animationDoneEvent.emit(true);
  }

}
