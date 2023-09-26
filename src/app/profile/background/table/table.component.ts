import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

import {Profile, Position, Education, ProfileSortService, titlesTypes} from '../../../shared/services/people-service';
import {Job, Honor, Outreach, Service} from '../../../shared/services/people-service';

@Component({
    selector: 'background-table',
    templateUrl: 'table.html',
    styleUrls: ['table.css']
})
export class TableComponent implements OnInit {
    @Input() sourceType: number; // 0 - group, 1 - wall
    @Input() meFlag: boolean;
    @Input() tableMode: number;
    @Input() profile: Profile;
    @Input() positions: Position[];
    @Input() educations: Education[];
    @Input() stream: number[];

    @Input() set tableToggle(value: boolean) {
      if (this.profile || this.positions || this.educations) {
        this.onSortFunc(this.tableMode);
      }
    }

    @Output() buildWebsiteClick: EventEmitter <{_id: string, mode: boolean}> = new EventEmitter(true);
    @Output() buildFlag: EventEmitter <{headline: string}> = new EventEmitter(true);
    @Output() buttonEditClick: EventEmitter <{headline: string, index: number, _id: string}> = new EventEmitter();
    @Output() buttonDeleteClick: EventEmitter <{index: number, _id: string}> = new EventEmitter();
    @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();
    @Output() pdfClick: EventEmitter <{title: string, fileName: string}> = new EventEmitter();

    headlineText: string;
    theadTexts: string[];
    titlesSelect = titlesTypes;

    tableFlag: boolean;

    positionsSort: Position[];
    educationsSort: Education[];
    honorsSort: Honor[];
    jobsSort: Job[];
    outreachSort: Outreach[];
    servicesSort: Service[];

    constructor(public sortService: ProfileSortService) { }

    ngOnInit() {
      switch (this.tableMode) {
         case 0: {
           this.headlineText = 'Positions';
           this.theadTexts = ['', 'Years', 'Position'];
           // this.theadTextsXS = ['', 'Years and Position'];
           break;
         }
         case 1: {
           this.headlineText = 'Education';
           this.theadTexts=['', "Years", "Degree", "Thesis"];
           break;
         }
         case 2: {
           this.headlineText = 'Honors, Awards and Fellowships';
           this.theadTexts = ['Years', 'Name'];
           break;
         }
         case 3: {
           this.headlineText = 'Industry';
           // this.theadTexts = ['Years', 'Company', 'Title and Description'];
           this.theadTexts = ['Years', 'Company'];
           break;
         }
         case 4: {
           this.headlineText = 'Outreach';
           this.theadTexts = ['Years', 'Name and Description'];
           break;
         }
         case 6: {
           this.headlineText = 'Editorial Boards, Service and Committees';
           this.theadTexts = ['Years', 'Journal', 'Role'];
           break;
         }
         case 7: {
           this.headlineText = 'Societies and Organizations';
           break;
         }
         case 8: {
           this.headlineText = 'Languages';
           break;
         }
         // default: console.log('Invalid mode');
      };

      if (this.tableMode < 7) {
        this.onSortFunc(this.tableMode);
      };

    }

    onSortFunc(mode: number) {
      // pay attention to the mutating of the Input arrays!
      // this.publicationsOriginal = this.publications.slice(0); // avoid mutating, duplicate array instead

      switch (mode) {
         case 0: {
           this.positionsSort = this.positions.slice(0); // avoid mutating, duplicate array instead
           this.sortService.arraySort(this.positionsSort);
           break;
         }
         case 1: {
           this.educationsSort = this.educations.slice(0); // avoid mutating, duplicate array instead
           this.sortService.arraySort(this.educationsSort);
           break;
         }
         case 2: {
           this.honorsSort = this.profile.honors.slice(0); // avoid mutating, duplicate array instead
           this.sortService.arraySort(this.honorsSort);
           break;
         }
         case 3: {
           this.positionsSort = this.positions.slice(0); // avoid mutating, duplicate array instead
           this.sortService.arraySort(this.positionsSort);
           break;
         }
         case 4: {
           this.outreachSort = this.profile.outreach.slice(0); // avoid mutating, duplicate array instead
           this.sortService.arraySort(this.profile.outreach);
           break;
         }
         case 5: { } // teaching - moved
         case 6: {
           this.servicesSort = this.profile.services.slice(0); // avoid mutating, duplicate array instead
           this.sortService.arraySort(this.profile.services);
           break;
         }
         // default: console.log('Invalid mode');
      };
    }

    pdfSlide(title: string, fileName: string) {
      this.pdfClick.emit({title: 'Thesis', fileName: fileName});
    }

    buttonEditFunc(index: number, _id: string): void {
      this.buttonEditClick.emit({headline: this.headlineText, index: index, _id: _id});
    }

    buttonDeleteFunc(index: number, _id: string): void {
      this.buttonDeleteClick.emit({index: index, _id: _id});
    }

    tableSlide(flag: boolean) {
      this.buildFlag.emit({headline: this.headlineText}); ;
    }

    buildWebsiteFunc(_id: string, mode: boolean) {
      this.buildWebsiteClick.emit({_id: _id, mode: mode});
    }

    animationDone(event, i: number): void {
      this.animationDoneEvent.emit(true);
    }

}
