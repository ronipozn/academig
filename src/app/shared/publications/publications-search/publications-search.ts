import {Component, Input} from '@angular/core';

@Component({
  selector: 'publications-search',
  templateUrl: 'publications-search.html'
})
export class PublicationsSearchComponent {
  @Input() streamRetrieved: boolean;
  @Input() sourceType: number; // 0 - group, 1 - wall
  @Input() typesDataSum: number;
}
