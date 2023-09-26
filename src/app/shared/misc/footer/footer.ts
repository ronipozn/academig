import {Component, Input, Output, EventEmitter, OnChanges, IterableDiffers} from '@angular/core';

import {Subscription} from 'rxjs/Subscription';

import {groupComplex} from '../../services/shared-service';

import {PublicInfo, SocialInfo} from '../../../shared/services/shared-service';

@Component({
    selector: 'site-footer',
    templateUrl: 'footer.html',
    styleUrls: ['footer.css']
})
export class FooterComponent implements OnChanges {
  @Input() pic: string;
  @Input() link: string;
  @Input() linkFlag: boolean = true;
  @Input() type: number = 0; // 0 - Profile, Group
                             // 1 - Department
                             // 2 - University
                             // 3 - Items
  @Input() privateFlag: boolean;

  @Input() progress: number[];

  @Input() set name(value: string) {
    const matches = value.match(/\b(\w)/g);
    const matchesR = value.match(/[\wа-я]+/ig);

    if (matches) {
      this.acronym = matches.join('').substring(0, 2).toUpperCase();
    } else if (matchesR) {
      this.acronym = matchesR.join('').substring(0, 2).toUpperCase();
    }

    this.setName = value;
  }

  @Input() set groupIndex(value: groupComplex) {
    if (value) {
      if (value.group) {
        // const matches = value.group.name.match(/\b(\w)/g);
        // this.acronym = matches.join('').substring(0, 2).toUpperCase();
        this.group =  value.group.name;
        this.groupLink =  value.group.link;
      }
      this.university = value.university.name;
      this.department =  value.department.name;
      this.universityLink = value.university.link;
      this.departmentLink =  value.department.link;
    }
  }

  @Input() public: PublicInfo;
  @Input() social: SocialInfo;

  @Input() streamPublic: number;
  @Input() streamSocial: number;

  @Input() btnEditFlag: boolean;

  @Output() buttonPublicClick: EventEmitter <boolean> = new EventEmitter(true);
  @Output() buttonSocialClick: EventEmitter <boolean> = new EventEmitter(true);

  @Output() animationEndPublic: EventEmitter <boolean> = new EventEmitter(true);
  @Output() animationEndSocial: EventEmitter <boolean> = new EventEmitter(true);

  setName: string;
  acronym: string;

  setProgress: number[];
  differ: any;

  university: string;
  department: string;
  group: string;

  universityLink: string;
  departmentLink: string;
  groupLink: string;

  list: number[][];
  rows: number[];

  pageNames: string[] = [
    'Network','Publications','Projects','Services','Funding',
    'Teaching','Gallery','Media','News','Contact','People',
    'Collaborations','FAQ','Jobs','Seminars','Outreach'
  ];

  pageLinks: string[] = [
    'network','publications','projects','services','funding',
    'teaching','gallery','media','news','contact','people',
    'collaborations','faq','jobs','seminars','outreach'
  ];

  animationDone(type: number): void {
    if (type==0) {
      this.animationEndPublic.emit(true);
    } else {
      this.animationEndSocial.emit(true);
    }
  }

  onPublic() {
    this.buttonPublicClick.emit(false);
  }

  onSocial() {
    this.buttonSocialClick.emit(false);
  }

  constructor(private differs: IterableDiffers) {
    this.differ = differs.find([]).create(null);
  }

  ngOnChanges() {
    this.setProgress = this.progress;
    // console.log('setProgress',this.setProgress)

    const change = this.differ.diff(this.setProgress);
    if (change) {
      this.calcFooter();
    }
  }

  calcFooter() {
    // console.log('calcFooter')
    var col: number, row: number;

    if (this.type==0) {
      if (this.group) {
        this.list = [[0,10,1],[],[],[]];
        col=0; row=1;
        if (this.setProgress[6] || this.setProgress[7]) {this.list[row].push(3); col++; if (col==3) {col=0, row++;}};
        if (this.setProgress[11] || this.setProgress[12]) {this.list[row].push(11); col++; if (col==3) {col=0, row++;}};
        if (this.setProgress[13]) {this.list[row].push(4); col++; if (col==3) {col=0, row++;}};
        if (this.setProgress[29]) {this.list[row].push(15); col++; if (col==3) {col=0, row++;}};
        if (this.setProgress[28]) {this.list[row].push(5); col++; if (col==3) {col=0, row++;}};
        if (this.setProgress[27]) {this.list[row].push(6); col++; if (col==3) {col=0, row++;}};
        if (this.setProgress[17] || this.setProgress[18] || this.setProgress[19]) {this.list[row].push(11); col++; if (col==3) {col=0, row++;}};
        if (this.setProgress[14] || this.setProgress[15] || this.setProgress[16]) {this.list[row].push(13); col++; if (col==3) {col=0, row++;}};
        if (this.setProgress[20]) {this.list[row].push(12); col++; if (col==3) {col=0, row++;}};
        if (this.setProgress[24]) {this.list[row].push(14); col++; if (col==3) {col=0, row++;}};
        // *ngIf="privateFlag"><a role="button" [routerLink]="['./private']">Private Area
      } else {
        this.list = [[0,1],[],[],[]];
        col=1; row=0;
        if (this.setProgress[9]) {this.list[row].push(2); col++; if (col==3) {col=0, row++;}};
        if (this.setProgress[8]) {this.list[row].push(3); col++; if (col==3) {col=0, row++;}};
        if (this.setProgress[10]) {this.list[row].push(4); col++; if (col==3) {col=0, row++;}};
        if (this.setProgress[11]) {this.list[row].push(5); col++; if (col==3) {col=0, row++;}};
        if (this.setProgress[12]) {this.list[row].push(6); col++; if (col==3) {col=0, row++;}};
        if (this.setProgress[13]) {this.list[row].push(7); col++; if (col==3) {col=0, row++;}};
      }

      this.list[row].push(8); if (col==3) {col=0, row++;};
      this.list[row].push(9); if (col==3) {col=0, row++;};

      this.rows = new Array(row+1).fill(0);
    }
  }

}
