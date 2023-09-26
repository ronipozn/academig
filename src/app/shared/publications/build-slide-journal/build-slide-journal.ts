import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Journal } from '../../services/publication-service';

import { slideInOutAnimation } from '../../../shared/animations/index';

@Component({
    selector: 'build-slide-journal',
    templateUrl: 'build-slide-journal.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-journal.css']
})

export class BuildSlideJournalComponent implements OnInit {
  @Input() journal: Journal;
  @Input() volume: string;
  @Input() issue: string;
  @Input() pages: string;
  @Input() publisher: string;
  // @Input() publicInfo: PublicInfo;

  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);
  @Output() update: EventEmitter <any> = new EventEmitter(true);

  submitStatus = false;
  formModel: FormGroup;

  ngOnInit() {
    this.formModel = new FormGroup({
      journal: new FormControl(this.journal ? this.journal : ''),
      volume: new FormControl(this.volume ? this.volume : ''),
      issue: new FormControl(this.issue ? this.issue : ''),
      pages: new FormControl(this.pages ? this.pages : ''),
      publisher: new FormControl(this.publisher ? this.publisher : ''),
    });
  }

  onSubmit() {
    if (this.formModel.valid) {
      this.update.emit(this.formModel.value);
    } else {
      this.submitStatus = !this.submitStatus;
    }
  }

  onCancel() {
    this.cancel.emit(false);
  }

}
