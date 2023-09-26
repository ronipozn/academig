import { Component, OnInit, Input} from '@angular/core';

@Component({
    selector: 'group-columns',
    templateUrl: 'group-columns.html',
    styleUrls: ['group-columns.css']
})

export class GroupColumnsComponent implements OnInit {
  @Input() mode: number;
  @Input() group: any;
  @Input() sourceType: number;

  topicModified: string = null;

  ngOnInit() {
    if (this.mode==4) {
      this.topicModified = this.group.topic ? this.group.topic.join(', ') : null
      // .split(',').join(', ')
    }
  }
}
