import {Component, Input} from '@angular/core';

@Component({
  selector: '[build-tr]',
  templateUrl: 'build-tr.html',
  styleUrls: ['build-tr.css']
})
export class GroupBuildTrComponent {
  @Input() userStatus: number;
  @Input() headline: string;

  showButton: boolean[] = [];

  buttonOver(showStatus: boolean, i: number) {
    if (this.userStatus == 6) {
      this.showButton[i] = showStatus;
    }
  }

}
