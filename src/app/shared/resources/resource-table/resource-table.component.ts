import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
// import {NgSwitch, NgSwitchDefault} from '@angular/common';

import {Core, Code, Inventory, Equipment} from '../../services/resource-service';

@Component({
    selector: 'resource-table',
    templateUrl: 'resource-table.html',
    styleUrls: ['resource-table.css']
})
export class ResourceTableComponent implements OnInit {
    @Input() showEditBtn: boolean;
    @Input() tableMode: number;
    @Input() stream: number[];

    @Input() manuals: Core[];
    @Input() codes: Code[];
    @Input() cads: Core[];
    @Input() inventories: Inventory[];
    @Input() equipments: Equipment[];

    @Input() sourceType: number;

    @Output() pdfSlideClick: EventEmitter <{flag: boolean, title: string, fileName: string}> = new EventEmitter(true);
    @Output() buildFlag: EventEmitter <{mode: number, headline: string}> = new EventEmitter(true);
    @Output() buttonEditClick: EventEmitter <{mode: number, index: number, headline: string}> = new EventEmitter();
    @Output() buttonDeleteClick: EventEmitter <{mode: number, index: number}> = new EventEmitter();
    @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

    headlineText: string;
    theadTexts: string[];

    showButton: boolean[] = [];
    tableFlag: boolean;

    pdfSlideFlag = false;
    pdfTitle: string;
    pdfFileName: string;

    ngOnInit() {
      switch (this.tableMode) {
         case 0: {
           this.headlineText = 'Manuals';
           this.theadTexts = [''];
           break;
         }
         case 1: {
           this.headlineText = 'Code';
           this.theadTexts = [''];
           break;
         }
         case 2: {
           this.headlineText = 'CAD';
           this.theadTexts = [''];
           break;
         }
         case 3: {
           this.headlineText = 'Inventory';
           this.theadTexts = ['', 'Details'];
           break;
         }
         case 4: {
           this.headlineText = 'Equipment';
           this.theadTexts = ['', 'Details'];
           break;
         }
         // default: { console.log('Invalid resource table mode'); }
      }

    }

    isPDF(name: string) {
      return name.split('.').pop() == 'pdf';
    }

    pdfSlide(flag: boolean, title: string, fileName: string) {
      this.pdfSlideClick.emit({flag: flag, title: title, fileName: fileName});
      // HTML of pdfSlide is one component up because of z-index issues
    }

    buttonOver(showStatus: boolean, i: number) {
      if (this.showEditBtn) {
        this.showButton[i] = showStatus;
      }
    }

    tableSlide() {
      this.buildFlag.emit({mode: this.tableMode, headline: this.headlineText}); ;
    }

    buttonEditFunc(i: number) {
      this.buttonEditClick.emit({mode: this.tableMode, index: i, headline: this.headlineText}); ;
    }

    buttonDeleteFunc(i: number) {
      this.buttonDeleteClick.emit({mode: this.tableMode, index: i});
    }

    animationDone(event, i: number): void {
      this.showButton[i] = false;
      this.animationDoneEvent.emit(true);
    }

    createRange(groupName: string) {
      // const picsCount = groupName ? Number(groupName[groupName.length - 2]) : 0;
      const picsCount = Number(groupName.substring(groupName.lastIndexOf("~") + 1,groupName.lastIndexOf("/")));

      const items: number[] = [];
      for (let i = 1; i <= picsCount; i++) {
         items.push(i);
      }
      return items;
    }

    createFile(groupName: string, i: number) {
      return (groupName + 'nth/' + i + '/');
    }

}
