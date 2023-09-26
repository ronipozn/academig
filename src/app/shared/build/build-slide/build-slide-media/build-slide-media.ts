import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { CustomValidators } from 'ng2-validation';
import { DatePipe } from '@angular/common';
// import { PDFDocumentProxy, PDFProgressData } from 'ng2-pdf-viewer';

import { AuthService } from '../../../../auth/auth.service';
import { UserService } from '../../../../user/services/user-service';

import { Talk, Poster, Press } from '../../../services/media-service';
import { objectMini, SharedService } from '../../../services/shared-service';
import { slideInOutAnimation } from '../../../animations/index';

declare var uploadcare: any;

@Component({
    selector: 'build-slide-media',
    templateUrl: 'build-slide-media.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-media.css'],
})

export class BuildSlideMediaComponent implements OnInit { // , AfterViewChecked
  @Input() activeTab: number;
  @Input() groupId: string;
  @Input() itemId: string;
  @Input() userId: string;
  @Input() newFlag: boolean;
  @Input() existFlag = false;
  @Input() sourceFlag = false;

  @Input() talk: Talk;
  @Input() poster: Poster;
  @Input() press: Press;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  submitStatus: boolean = false;
  disableFlag: boolean = false;
  controlStatus: boolean[] = [false, false, false, false];

  formModel: FormGroup;
  stepNum: number;
  title: string;

  newString: string;

  locationTitle: string;
  membersTitle: string;

  members: objectMini[] = [];
  preMembers: objectMini[] = [];

  projects: objectMini[] = [];
  preProjects: objectMini[] = [];

  progressPDF: number
  linkConvert: string;

  url: any;
  urlValid: boolean = false;

  adminFlag: boolean = false;

  constructor(
    private datepipe: DatePipe,
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService,
    public sharedService: SharedService,
    public userService: UserService,
  ) {
    this.formModel = new FormGroup({
      title: new FormControl('', Validators.required),
      location: new FormControl(''),
      date: new FormControl(''),
    });
  }

  ngOnInit() {
    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:groups'])
      if (this.adminFlag && this.newFlag) this.formModel.addControl('intelligence', new FormArray([new FormControl()]));
    });

    this.stepNum = 0;

    this.newString = this.newFlag ? 'New' : 'Update';

    // if (this.activeTab < 2) {
      this.formModel.addControl('abstract', new FormControl('', Validators.maxLength(300)));
    // }

    if (this.activeTab == 0) {
      this.locationTitle = 'Location';
      this.membersTitle = 'Presentors';
      this.title = 'talk';
      this.formModel.addControl('link', new FormControl('', CustomValidators.url));
    } else if (this.activeTab == 1) {
      this.locationTitle = 'Location';
      this.membersTitle = 'People';
      this.title = 'poster';
      this.formModel.addControl('link', new FormControl(''));
    } else if (this.activeTab == 2) {
      this.locationTitle = 'Source';
      this.title = 'press release';
      this.formModel.addControl('link', new FormControl('', Validators.compose([CustomValidators.url, Validators.required])));
    }

    if (!this.newFlag) {
      if (this.activeTab == 0) {
        this.formModel.setValue({
          link: this.talk.link,
          title: this.talk.title,
          location: this.talk.location,
          date: this.datepipe.transform(this.talk.date, 'yyyy-MM-dd'),
          abstract: this.talk.text,
        });

        this.preMembers = this.talk.presentors;
        this.preProjects = this.talk.projects;
        this.controlStatusFunc(false, 0)

      } else if (this.activeTab == 1) {
        this.formModel.setValue({
          link: this.poster.embed,
          title: this.poster.title,
          location: this.poster.location,
          date: this.datepipe.transform(this.poster.date, 'yyyy-MM-dd'),
          abstract: this.poster.abstract,
        });

        this.preMembers = this.poster.authors;
        this.preProjects = this.poster.projects;

        this.url = this.poster.embed;

      } else {

        this.formModel.setValue({
          link: this.press.link,
          title: this.press.title,
          location: this.press.source,
          date: this.datepipe.transform(this.press.date, 'yyyy-MM-dd'),
          abstract: this.press.abstract,
        });

        this.preProjects = this.press.projects;

      }
    }

    this.formModel.controls['link'].valueChanges.subscribe((value: string) => {
      this.formModel.controls['link'].setValue(value.trim(), {emitEvent: false});
    });

  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  changeStep(upDown: boolean, updateStep: number) {
    if (updateStep != null) {
      this.stepNum = updateStep;
    } else if (upDown == false) {
      this.stepNum--;
    } else {
      this.stepNum++;
    }
  }

  ngAfterViewInit() {
    if (this.activeTab == 1) {
      const that = this;
      const widget = uploadcare.Widget('#url');

      if (this.newFlag) {
        that.url = '';
      } else {
        if (this.poster && this.poster.embed && this.poster.embed.substring(0, 16) == 'https://ucarecdn') { widget.value(this.poster.embed); }
      }

      widget.onChange(function(value) {
        if (value) {
          value.promise().done(function(info) {
            that.url = info.cdnUrl;
          });
        } else {
          that.url = '';
        }
      });
    }
  }

  onSubmit() {
    if (this.formModel.valid) {

      this.formModel.value.projects = this.projects.filter((elem, index, arr) => this.formModel.value.projects[index] === true);

      if (this.activeTab != 2) { this.formModel.value.members = this.members.filter((elem, index, arr) => this.formModel.value.members[index] === true); }

      this.formModel.value.linkConvert = (this.activeTab == 1) ? this.url : this.formModel.value.linkConvert = this.linkConvert;
      this.disableFlag = true;
      this.update.emit(this.formModel.value);

    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  membersFunc(event) {
    this.members = event;
  }

  projectsFunc(event) {
    this.projects = event;
  }

  controlStatusFunc(event, i: number) {
    this.controlStatus[i] = event

    if (this.activeTab == 0) {
      this.linkConvert = this.sharedService.convertMedia(this.formModel.value.link);
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.linkConvert);
      this.urlValid = (this.linkConvert == '') ? false : true;
    }
  }

  // callBackPDF(pdf: PDFDocumentProxy) {
    // pdf.getOutline().then((outline) => {
    //   console.log('outline',outline)
    // });
    // pdf.getMetadata().then((outline) => {
    //   if (outline) this.formModel.controls['title'].setValue(outline.info.Title);
    //   console.log('meta',outline)
    // });
  // }

  // onProgressPDF(progressData: PDFProgressData) {
  //   this.progressPDF = 100 * progressData.loaded / progressData.total;
  // }

}
