import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { slideInOutAnimation } from '../../../../shared/animations/index';

@Component({
    selector: 'build-slide-add',
    templateUrl: 'build-slide-add.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['build-slide-add.css']
})

export class BuildSlideAddComponent implements OnInit {
  @Input() mode: number;
  @Output() cancel: EventEmitter <boolean> = new EventEmitter(true);

  title: string[] = ["Profile", "Lab", "Department", "University"];
  site: string[] = ["Your", "Lab", "Department", "University"];

  ngOnInit() { }

  onCancel() {
    this.cancel.emit(false);
  }

}
