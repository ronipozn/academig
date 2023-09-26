import {Component, Input, Output, OnInit, OnDestroy, Inject, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {ViewportScroller, DOCUMENT } from '@angular/common';

import {PositionMini} from '../../shared/services/people-service';

import {ToastService} from '../../user/services/toast.service';

import {JoyrideService} from 'ngx-joyride';

@Component({
  selector: 'people-navbar',
  templateUrl: 'navbar.html',
  styleUrls: ['navbar.css'],
})
export class ProfileNavbarComponent {
  @Input() activePath: string;

  @Input() realFlag: boolean;
  @Input() meFlag: boolean;

  @Input() peopleId: string;
  @Input() peopleName: string;
  @Input() peoplePic: string;
  @Input() peoplePositions: PositionMini[];

  @Input() followStatus: boolean;
  @Input() blockStatus: boolean;

  @Input() streamName: number;
  @Input() streamFollow: number;
  @Input() streamBlock: number;

  @Input() previewStatus: number;
  @Input() progress: boolean[];

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

  @Output() buttonPicClick: EventEmitter <boolean> = new EventEmitter(true);
  @Output() buttonNameClick: EventEmitter <boolean> = new EventEmitter(true);

  @Output() buttonFollowClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonMessageClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonBlockClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonReportClick: EventEmitter <boolean> = new EventEmitter();

  @Output() changeUserStatusDummy: EventEmitter <boolean> = new EventEmitter();

  modifiedPath: string;

  constructor(@Inject(DOCUMENT) private document: any,
              private viewportScroller: ViewportScroller,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private toastService: ToastService,
              private readonly joyrideService: JoyrideService) {}

  ngOnInit() {
    if (this.activePath) {
      this.modifiedPath = this.activePath;
    } else {
      this.modifiedPath = '.';
    }

    // const that = this;
    // var mainPanel = document.getElementsByClassName('main-panel')[0];
    // $('.modal').on('shown.bs.modal', function () {
    //   mainPanel.classList.add('no-scroll');
    // })
    // $('.modal').on('hidden.bs.modal', function () {
    //   mainPanel.classList.remove('no-scroll');
    // })
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
    const message: string = "This is how your researcher profile looks like to a visitor. Switch back in order to manage your profile";
    if (this.previewStatus<6) this.toastService.showNotification('bottom', 'left', message);
  }

  profileNameEdit(flag: boolean) {
    this.buttonNameClick.emit(flag);
  }

  profilePicEdit() {
    this.buttonPicClick.emit(true);
  }

  buttonFollowFunc() {
    this.buttonFollowClick.emit(true);
  }

  buttonMessageFunc() {
    this.buttonMessageClick.emit(true);
  }

  buttonBlockFunc() {
    this.buttonBlockClick.emit(true);
  }

  buttonReportFunc() {
    this.buttonReportClick.emit(true);
  }

}
