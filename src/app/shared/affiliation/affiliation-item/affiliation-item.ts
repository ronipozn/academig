import {Component, Input, Output, EventEmitter} from '@angular/core';

import {Affiliation} from '../../../shared/services/shared-service';

@Component({
  selector: 'affiliation-item',
  templateUrl: 'affiliation-item.html',
  styleUrls: ['affiliation-item.css'],
})
export class AffiliationItemComponent {
  @Input() affiliation: Affiliation;
  @Input() showEditBtn: boolean;
  @Input() updateFlag: boolean = false;
  @Input() stream: number;
  @Input() index: number;

  @Output() buttonUpdateClick: EventEmitter <boolean> = new EventEmitter();
  @Output() buttonDeleteClick: EventEmitter <boolean> = new EventEmitter();
  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  sourceDomain: string;

  ngOnInit() {
    if (this.affiliation.source) {
      const matches = this.affiliation.source.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i);
      this.sourceDomain = matches && matches[1];
    }
  }

  buttonUpdateFunc(): void {
    this.buttonUpdateClick.emit(true);
  }

  buttonDeleteFunc(): void {
    this.buttonDeleteClick.emit(true);
  }

  animationDone(): void {
    this.animationDoneEvent.emit(true);
  }

}
