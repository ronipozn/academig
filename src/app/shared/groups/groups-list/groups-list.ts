import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';

import {Group} from '../../services/group-service';
import {itemsAnimation} from '../../animations/index';

export interface TableData {
  headerRow: string[];
  headerTooltip: string[];
  headerVisible: boolean[];
  headerPlacement: number[];
  // dataRows: TableWithCheckboxes[];
}

@Component({
  selector: 'groups-list',
  templateUrl: 'groups-list.html',
  styleUrls: ['groups-list.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupsListComponent implements OnInit {
  @Input() groups: Group[] = [];
  @Input() groupsPerRow: number;
  @Input() showEditBtn: number;
  @Input() companyFlag: boolean = false;
  @Input() compareFlag: boolean = false;
  @Input() planNumber = 2;
  @Input() sourceType: number; // 0 - Search services
                               // 1 - Current Collaborations
                               // 2 - Group Relations
                               // 3 - Approve Collaborations
                               // 4 - Past Collaborations
                               // 5 - User Site Preview
                               // 6 - Follow Tab
                               // 7 - Department Labs
                               // 8 - Wall
  @Input() stream: number[] = [];
  @Input() streamCompare: number[];
  @Input() follows: boolean[];
  @Input() adminFollows: boolean[][];
  @Input() streamFollow: number[];
  @Input() streamAdminFollow: number[][];
  @Input() streamRetrieved: boolean;
  @Input() compareStatuses: boolean[];

  @Output() buttonEditCollaborationClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonEndCollaborationClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonDeleteCollaborationClick: EventEmitter <number> = new EventEmitter();

  @Output() buttonInterestsClick: EventEmitter <string> = new EventEmitter();
  @Output() buttonCompareClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonFollowClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonAdminFollowClick: EventEmitter <number[]> = new EventEmitter();

  @Output() buttonApproveClick: EventEmitter <number> = new EventEmitter();
  @Output() buttonDeclineClick: EventEmitter <number> = new EventEmitter();

  @Output() animationDoneEvent: EventEmitter <boolean> = new EventEmitter();

  public tableData: TableData;

  previewStatuses: boolean[];

  ngOnInit() {
    this.tableData = {
      // this.companyFlag ? 'Expertise' : 'Interests',
      headerRow: ['', this.companyFlag ? 'Company' : 'Lab', this.companyFlag ? 'Field' : 'Institute', 'Location', ''],
      // this.companyFlag ? 'Expertise': 'Interests',
      headerTooltip: ['', this.companyFlag ? 'Company name' : 'Lab name', this.companyFlag ? 'Field' : 'Institute and Department', 'Country, State and City', null],

      headerVisible: [true, true, true, true, true],
      headerPlacement: [0, 1, 2, 3, null],
    };

    this.previewStatuses = new Array(this.groups.length).fill(false);
  }

  buttonEditCollaborationFunc(index: number): void {
    this.buttonEditCollaborationClick.emit(index);
  }

  buttonEndCollaborationEditFunc(index: number): void {
    this.buttonEndCollaborationClick.emit(index);
  }

  buttonDeleteCollaborationFunc(index: number): void {
    this.buttonDeleteCollaborationClick.emit(index);
  }

  buttonInterestsFunc(event: number, index: number): void {
    this.buttonInterestsClick.emit(this.groups[index].interests[event]);
  }

  buttonFollowFunc(index: number): void {
    this.buttonFollowClick.emit(index);
  }

  buttonCompareFunc(index: number): void {
    this.buttonCompareClick.emit(index);
  }

  buttonAdminFollowFunc(event, index: number): void {
    this.buttonAdminFollowClick.emit([event, index]);
  }

  buttonApproveFunc(index: number): void {
    this.buttonApproveClick.emit(index);
  }

  buttonDeclineFunc(index: number): void {
    this.buttonDeclineClick.emit(index);
  }

  animationDone(): void {
    this.animationDoneEvent.emit(true);
  }

  buttonPreviewFunc(flag: boolean, index: number): void {
    this.previewStatuses = new Array(this.groups.length).fill(false);
    this.previewStatuses[index] = flag;
  }

}
