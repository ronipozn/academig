import {Component, Input, Output, EventEmitter} from '@angular/core';

import {OpenPositionCandidateInfo} from '../../../../services/position-service';

@Component({
  selector: 'position-proposal',
  templateUrl: 'position-proposal.html',
  styleUrls: ['position-proposal.css']
})
export class PositionProposalComponent {
  @Input() proposal: OpenPositionCandidateInfo;
  @Input() tabNum: number;

  @Input() gradesRequired: boolean;
  @Input() lettersRequired: boolean;
  @Input() refereesRequired: boolean;

  @Output() stageClick: EventEmitter <number> = new EventEmitter(true);
  @Output() noteClick: EventEmitter <boolean> = new EventEmitter(true);

  statsusTitles: string[] = ["Rest", "Good", "Best"];
  gradesTitles: string[] = ['GPA', 'GRE', 'TOEFL'];
  lettersTitles: string[] = ['Curriculum vitae', 'Letter of motivation', 'Letter of interest', 'Cover letter', 'Project proposal', 'Teaching statement'];

  // async ngOnInit() {
  //   console.log('ppp',this.proposal)
  // }

  stageOp(i: number) {
    this.stageClick.emit(i);
  }

  noteOp() {
    this.noteClick.emit(true);
  }

}
