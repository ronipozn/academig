import {Component, Input} from '@angular/core';

@Component({
    selector: '[tr-details]',
    templateUrl: 'tr-details.html'
})
export class GroupTrDetailsComponent {
  @Input() i: number;
  @Input() userStatus: number;
  @Input() textHeadline: string;
  @Input() textBody: string;

  showButton: boolean[] = [];

  buttonOver(showStatus: boolean, i: number) {
    if (this.userStatus == 6) {
      this.showButton[i] = showStatus;
    }
  }

}
