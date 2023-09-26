import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';

import {PeopleService} from '../../services/people-service';
import {SettingsService} from '../../services/settings-service';

import {objectMini, groupComplex} from '../../services/shared-service';

@Component({
    selector: 'modal-report',
    templateUrl: 'modal-report.html',
    styleUrls: ['modal-report.css']
})
export class ModalReportComponent implements OnInit {
  @Input() mode: number; // 0 - group
                         // 1 - people
  @Input() userId: string;
  @Input() item: objectMini;
  @Input() groupIndex: groupComplex;

  @Output() closeModal: EventEmitter <boolean> = new EventEmitter();

  streamRetrieved: boolean[] = [true, true, true];
  btnsDisabled = false;

  itemType: string;
  message: string = '';

  constructor(private peopleService: PeopleService,
              private settingsService: SettingsService) {}

  ngOnInit() {
    switch (this.mode) {
       case 0: this.itemType = 'group'; break;
       case 1: this.itemType = 'user'; break;
       case 2: this.itemType = 'publication'; break;
       case 3: this.itemType = 'resource'; break;
       case 4: this.itemType = 'project'; break;
       case 5: this.itemType = 'position'; break;
       // default: console.log('Invalid choice');
    }
  }

  async sendReport(type: number) {
    this.streamRetrieved[type] = false;
    this.btnsDisabled = true;

    await this.settingsService.putReport(this.mode, this.item, this.groupIndex, type, this.message);

    this.streamRetrieved[type] = true;
    this.btnsDisabled = false;
    this.message = '';
    this.closeModal.emit(true);
  }

}
