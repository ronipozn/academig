// https://api.crossref.org/types
// "total-results": 26,
// "items": [
// {
// "id": "book-section",
// "label": "Book Section"
// },
// {
// "id": "monograph",
// "label": "Monograph"
// },
// {
// "id": "report",
// "label": "Report"
// },
// {
// "id": "book-track",
// "label": "Book Track"
// },
// {
// "id": "journal-article",
// "label": "Journal Article"
// },
// {
// "id": "book-part",
// "label": "Part"
// },
// {
// "id": "other",
// "label": "Other"
// },
// {
// "id": "book",
// "label": "Book"
// },
// {
// "id": "journal-volume",
// "label": "Journal Volume"
// },
// {
// "id": "book-set",
// "label": "Book Set"
// },
// {
// "id": "reference-entry",
// "label": "Reference Entry"
// },
// {
// "id": "proceedings-article",
// "label": "Proceedings Article"
// },
// {
// "id": "journal",
// "label": "Journal"
// },
// {
// "id": "component",
// "label": "Component"
// },
// {
// "id": "book-chapter",
// "label": "Book Chapter"
// },
// {
// "id": "report-series",
// "label": "Report Series"
// },
// {
// "id": "proceedings",
// "label": "Proceedings"
// },
// {
// "id": "standard",
// "label": "Standard"
// },
// {
// "id": "reference-book",
// "label": "Reference Book"
// },
// {
// "id": "posted-content",
// "label": "Posted Content"
// },
// {
// "id": "journal-issue",
// "label": "Journal Issue"
// },
// {
// "id": "dissertation",
// "label": "Dissertation"
// },
// {
// "id": "dataset",
// "label": "Dataset"
// },
// {
// "id": "book-series",
// "label": "Book Series"
// },
// {
// "id": "edited-book",
// "label": "Edited Book"
// },
// {
// "id": "standard-series",
// "label": "Standard Series"
// }
// ]

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { QueryList, ViewChildren, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { AuthService } from '../../../../auth/auth.service';

import { UserService } from '../../../../user/services/user-service';

import { BuildMultiComponent } from './build-multi/build-multi';

import { objectMini } from '../../../services/shared-service';
import { Folder, Publication } from '../../../services/publication-service';
import { PeopleService } from '../../../services/people-service';
import { slideInOutAnimation } from '../../../animations/index';

declare var uploadcare: any;

import * as moment from 'moment';

// function ssnValidator(control: FormControl): {[key: string]: any} {
//   const value: string = control.value || '';
//   const valid = value.match(/^\d{9}$/);
//   return valid ? null : {ssn: true};
// }

@Component({
    selector: 'build-slide-publications',
    templateUrl: 'build-slide-publications.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-publications.css']
})

export class BuildSlidePublicationsComponent implements OnInit {
  @Input() groupId: string;
  @Input() userId: string;
  @Input() userFolders: Folder[] = [];
  @Input() newFlag: boolean;
  @Input() sourceType: number = 0; // 0: publication
                                   // 1: library
                                   // 2-4: PaperKit

  @Input() publication: Publication;
  @Input() dois: string[];

  @Output() cancel: EventEmitter <number> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  @ViewChildren(BuildMultiComponent) minis: QueryList<BuildMultiComponent>

  formModel: FormGroup;
  mode: number = 0;
  stepNum: number = null;

  uploadFlagFile: boolean = false;
  uploadFlagFilePublic: boolean = false;
  uploadFlagFilePrivate: boolean = false;

  file: string;
  file_public: string;
  file_private: string;

  submitStatus: boolean[] = [false, false, false, false];
  queryFlag: boolean = false;
  sameDoiFlag: boolean = false; // DOI exists in this parent
  doiFlag: boolean = false;     // DOI exists in Academig
  disableFlag: boolean = false;
  userFlag: boolean = false;
  rightsFlag: boolean = false;

  preProjects: objectMini[] = [];

  typeSelect: string[] = [
    'Paper',
    'Book',
    'Book Chapter',
    'Conference',
    'Patent',
    'Report'
  ];

  userFoldersNames: string[] = [];
  userExtraFolders: Folder[] = [];

  adminFlag: boolean = false;

  stickFoldersRadio: string[] = ['Read', 'Currently Reading', 'Want to Read'];
  stickFoldersRadioKey: string[] = ['read', 'current', 'want'];

  papersKitTitle = ['Beginners','Intermediate','Advanced'];

  public now: Date = new Date();

  constructor(
    private datepipe: DatePipe,
    private peopleService: PeopleService,
    private authService: AuthService,
    public userService: UserService
  ) {
    this.formModel = new FormGroup({
      publication: new FormControl(''),
      title: new FormControl('', [Validators.maxLength(500), Validators.minLength(6)]),
      rights: new FormControl(false),

      type: new FormControl(0, Validators.required),
      date: new FormControl('', Validators.required),
      abstract: new FormControl(''),
      url: new FormControl(''),
      doi: new FormControl(''),
      tags: new FormControl(''),
      publisher: new FormControl(''),

      referencesCount: new FormControl(''),
      citationsCount: new FormControl(''),
      references: new FormControl('')
    });
  }

  ngOnInit() {
    this.authService.token.subscribe(token => {
      this.adminFlag = this.authService.userHasScopes(token, ['write:groups'])
      if (this.adminFlag && this.newFlag) this.formModel.addControl('intelligence', new FormArray([new FormControl()]));
    });

    if (this.sourceType==0) {
      this.formModel.addControl('preAuthors', new FormControl('',Validators.required));
    } else {
      this.formModel.addControl('preAuthors', new FormControl(''));
    }
    // preAuthors: new FormControl('', (this.sourceType==0) ? Validators.required : null),

    if (this.sourceType==1) {
      this.formModel.addControl('newFolder', new FormControl(null));
      this.formModel.addControl('stickFolder', new FormControl(2));
      this.formModel.addControl('extraFolders', new FormArray([ ]));

      this.userFoldersNames = this.userFolders.map(r=>r.folder).filter(r=>this.stickFoldersRadioKey.indexOf(r)==-1)
      this.userExtraFolders = this.userFolders.filter(r=>this.stickFoldersRadioKey.indexOf(r.folder)==-1);

      const fieldNames = this.formModel.get('extraFolders') as FormArray;
      this.userExtraFolders.map(r=>r.folder).forEach((folder, index) => {
        fieldNames.push(new FormControl(false));
      })

      // this.formModel.addControl('extraFolders', new FormArray([new FormControl(false), new FormControl(false)]));
    }

    this.formModel.controls['preAuthors'].valueChanges.subscribe(data => {
      var authorsArr = this.formModel.controls['preAuthors'].value;
      if (Array.isArray(authorsArr)) {
        if (authorsArr.filter(r=>r._id==this.userId).length>0) this.userFlag=false;
      }
    })

    if (!this.newFlag) {
      this.formModel.controls['title'].setValue(this.publication.title);
      this.formModel.controls['type'].setValue(this.publication.type);
      this.formModel.controls['date'].setValue(this.datepipe.transform(this.publication.date, 'yyyy-MM-dd'));
      this.formModel.controls['abstract'].setValue(this.publication.abstract);
      // this.formModel.controls['url'].setValue(this.publication.url);
      // this.formModel.controls['doi'].setValue(this.publication.doi);
      // this.formModel.controls['tags'].setValue(this.publication.tags);
      // this.formModel.controls['publisher'].setValue(this.publication.publisher);
    }

    this.formModel.addControl('journal', new FormControl(''));
    this.formModel.addControl('abbr', new FormControl(''));
    this.formModel.addControl('volume', new FormControl(''));
    this.formModel.addControl('issue', new FormControl(''));
    this.formModel.addControl('pages', new FormControl(''));
    this.formModel.addControl('edition', new FormControl(''));

    this.mode = 0;
    this.stepNum = 0;

    this.now = new Date();
  }

  addFolderFunc() {
    const newFolderName: string = this.formModel.get('newFolder').value;
    const fieldNames = this.formModel.get('extraFolders') as FormArray;
    fieldNames.push(new FormControl(true));
    this.userFoldersNames.push(newFolderName)
    this.userExtraFolders.push({"_id": null, "folder": newFolderName, "count": 1, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null})
    this.userService.userFolders.push({"_id": null, "folder": newFolderName, "count": 1, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null})
  }

  validateFileType(fileInfo) {
    if (fileInfo.mimeType != null && fileInfo.mimeType.indexOf('image') == -1) {
      throw new Error('imageOnly');
    }
    if (fileInfo.mimeType != null && fileInfo.mimeType == 'image/tiff') {
      throw new Error('tiff');
    }
  }

  ngAfterViewInit() {
    if (this.sourceType==0 || (this.sourceType>=2 && this.sourceType<=4)) {

      const that = this;

      const widgetFiles = uploadcare.Widget('#file');
      widgetFiles.validators.push(that.validateFileType);
      widgetFiles.onChange(function(value) {
        if (value) {
          that.uploadFlagFile = true;
          value.promise().done(function(info) {
            that.file = info.cdnUrl;
            that.uploadFlagFile = false;
          });
        } else {
          that.file = '';
        }
      });

      const widgetFilesPublic = uploadcare.Widget('#file_public');
      widgetFilesPublic.onChange(function(value) {
        if (value) {
          that.uploadFlagFilePublic = true;
          value.promise().done(function(info) {
            that.file_public = info.cdnUrl;
            // console.log('that.file_public',that.file_public)
            that.uploadFlagFilePublic = false;
          });
        } else {
          that.file_public = '';
        }
      });

      const widgetFiles_private = uploadcare.Widget('#file_private');
      widgetFiles_private.onChange(function(value) {
        if (value) {
          that.uploadFlagFilePrivate = true;
          value.promise().done(function(info) {
            that.file_private = info.cdnUrl;
            that.uploadFlagFilePrivate = false;
          });
        } else {
          that.file_private = '';
        }
      });

    }
  }

  controlDOIFunc(event) {
    const doi: string = this.formModel.value.doi;
    this.sameDoiFlag = (doi && this.dois.findIndex(x => x == doi)>-1);
  }

  async controlTitleFunc(event) {
    const query = this.formModel.value.title;
    let type: number;

    if (query.name) {
      this.doiFlag = query.doiFlag ? query.doiFlag : null;
      switch (query.type) {
         case 'journal-article': { type = 0; break; }
         case 'posted-content': { type = 0; break; }

         case 'book': { type = 1; break; }
         case 'book-section': { type = 1; break; }
         case 'book-track': { type = 1; break; }
         case 'book-part': { type = 1; break; }
         case 'book-set': { type = 1; break; }
         case 'reference-book': { type = 1; break; }
         case 'book-series': { type = 1; break; }
         case 'edited-book': { type = 1; break; }

         case 'book-chapter': { type = 2; break; }

         case 'proceedings': { type = 3; break; }
         case 'proceedings-article': { type = 3; break; }

         case 'patent': { type = 4; break; } // FIX

         case 'report': { type = 5; break; }

         // default: { type = 6; } // Other
         default: { type = 0; } // Other // FIX
      }

      // book - editor names?

      this.formModel.controls['type'].setValue(type);

      this.mode = type;
      this.updateMode();

      let k: string;
      let arr: any; // Fix any

      if (query.author) {

        this.queryFlag = true;

        var authorsModified: string[] = [];
        query.author.forEach((author, index) => {
          if (author.given || author.family) {
            authorsModified.push((author.given ? author.given : '') + ' ' + (author.family ? author.family : ''))
          } else {
            authorsModified.push(author.name)
          }
        })

        const queryPeoples = await this.peopleService.queryPeoples(authorsModified);
        var preAuthors: objectMini[] = [];
        authorsModified.forEach((author, index) => {
          const queryFilter = queryPeoples.filter(r => r.name==author)[0];
          preAuthors.push(queryFilter ? queryFilter : {'_id': null, 'name': author, 'pic': null})
        })

        this.queryFlag = false;
        this.formModel.controls['preAuthors'].setValue(preAuthors);

        this.minis.forEach(
          mini =>
          (
            k = (mini.controlName == 'authors') ? 'author' : 'funder',
            arr = query[k] ? query[k] : [],
            mini.deleteALLFields(),
            arr.forEach((item, index) => {
              if (mini.controlName == 'fundings') {
                mini.addField({'_id': item.DOI, 'name': item.name, 'pic': null })
              }
            })
          )
        );
      }

      this.sameDoiFlag = (query.DOI && this.dois.findIndex(x => x == query.DOI)>-1);

      this.formModel.controls['doi'].setValue(query.DOI ? query.DOI : '');
      this.formModel.controls['url'].setValue(query.URL ? query.URL : '');
      this.formModel.controls['publisher'].setValue(query.publisher ? query.publisher : '');
      this.formModel.controls['abstract'].setValue(query.abstract ? query.abstract : '');
      // this.formModel.controls['tags'].setValue(query.subject ? query.subject : '');

      if (type!=1 && type!=3) this.formModel.controls['volume'].setValue(query.volume ? query.volume : '');

      if (type==0) this.formModel.controls['issue'].setValue(query.issue ? query.issue : '');

      if (type==1 || type==2) this.formModel.controls['edition'].setValue(query.edition ? query.edition : '');

      if (type!=5) this.formModel.controls['pages'].setValue(query.page ? query.page : '');

      const date: number[] = query.issued['date-parts'][0];
      if (!date[2]) { date[2] = 1; } // FIX!!!! what to do when Day is not aviliable in the Date?
      if (!date[1]) { date[1] = 1; } // FIX!!!! what to do when Month is not aviliable in the Date?
      if (date[0]) {
        // this.formModel.controls['date'].setValue(this.datepipe.transform(new Date(date[0], date[1], date[2]).getTimezoneOffset(), 'yyyy-MM-dd'));
        let dateWrapper = moment.utc([date[0], date[1]-1, date[2]]).format('YYYY-MM-DD');
        this.formModel.controls['date'].setValue(dateWrapper);
      } else {
        this.formModel.controls['date'].setValue(this.datepipe.transform('', 'YYYY-MM-DD'));
      }

      if ((type==0 || type==5)) {
        if (query['short-container-title'] && query['short-container-title'][0]) {
          this.formModel.controls['abbr'].setValue(query['short-container-title'][0]);
        } else {
          this.formModel.controls['abbr'].setValue('');
        }
      }

      if ((type==0 || type==3 || type==5)) {
        if (query['container-title'] && query['container-title'][0]) {
          this.formModel.controls['journal'].setValue({'name': query['container-title'][0]});
          // this.formModel.controls['journal'].setValue({'name': query['container-title'][0]});
        } else {
          this.formModel.controls['journal'].setValue({'name': ''});
          // this.formModel.controls['journal'].setValue({'name': ''});
        }
      }

      if (query['references-count'] != null) {
        this.formModel.controls['referencesCount'].setValue(query['references-count']);
      } else {
        this.formModel.controls['referencesCount'].setValue('');
      }

      if (query['is-referenced-by-count'] != null) {
        this.formModel.controls['citationsCount'].setValue(query['is-referenced-by-count']);
      } else {
        this.formModel.controls['citationsCount'].setValue('');
      }

      if (this.doiFlag) {
        this.formModel.value.authors = query.author;
        this.formModel.value.abstract = query.abstract;
        this.formModel.value.abstractPic = query.abstractPic;
      }

    } else {
      this.resetFields()
    }
  }

  resetFields() {
    this.doiFlag = false;
    this.sameDoiFlag = false;
    this.formModel.controls['preAuthors'].setValue(null);
    this.formModel.controls['type'].setValue(null);
    this.formModel.controls['date'].setValue(null);
    this.formModel.controls['abstract'].setValue(null);
    this.formModel.controls['url'].setValue(null);
    this.formModel.controls['doi'].setValue(null);
    this.formModel.controls['tags'].setValue(null);
    this.formModel.controls['publisher'].setValue(null);
  }

  updateMode() {
    this.mode = this.formModel.get('type').value;

    this.formModel.removeControl('journal');
    this.formModel.removeControl('abbr');
    this.formModel.removeControl('volume');
    this.formModel.removeControl('issue');
    this.formModel.removeControl('pages');
    this.formModel.removeControl('edition');

    // console.log('updateMode')

    switch (this.mode) {
      case 0: { // "Paper",
        this.formModel.addControl('journal', new FormControl(''));
        this.formModel.addControl('abbr', new FormControl(''));
        this.formModel.addControl('volume', new FormControl(''));
        this.formModel.addControl('issue', new FormControl(''));
        this.formModel.addControl('pages', new FormControl(''));
        break;
      }
      case 1: { // "Book",
        this.formModel.addControl('pages', new FormControl(''));
        this.formModel.addControl('edition', new FormControl(''));
        break;
      }
      case 2: { // "Book Chapter",
        this.formModel.addControl('volume', new FormControl(''));
        this.formModel.addControl('pages', new FormControl(''));
        this.formModel.addControl('edition', new FormControl(''));
        break;
      }
      case 3: { // "Conference",
        this.formModel.addControl('journal', new FormControl(''));
        this.formModel.addControl('pages', new FormControl(''));
        break;
      }
      case 4: { // "Patent",
        this.formModel.addControl('volume', new FormControl(''));
        this.formModel.addControl('pages', new FormControl(''));
        break;
      }
      case 5: { // "Report",
        this.formModel.addControl('journal', new FormControl(''));
        this.formModel.addControl('abbr', new FormControl(''));
        this.formModel.addControl('volume', new FormControl(''));
        break;
      }
    }
  }

  async changeStep(upDown: boolean, updateStep: number) {
    if (updateStep != null) {

      this.stepNum = updateStep;

    } else if (upDown == false) {

      this.stepNum--;

    } else {

      // [disabled]="(stepNum==0 && (!formModel.get('title').valid || sameDoiFlag)) || (stepNum==1 && !formModel.valid)"

      if (this.stepNum==2 || this.stepNum==3) {

        if (!this.formModel.valid) {
          this.submitStatus[this.stepNum] = !this.submitStatus[this.stepNum];
        } else {
          this.stepNum++;
        }

      } else if (this.stepNum==1) {
        this.userFlag = this.formModel.controls['preAuthors'].value ? this.formModel.controls['preAuthors'].value.filter(r=>r._id==this.userId).length==0 : true;
        // if (!this.formModel.valid || (this.userFlag && !this.adminFlag)) {
        if (!this.formModel.valid) {
          this.submitStatus[this.stepNum] = !this.submitStatus[this.stepNum];
        } else {
          const preAuthors = this.formModel.controls['preAuthors'].value;
          this.minis.forEach(mini => (
            preAuthors.forEach((author, index) => {
              if (mini.controlName == 'authors') {
                mini.addField(author)
              }
            })
          ))
          this.stepNum++;
        }

      } else {

        if (!this.formModel.get('title').valid || this.sameDoiFlag) {
          this.submitStatus[this.stepNum] = !this.submitStatus[this.stepNum];
        } else {
          this.stepNum++;
        }

      }

    }
  }

  onSubmit() {
    // (88292) Bora-Bora [2.23, 0.25, 2.9]
    if (this.formModel.valid) {

      if (this.formModel.value.title.name) this.formModel.value.title = this.formModel.value.title.name;

      // if (this.formModel.value.journal.name) this.formModel.value.journal = this.formModel.value.journal.name;

      if (this.formModel.value.tags==null) this.formModel.value.tags=[];

      if (this.formModel.value.fundings) this.formModel.value.fundings.map(r => r.name = (r.name.name ? r.name.name : r.name));

      if (this.sourceType==0) this.formModel.value.projects = this.formModel.value.projects.filter((elem, index, arr) => this.formModel.value.projects[index] === true);

      // if (this.formModel.value.authors && !this.doiFlag) {
      //   this.formModel.value.authors = this.formModel.value.authors.map(
      //     r => Object.assign(r.name.name ? r.name : {"_id": null, "name": r.name}, {"email": r.email})
      //   )
      // }

      this.formModel.value.stickFolder = this.stickFoldersRadioKey[this.formModel.value.stickFolder];

      this.formModel.value.extraFolders = this.userExtraFolders.filter((folder, index, arr) => {
        return (this.formModel.value.extraFolders[index]==true)
      }).map(f => f.folder)

      if (this.file_public) {
        this.formModel.value.pdf = this.file_public;
        this.formModel.value.pdfMode = 2;
      } else if (this.file_private) {
        this.formModel.value.pdf = this.file_private;
        this.formModel.value.pdfMode = 1;
      } else {
        this.formModel.value.pdf = 0;
        this.formModel.value.pdfMode = 0;
      }

      this.formModel.value.abstractPic = this.file;

      if (this.sourceType!=0) this.formModel.value.authors = this.formModel.value.preAuthors || [];

      this.disableFlag = true;
      this.update.emit(this.formModel.value);
      if (this.sourceType==0) {
        this.stepNum = (this.stepNum==0) ? 5 : this.stepNum+1;
        this.disableFlag = false;
      }
    } else {
      this.submitStatus[this.stepNum] = !this.submitStatus[this.stepNum];
    }
  }

  onCancel(mode: number) {
    this.cancel.emit(mode);
  }

  onReset() {
    this.stepNum = 0;
    this.formModel.controls['title'].setValue({"name": null});
    this.formModel.controls['title'].updateValueAndValidity();
    // this.formModel.controls['authors'].setValue(null);
    this.formModel.controls['fundings'].setValue(null);
    this.formModel.controls['projects'].setValue(null);
    this.resetFields();
    this.formModel.reset();

    // this.formModel.controls['start'].updateValueAndValidity({emitEvent: false});
  }

}
