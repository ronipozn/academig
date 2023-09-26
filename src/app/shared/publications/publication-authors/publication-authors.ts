import {Component, Input, OnInit} from '@angular/core';

import {Publication} from '../../services/publication-service';
import {objectMini} from '../../services/shared-service';

@Component({
  selector: 'publication-authors',
  templateUrl: 'publication-authors.html',
  styleUrls: ['publication-authors.css']
})
export class PublicationAuthorsComponent implements OnInit {
  @Input() authors: objectMini[];
  @Input() userId: string;
  @Input() authorsInitMode: boolean = false;

  authorsShort: objectMini[];
  authorsFlag: boolean = false;

  constructor() { }

  toggleAuthors() {
    this.authorsFlag=!this.authorsFlag;
  }

  ngOnInit() {
    const selfIndex: number = this.authors.findIndex(r => r._id == this.userId)
    this.authorsShort = this.authors.slice(0,4);
    if (selfIndex>3) this.authorsShort.push(this.authors[selfIndex]);
    if (this.authors.length>5) this.authorsShort.push(this.authors[this.authors.length-1]);
    this.authorsFlag = this.authorsInitMode;
  }

}
