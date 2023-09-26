import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'publications-buttons',
  templateUrl: 'publications-buttons.html'
})
export class PublicationsButtonsComponent {
  @Input() streamRetrieved: boolean;
  @Input() sourceType: number; // 0 - group, 1 - wall
  @Input() typesData: number[];
  @Input() typesCount: number;

  @Output() typesFlag: EventEmitter <boolean[]> = new EventEmitter(true);

  typesCheck: boolean[] = [true, true, true, true, true, true];
  typesNames: string[] = ['Papers', 'Books', 'Books Chapters', 'Conferences', 'Patents', 'Reports'];

  checkboxFunc(i: number): void {
    this.typesCheck[i] = !this.typesCheck[i];
    this.typesFlag.emit(this.typesCheck);
  }

  // checkboxFunc(element: HTMLInputElement): void {
  //   console.log(`Checkbox ${element.value} was ${element.checked ? '' : 'un'}checked\n`)
  //   this.typesCheck[element.value]=element.checked ? true : false
  //   this.typesFlag.emit(this.typesCheck);
  // }

}
