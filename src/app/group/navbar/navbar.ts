import {Component, Input, Output, OnInit, OnDestroy, Inject, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {ViewportScroller, DOCUMENT } from '@angular/common';

import {ToastService} from '../../user/services/toast.service';
import {groupComplex} from '../../shared/services/shared-service';

// https://www.npmjs.com/package/ngx-joyride
import { JoyrideService } from 'ngx-joyride';

declare const $: any;

@Component({
  selector: 'group-navbar',
  templateUrl: 'navbar.html',
  styleUrls: ['navbar.css']
})
export class GroupNavbarComponent implements OnInit, OnDestroy {
  @Input() showEditBtn: boolean;
  @Input() userStatus: number;

  @Input() visibleFlag: boolean;
  @Input() labFlag: boolean;

  @Input() streamFollow: number;
  @Input() followStatus: boolean;
  @Input() compareFlag: boolean;

  @Input() groupStage: number;

  @Input() activePath: string;
  @Input() activeSubPath: string;

  @Input() previewStatus: number;
  @Input() groupProgress: number[];
  @Input() topics: string[] = [];
  @Input() coverPic: string;
  @Input() country: string;
  @Input() state: string;
  @Input() city: string;

  @Input() set tourFlag(value: boolean) {
    if (value==true) {
      this.joyrideService.startTour(
        { steps: ['peopleStep', 'jobsStep', 'newsStep', 'suggestionsStep', 'toolsStep', 'eyeStep']}
      );
      setTimeout(() => {
        try {
          this.viewportScroller.scrollToPosition([0, 0]);
          // this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch (e) { }
      }, 1);
    }
  }

  @Input() set groupIndex(value: groupComplex) {
    const matches = value.group.name.match(/\b(\w)/g);
    this.acronym = matches.join('').substring(0, 2).toUpperCase();
    this._groupIndex = value;
  }

  @Output() changeUserStatusDummy: EventEmitter <number> = new EventEmitter();
  @Output() buttonFollowClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonCompareClick: EventEmitter <boolean> = new EventEmitter();
  // @Output() coverPicEditClick: EventEmitter <boolean> = new EventEmitter();
  // @Output() coverPicDeleteClick: EventEmitter <boolean> = new EventEmitter();
  // @Output() buttonPicClick: EventEmitter <boolean> = new EventEmitter(true);

  _groupIndex: groupComplex;
  acronym: string;

  groupMaxLength: number = 20;
  universityMaxLength: number = 50;

  modifiedPath: string;

  constructor(@Inject(DOCUMENT) private document: any,
              private viewportScroller: ViewportScroller,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private toastService: ToastService,
              private readonly joyrideService: JoyrideService) {}

  ngOnInit() {
    if (this.activePath=="research") {
      this.modifiedPath = "research/" + this.activeSubPath;
    } else if (this.activePath) {
      this.modifiedPath = this.activePath;
    } else {
      this.modifiedPath = '.';
    }

    const that = this;

    var mainPanel = document.getElementsByClassName('main-panel')[0];
    $('.modal').on('shown.bs.modal', function () {
      mainPanel.classList.add('no-scroll');
    })
    $('.modal').on('hidden.bs.modal', function () {
      mainPanel.classList.remove('no-scroll');
    })
  }

  ngOnDestroy() {
    this.joyrideService.closeTour();
  }

  selectChange(value: string) {
    // console.log('value',value)
    this.router.navigate([value], { relativeTo: this.activatedRoute });
  }

  togglePreviewFunc() {
    this.changeUserStatusDummy.emit();
    const message: string = "This is how your lab profile looks like to a visitor. Switch back in order to manage the lab profile";
    if (this.previewStatus<6) this.toastService.showNotification('bottom', 'left', message);
  }

  toggleFollowFunc() {
    this.buttonFollowClick.emit();
  }

  toggleCompareFunc() {
    this.buttonCompareClick.emit();
  }

  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  //   // this.innerWidth = window.innerWidth;
  //   this.wrapItems();
  // }
  // ngOnInit() {
  // setTimeout(function() {
  //   var wrappedItems = that.detectWrap('pill');
  //   for (var k = 0; k < wrappedItems.length; k++) {
  //     wrappedItems[k].className = "wrapped";
  //   }
  // }, 2);
  // }
  // wrapItems() {
  //   var items = document.getElementsByClassName("wrapped");
  //   for (var k = 0; k < items.length; k++) {
  //     items[k].className = "pill";
  //   }
  //   var wrappedItems = this.detectWrap('pill');
  //   for (var k = 0; k < wrappedItems.length; k++) {
  //     wrappedItems[k].className = "wrapped";
  //   }
  // }
  // https://stackoverflow.com/questions/40012428/how-to-detect-css-flex-wrap-event
  // https://stackoverflow.com/questions/44189149/how-to-inject-document-body-in-angular-2
  // https://stackoverflow.com/questions/37881169/angular-2-getboundingclientrect-from-component
  // detectWrap(className) {
  //   var wrappedItems = [];
  //   var prevItem: any;
  //   var currItem: any;
  //   var wrapFlag: boolean = false;
  //   var items = document.getElementsByClassName(className);
  //   for (var i = 0; i < items.length; i++) {
  //     currItem = items[i].getBoundingClientRect();
  //     if ((prevItem && prevItem.top < currItem.top) || wrapFlag) {
  //       wrappedItems.push(items[i]);
  //       wrapFlag = true;
  //     }
  //     prevItem = currItem;
  //   };
  //   return wrappedItems;
  // }

}
