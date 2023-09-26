import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// import { PDFProgressData } from 'ng2-pdf-viewer';

import { slideInOutAnimation } from '../../animations/index';

import { UserService } from '../../../user/services/user-service';

@Component({
    selector: 'slide-pdf',
    templateUrl: 'slide-pdf.html',
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' },
    styleUrls: ['slide-pdf.css']

})

export class slidePDFComponent {
  @Input() title: string;
  @Input() fileName: string;
  @Input() type: number; // 0 - default
                         // 1 - used for thumbnail

  @Output() save: EventEmitter <boolean> = new EventEmitter(true);

  progressPDF = 0;

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      public userService: UserService
    ) { }

  cancelButton() {
    this.save.emit(false); ;
  }

  // onProgressPDF(progressData: PDFProgressData) {
  //   this.progressPDF = 100 * progressData.loaded / progressData.total;
  // }

}
