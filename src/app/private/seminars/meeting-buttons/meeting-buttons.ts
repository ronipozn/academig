import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'private-meeting-buttons',
  templateUrl: 'meeting-buttons.html'
})
export class PrivateMeetingButtonsComponent {
  @Input() type: number = 0;
  @Input() editFlag: boolean;
  @Input() activeFlag: boolean;
  @Input() disabledFlag: boolean;

  @Output() buttonClick: EventEmitter <number> = new EventEmitter(true);

  buttonFunc(i: number): void {
    this.buttonClick.emit(i);
  }

}
