import {Component, Input, Output, OnChanges} from '@angular/core';


@Component({
  selector: 'group-linksbar',
  templateUrl: 'linksbar.html',
  styleUrls: ['linksbar.css']
})
export class GroupLinksBarComponent implements OnChanges {
  @Input() type: number = 0; // 0 - Group
                             // 1 - Profile
  @Input() activePath: string;
  @Input() progress: boolean[];
  @Input() topics: string[] = [];

  @Input() userStatus: number;
  @Input() visibleFlag: boolean;
  @Input() labFlag: boolean;

  list: string[];
  activeIndex: number;

  ngOnChanges() {
    if (this.type==0) {
      this.list = ['home'];
      // if (this.visibleFlag)
      this.list.push('network');
      if (this.userStatus>=6 || this.topics.length>0 || this.progress[11] || this.progress[12] || this.progress[13]) this.list.push("research-topics");
      if (this.visibleFlag) this.list.push('people');
      this.list.push('publications');
      if (this.userStatus>=6 || this.progress[14] || this.progress[15] || this.progress[16]) this.list.push(this.labFlag ? 'jobs' : 'jobs');
      if (this.userStatus>=6 || this.progress[6] || this.progress[7]) this.list.push('services');
      if ((this.userStatus>=6 || this.progress[28]) && this.labFlag) this.list.push('teaching');
      if (this.userStatus>=6 || this.progress[11] || this.progress[12]) this.list.push('collaborations')
      if ((this.userStatus>=6 || this.progress[13]) && this.labFlag) this.list.push('funding')
      if (this.userStatus>=6 || this.progress[27]) this.list.push('gallery');
      if ((this.userStatus>=6 || this.progress[24]) && this.labFlag) this.list.push('seminars');
      if (this.userStatus>=6 || this.progress[17] || this.progress[18] || this.progress[19]) this.list.push('media');
      if (this.userStatus>=6 || this.progress[20]) this.list.push('faq');
      if (this.visibleFlag) this.list.push('news');
      this.list.push('contact');
    } else {
      this.list = ["home","publications"];
      // if (this.progress[9]) this.list.push(2);
      // if (this.progress[8]) this.list.push(3);
      // if (this.progress[10]) this.list.push(4);
      // if (this.progress[11]) this.list.push(5);
      // if (this.progress[12]) this.list.push(6);
      // if (this.progress[13]) this.list.push(7);
      // this.list.push(8);
      // this.list.push(9);
    }

    this.activeIndex = (this.activePath==null) ? 0 : this.list.findIndex(l => l == this.activePath);
  }

}
