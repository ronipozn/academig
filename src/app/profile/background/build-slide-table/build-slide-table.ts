import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CustomValidators } from 'ng2-validation';
// import { PDFProgressData } from 'ng2-pdf-viewer';

import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

import { ValidatorsService } from '../../../shared/services/shared-service';
import { Profile, Position, Education, Honor, Outreach, Service, Society, Language} from '../../../shared/services/people-service';
import { GroupService } from '../../../shared/services/group-service';
import { FundingProfile } from '../../../shared/services/funding-service';

import {Departments, departmentsItems, UniversityService} from '../../../shared/services/university-service';

import {environment} from '../../../../environments/environment';
import { slideInOutAnimation } from '../../../shared/animations/index';

declare var uploadcare: any;

function idValidator(control: FormControl): {[key: string]: any} {
  const value: string = control.value._id || '';
  const valid = value;
  return valid ? null : {ssn: true};
}

export const existValidator = (existFlag: boolean) => {
  return (control: FormControl) => {
    if (existFlag==false) {
      return null;
    }
    return {value: {valid: false}};
  };
};

@Component({
    selector: 'build-slide-table',
    templateUrl: 'build-slide-table.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-table.css']
})

export class BuildSlideTableComponent implements OnInit {
  @Input() headline: string;
  @Input() newFlag: boolean;
  @Input() mode: number;
  @Input() userId: string;

  @Input() position: Position;
  @Input() education: Education;
  @Input() company: Position;

  @Input() honor: Honor;
  @Input() funding: FundingProfile;
  @Input() outreach: Outreach;
  @Input() service: Service;
  @Input() society: Society;
  @Input() language: Language;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  formModel: FormGroup;
  submitStatus: boolean = false;

  uploadFlagFile: boolean = false;
  thesisFile: string;

  newString: string;
  entityName: string;

  start: Date;
  end: Date;
  modeDate: number;

  universityId: string = null;
  departmentId: string = null;
  groupId: string = null;

  companyItems: departmentsItems;
  companyFlag: boolean = false;

  existFlag: boolean = false;
  searching: boolean = false;

  departments = Departments;
  formatter = (x: {name: string}) => x.name;
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.departments.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 20))
    )

  languageLevelRadio = ['Beginner', 'Intermediate', 'Advanced', 'Proficient'];
  boardsRoleRadio = ['Editorial Board', 'Deputy Editor', 'Associate Editor', 'Consulting Editor'];

  educationSelectNew = [{display: 'B.A.Sc.', value: 400},
                        {display: 'B.Sc.', value: 401},
                        {display: 'B.A.', value: 402},
                        {display: 'M.Sc.', value: 300},
                        {display: 'Ph.D.', value: 301}];

  educationSelectGroup = [{display: 'M.Sc.', value: 300},
                          {display: 'Ph.D.', value: 301}];

  educationSelectNonGroup = [{display: 'B.A.Sc.', value: 400},
                             {display: 'B.Sc.', value: 401},
                             {display: 'B.A.', value: 402}];

  positionSelect = [
                    {display: 'Full Professor', value: 100},
                    {display: 'Associate Professor', value: 101},
                    {display: 'Assistant Professor', value: 102},
                    {display: 'Professor Emeritus', value: 103},

                    // {display: 'Director', value: 150},
                    // {display: 'Research Chair', value: 151},
                    {display: 'Lab Technician', value: 152},
                    {display: 'Lab Assistant', value: 153},
                    {display: 'Lab Secretary', value: 154},

                    {display: 'Senior Staff', value: 155},
                    {display: 'Lab Manager', value: 156},
                    {display: 'Research Assistant Professor', value: 157},

                    {display: 'Assistant Researcher', value: 160},

                    // {display: 'Post-Doctoral Research Associate', value: 200},
                    // {display: 'Post-Doctoral Fellow', value: 201},
                    {display: 'Postdoc', value: 201}];

  constructor(private datepipe: DatePipe,
              private validatorsService: ValidatorsService,
              public universityService: UniversityService,
              public groupService: GroupService) { }

  ngOnInit() {
    this.newString = this.newFlag ? 'Add' : 'Update';

    if (this.mode == 0) {
      this.formModel = new FormGroup({
        titles: new FormControl(this.newFlag ? null : this.position.titles[0], Validators.required),
      });

      this.entityName = 'Lab';
      if (!this.newFlag) {
        this.start = this.position.period.start;
        this.end = this.position.period.end
        this.modeDate = this.position.period.mode;
      } else {
        this.formModel.addControl('university', new FormControl('', idValidator));
        this.formModel.addControl('department', new FormControl('', Validators.required));
        this.formModel.addControl('group', new FormControl('', [Validators.required, Validators.maxLength(50), Validators.minLength(5)]));
        // existValidator(this.existFlag),
      }

    } else if (this.mode == 1) {

      this.formModel = new FormGroup({
        titles: new FormControl(this.newFlag ? null : this.education.titles[0], Validators.required),
        field: new FormControl(this.newFlag ? '' : (this.education.degree ? this.education.degree.field : '')),
        thesisTitle: new FormControl(this.newFlag ? '' : (this.education.degree ? this.education.degree.thesis : '')),
        // thesisGrade: new FormControl(this.newFlag ? '' : this.education.degree.grade)
        // honor: new FormControl(this.newFlag ? '' : this.education.degree.honor),
      });

      this.entityName = 'Lab';
      if (!this.newFlag) {
        this.start = this.education.period.start;
        this.end = this.education.period.end;
        this.modeDate = this.education.period.mode;
        this.thesisFile = (this.education.degree ? this.education.degree.file : '');
      } else {
        this.formModel.addControl('university', new FormControl('', idValidator));
        this.formModel.addControl('department', new FormControl('', Validators.required));
        this.formModel.addControl('group', new FormControl('', [Validators.required, Validators.maxLength(50), Validators.minLength(5)]));
        // existValidator(this.existFlag),
      }

    } else if (this.mode == 2) {

      if (!this.newFlag) {
        this.start = this.honor.period.start;
        this.end = this.honor.period.end;
        this.modeDate = this.honor.period.mode;
      }
      this.formModel = new FormGroup({
        name: new FormControl(this.newFlag ? '' : this.honor.name, Validators.required),
      });

    } else if (this.mode == 3) {

      this.formModel = new FormGroup({
        titles: new FormControl(this.newFlag ? null : this.company.titles[0], Validators.required),
      });

      this.universityId = environment.companyId;
      this.entityName = 'Company';

      this.queryCompanyFields(this.universityId)

      if (!this.newFlag) {
        this.start = this.company.period.start;
        this.end = this.company.period.end
        this.modeDate = this.company.period.mode;
      } else {
        this.formModel.addControl('university', new FormControl({'_id': this.universityId, 'name': 'company', 'pic': ''}));
        this.formModel.addControl('department', new FormControl('', [Validators.required, Validators.maxLength(2)]));
        this.formModel.addControl('group', new FormControl('', [Validators.required, Validators.maxLength(50), Validators.minLength(5)]));
      }

    } else if (this.mode == 4) {
      if (!this.newFlag) {
        this.start = this.outreach.period.start;
        this.end = this.outreach.period.end;
        this.modeDate = this.outreach.period.mode;
      }
      this.formModel = new FormGroup({
        name: new FormControl(this.newFlag ? '' : this.outreach.name, Validators.required),
        role: new FormControl(this.newFlag ? '' : this.outreach.role, Validators.required),
      });

    } else if (this.mode == 6) {

      if (!this.newFlag) {
        this.start = this.service.period.start;
        this.end = this.service.period.end;
        this.modeDate = this.service.period.mode;
      }
      this.formModel = new FormGroup({
        journal: new FormControl(this.newFlag ? '' : {'name': this.service.journal.name, 'issn': this.service.journal.issn}),
        role: new FormControl(this.newFlag ? 0 : this.service.role, Validators.required),
      });

    } else if (this.mode == 7) {

      this.formModel = new FormGroup({
        name: new FormControl(this.newFlag ? '' : this.society.name, Validators.required),
      });

    } else if (this.mode == 8) {

      this.formModel = new FormGroup({
        language: new FormControl(this.newFlag ? '' : {'id': 0, 'name': this.language.name, 'pic': null}, Validators.required),
        level: new FormControl(this.newFlag ? 0 : this.language.level, Validators.required),
      });

    } else if (this.mode == 9) {

      if (!this.newFlag) {
        this.start = this.funding.period.start;
        this.end = this.funding.period.end;
        this.modeDate = this.funding.period.mode;
      }
      this.formModel = new FormGroup({
        name: new FormControl(this.newFlag ? '' : {name: this.funding.name}, Validators.required),
        abbr: new FormControl(this.newFlag ? '' : this.funding.abbr, Validators.required),
        officalId: new FormControl(this.newFlag ? '' : this.funding.officalId),
        link: new FormControl(this.newFlag ? '' : this.funding.link, CustomValidators.url),
        description: new FormControl(this.newFlag ? '' : this.funding.description),
      });
      this.formModel.controls['link'].valueChanges.subscribe((value: string) => {
        this.formModel.controls['link'].setValue(value.trim(), {emitEvent: false});
      });

    }

    if (this.mode<7 || this.mode==9) {
      this.formModel.addControl('start', this.newFlag ?
                                new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]) :
                                new FormControl(this.datepipe.transform(this.start, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required]));

      this.formModel.addControl('end', this.newFlag ?
                                new FormControl('', [this.validatorsService.rangeValidator({'range': ''}), Validators.required]) :
                                new FormControl(this.datepipe.transform(this.end, 'yyyy-MM'), [this.validatorsService.rangeValidator({'range': ''}), Validators.required]));

      this.formModel.controls['start'].valueChanges.subscribe((value: string) => {
        this.formModel.controls['end'].updateValueAndValidity({emitEvent: false});
      });

      this.formModel.controls['end'].valueChanges.subscribe((value: string) => {
        this.formModel.controls['start'].updateValueAndValidity({emitEvent: false});
      });

      this.formModel.addControl('single',
        new FormArray([
          new FormControl(this.newFlag ? false : (this.modeDate == 2))
        ]),
      );

      this.formModel.addControl('present',
        new FormArray([
          new FormControl(this.newFlag ? false : (this.modeDate == 1))
        ]),
      );
    }

  }

  controlStatusFunc(flag: boolean, i: number) {
    if (flag == false) {

      if (this.mode==1) {
        var title = this.formModel.get('titles').value;
        var bachelorFlag: boolean = title==400 || title==401 || title==402 ||title==302;
      }

      if (i == 0) {

        if (this.mode==1) {
          if (bachelorFlag) {
            if (this.newFlag) this.formModel.controls['group'].disable();
            this.thesisToggle(false)
          } else {
            if (this.newFlag) this.formModel.controls['group'].enable();
            this.formModel.controls['present'].value[0] ? null : this.thesisToggle(true);
          }
        }

      } else if (i == 1) {

        this.formModel.controls['single'].value[0] ?
          (
            this.formModel.controls['end'].disable(),
            this.formModel.controls['present'].disable()
          ) : (
            this.formModel.controls['end'].enable(),
            this.formModel.controls['present'].enable()
          );

        if (this.mode==1) (this.formModel.controls['single'].value[0] || bachelorFlag) ? this.thesisToggle(false) : this.thesisToggle(true);

      } else if (i == 2 && this.formModel.controls['single'].value[0] == false) {

        this.formModel.controls['present'].value[0] ?
          this.formModel.controls['end'].disable() : this.formModel.controls['end'].enable();

        if (this.mode==1) (this.formModel.controls['present'].value[0] || bachelorFlag) ? this.thesisToggle(false) : this.thesisToggle(true);

      }
    }
  }

  thesisToggle(flag: boolean) {
    const widgetThesis = uploadcare.Widget('#file');
    const uploadBtn = widgetThesis.inputElement.nextSibling.querySelector('.uploadcare--widget__button_type_open')

    if (flag==false) {
      this.formModel.controls['thesisTitle'].setValue(''),
      this.formModel.controls['thesisTitle'].disable(),
      this.thesisFile= '',
      widgetThesis.value(this.thesisFile),
      uploadBtn.disabled = true
    } else {
      this.formModel.controls['thesisTitle'].enable(),
      uploadBtn.disabled = false
    }
  }

  onSubmit() {
    if (this.formModel.valid) {
      if (this.mode == 1) {
        this.formModel.value.thesisFile = this.thesisFile;
      } else if (this.mode == 3) {
        this.formModel.value.department = this.companyItems[this.formModel.value.department];
      } else if (this.mode == 5) {
        this.formModel.value.university = this.formModel.value.university.name ? this.formModel.value.university.name : this.formModel.value.university ;
      } else if (this.mode == 6) {
        this.formModel.value.journal = this.formModel.value.journal.name ? this.formModel.value.journal : {name: this.formModel.value.journal, issn: []} ;
      } else if (this.mode == 8 && !this.formModel.value.language.name) {
        this.formModel.value.language = {'_id': null, 'name': this.formModel.value.language, 'pic': null};
      } else if (this.mode == 9) {
        this.formModel.value.name = this.formModel.value.name.name ? this.formModel.value.name.name : this.formModel.value.name;
      }
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

  async keyUp(i: number) {
    let universityField = this.formModel.get('university').value;
    let departmentField = this.formModel.get('department').value;
    let groupField = this.formModel.get('group').value;

    if (i == 0) {

      this.universityId = universityField ? universityField.academigId : null;

    } else if (i == 1) {

      this.departmentId = departmentField ? departmentField._id : null;

    } else if (i == 2) {

      this.groupId = groupField ? groupField._id : null;
      this.searching = false;

      const result = await this.groupService.groupExist(this.universityId, this.departmentId, groupField);

      this.existFlag = result ? true : false;

      this.searching = true;

    }

  }

  companyField() {
    let fieldIndex = this.formModel.get('department').value;
    this.departmentId = this.companyItems[fieldIndex]._id;
  }

  controlFundingFunc(event) {
    let query = this.formModel.value.name;
    if (query.name) {
      if (query.id) { this.formModel.controls['officalId'].setValue(query.id); }
      if (query['alt-names'][0]) { this.formModel.controls['abbr'].setValue(query['alt-names'][0]); }
      if (query['uri']) { this.formModel.controls['link'].setValue(query['uri']); }
    }
  }

  async queryCompanyFields(universityId: string) {
    this.companyFlag = false;
    this.companyItems = await this.universityService.getDepartments(universityId,'');
    this.companyFlag = true;
  }

  ngAfterViewInit() {
    this.controlStatusFunc(false,0);
    this.controlStatusFunc(false,1);
    this.controlStatusFunc(false,2);

    if (this.mode==1) {
      const that = this;

      const widgetThesis = uploadcare.Widget('#file');
      if (!this.newFlag) widgetThesis.value(that.thesisFile);

      widgetThesis.onChange(function(value) {
        if (value) {
          that.uploadFlagFile = true;
          value.promise().done(function(info) {
            that.thesisFile = info.cdnUrl;
            that.uploadFlagFile = false;
          });
        } else {
          that.thesisFile = '';
        }
      });
    }
  }

}
