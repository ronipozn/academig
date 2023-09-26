import {Component, Input} from '@angular/core';

@Component({
    selector: 'people-assist',
    templateUrl: 'assist.html',
    styleUrls: ['assist.css']
})
export class PeopleAssistComponent {
  @Input() source: number;
}
