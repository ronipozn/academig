import {Component, Input} from '@angular/core';

@Component({
    selector: 'single-pic',
    templateUrl: 'single-pic.html',
    styleUrls: ['single-pic.css']
})
export class SinglePicComponent {
  @Input() pic: string;

  @Input() width: number;
  @Input() height: number;
  @Input() widthE: number;
  @Input() heightE: number;

  @Input() hoverFlag = false;
  @Input() selectFlag = false;
  @Input() centerFlag = false;
  @Input() maxSizeFlag = true;

  @Input() fluidFlag = false;
  @Input() thumbnailFlag = false;
  @Input() type = 0;

  @Input() stack = false;
  @Input() stackColor: string;
  @Input() stackPic: string;

  // htmlVariable: string;
  // var radius = (this.type==0) ? 'r_max' : ((this.type==1) ? 'r_5' : 'r_0');
  // + '/h_' + this.height + ',c_limit'

  updateUrl(e) {
    this.pic="./assets/img/user-circle-o.png";
  }
}
