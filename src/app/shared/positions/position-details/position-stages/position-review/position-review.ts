import {Component, Input, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {OpenPositionCandidateInfo, OpenPositionService} from '../../../../services/position-service';

import {itemsAnimation} from '../../../../animations/index';

import * as moment from 'moment';

@Component({
  selector: 'position-review',
  templateUrl: 'position-review.html',
  animations: [itemsAnimation],
  styleUrls: ['position-review.css']
})
export class PositionReviewComponent implements OnInit {
  @Input() parentId: string;
  @Input() projId: string;
  @Input() created_on: string;
  @Input() filterFlag: boolean;

  @Input() gradesRequired: boolean;
  @Input() lettersRequired: boolean;
  @Input() refereesRequired: boolean;

  proposals: OpenPositionCandidateInfo[][] = [[]];
  proposalsFiltered: OpenPositionCandidateInfo[][] = [[]];

  streamRetrieved: boolean;
  streamCandidate: number;

  candidatesFlag: boolean;

  noteFlag: boolean;
  noteIndex: number;
  note: string;

  tabNum: number = 0;

  filterDates: string[] = [];
  filterIntervals = [-1,7,14,30,60];

  emptyHeadlines: string[] = ['Proposals','Shortlisted','','Waitlist','Archived'];
  emptyTitles: string[] = [
    'The candidates proposals list is empty.',
    'The candidates shortlist is empty.',
    '',
    'The waitlist is empty.',
    'The archive list empty.'
  ];

  fragment: string;
  activeTab: number;

  moment: any = moment;

  @ViewChild('toggleNoteModal', { static: true }) toggleNote: ElementRef;

  constructor(private route: ActivatedRoute,
              private openPositionService: OpenPositionService) {}

  async ngOnInit() {
    this.streamRetrieved = false;

    const candidates: OpenPositionCandidateInfo[] = await this.openPositionService.getPositionCandidates(this.projId, this.parentId);

    if (candidates) {
      for (let i = 0; i < 5; i++) {
        this.proposals[i] = candidates.filter(r => r.stage==i); // this.proposals[0] = candidates.filter(r => (r.stage==0 || r.stage==null));
      }
      if (this.filterFlag==true) {
        for (let i = 0; i < 4; i++) {
          this.filterDates[i] = moment(this.created_on).add(this.filterIntervals[i+1], 'days').format("DD MMM YYYY");
          this.proposalsFiltered[i] = this.proposals[0].filter(r =>
            moment(r.date[0]).isBetween(moment().add(this.filterIntervals[i], 'days'), moment().add(this.filterIntervals[i+1], 'days'), null, '[]')
          );
          this.proposalsFiltered[i].sort(function (a, b) {
            return a.status - b.status;
          });
        }
      }
      this.candidatesFlag = true;
    } else {
      this.candidatesFlag = false;
    }

    // console.log('this.proposals',this.proposals)
    // console.log('this.proposalsFiltered',this.proposalsFiltered)

    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment
      this.fragmentFunc()
    });

    this.streamRetrieved = true;
  }

  fragmentFunc() {
    switch (this.fragment) {
      case "candidates": this.activeTab = 0; break;
      case "shortlisted": this.activeTab = 1; break;
      // messaged: 2
      case "waitlist": this.activeTab = 3; break;
      case "archived": this.activeTab = 4; break;
      default: this.activeTab = 0; break;
    }
    this.tabClick(this.activeTab);
  }

  async stageOp(i: number, newStage: number) {
    this.streamCandidate = 3;
    await this.openPositionService.postCandidateStage(this.projId, this.proposals[this.tabNum][i].profile._id, newStage);
    this.streamCandidate = 0;
    this.proposals[newStage].push(this.proposals[this.tabNum][i]);
    this.proposals[this.tabNum].splice(i, 1);
  }

  async stageFilterOp(i: number, p: number, newStage: number) {
    this.streamCandidate = 3;
    await this.openPositionService.postCandidateStage(this.projId, this.proposalsFiltered[i][p].profile._id, newStage);
    this.streamCandidate = 0;
    this.proposals[newStage].push(this.proposalsFiltered[i][p]);
    this.proposalsFiltered[i].splice(p, 1);
  }

  async noteOp(i: number, flag: boolean, mode: number) {
    this.noteFlag = flag;
    this.toggleNote.nativeElement.click();

    if (mode==2) {

      this.streamCandidate = 3;
      this.proposals[this.tabNum][this.noteIndex].note = this.note;
      await this.openPositionService.postCandidateNote(this.projId, this.proposals[this.tabNum][this.noteIndex].profile._id, this.note);
      this.streamCandidate = 0;

    } else if (mode==0) {

      this.noteIndex = i;
      this.note = this.proposals[this.tabNum][i].note;

    }
  }

  tabClick(i: number) {
    this.tabNum = i;
  }

}
