import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {AdminService} from '../../../shared/services/admin-service';
import {OpenPosition} from '../../../shared/services/position-service';
import {titlesTypes} from '../../../shared/services/people-service';

import * as moment from 'moment';

@Component({
    selector: 'position-item',
    templateUrl: 'item.html',
    styleUrls: ['item.css']
})

export class PositionItemComponent implements OnInit {
  projId: string;
  streamRetrieved: boolean;
  position: OpenPosition;

  titlesTypes = titlesTypes;
  statsChannels = ["Organic", "Facebook", "Twitter", "Linkedin", "Slack", "Newsletter"];
  filterTypes = ["Rest", "Good", "Best"];
  typeSelect = ["Full-time", "Part-time", "Contract", "Internship", "Volunteer"];
  feedbackSelect: string[] = ["Search Engine", "Social Media (Facebook, Twitter, Linkedin, etc.)", "Friend or Co-worker", "Podcast", "Email", "Website", "Blog", "Conference or Trade-show", "Other"];

  streamStatus: boolean;
  streamFilter: boolean;

  streamNote: boolean;
  noteFlag: boolean;
  noteIndex: number;
  note: string;

  streamAddStats: number;

  streamStats: number;
  statsFlag: boolean;
  statIndex: number[] = [0,0];
  statMode: number;

  statsLen : number;
  statAddFlag: boolean;

  @ViewChild('toggleNoteModal', { static: true }) toggleNote: ElementRef;

  moment: any = moment;

  constructor(private route: ActivatedRoute,
              private adminService: AdminService) { }

  async ngOnInit() {
    this.projId = this.route.snapshot.params['positionId'];
    this.streamRetrieved = false;
    this.position = await this.adminService.getPositionDetails(this.projId);

    const statsLen: number = this.position.stats.length;
    const statAddFlag: boolean = this.moment().isAfter(this.moment(this.position.created_on).add(statsLen*2, 'weeks'));

    this.streamRetrieved = true;
  }

  async noteOp(i: number, flag: boolean, mode: number) {
    this.noteFlag = flag;
    this.toggleNote.nativeElement.click();

    if (mode==2) {

      this.streamNote = true;
      this.position.apply[this.noteIndex].filter = this.note;
      await this.adminService.postCandidateFilterNote(this.projId, this.position.apply[this.noteIndex].id, this.note);
      this.streamNote = false;

    } else if (mode==0) {

      this.noteIndex = i;
      this.note = this.position.apply[i].filter;

    }
  }

  async statusOp(i: number) {
    this.streamStatus = true;
    await this.adminService.postCandidateFilterStatus(this.projId, this.position.apply[i].id, this.position.apply[i].filterStatus);
    this.streamStatus = false;
  }

  async filterOp(i: number) {
    this.streamFilter = true;
    this.position.apply.forEach((apply, index) => {
      if (apply.filterStatus>=11 && apply.filterStatus<=13) {
        apply.status = apply.filterStatus;
        apply.filterStatus = 0;
      }
    });
    await this.adminService.postPositionFilter(this.projId, i);
    this.streamFilter = false;
  }

  async statsAddOp(mode: number, flag: boolean, stats: number[][]) {
    this.statsFlag = flag;
    this.statMode = 0;

    if (mode==2) {
      this.streamAddStats = 3;
      this.position.stats.push(stats);
      await this.adminService.putPositionStat(this.projId, stats);
      this.streamAddStats = 0;
    }
  }

  async statsUpdateOp(index:number[], mode: number, flag: boolean, stat: number[]) {
    this.statsFlag = flag;
    this.statMode = 1;

    if (mode==2) {
      this.streamStats = 3;
      this.position.stats[this.statIndex[0]][this.statIndex[1]] = stat;
      await this.adminService.postPositionStat(this.projId, this.statIndex, stat);
      this.streamStats = 0;
    } else if (mode==0) {
      this.statIndex = index;
    }
  }

}
