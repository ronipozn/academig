import {Component, OnInit, Input} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {NewsService} from '../../../shared/services/news-service';
import {SharedService} from '../../../shared/services/shared-service';
import {MissionService} from '../../services/mission-service';

import {ImproveFormDialog} from '../../../shared/modals/modal-improve/modal-improve';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'item-home',
  templateUrl: 'home.html',
  styleUrls: ['home.css']
})
export class HomeComponent implements OnInit {
  streamRetrieved: boolean[];
  items: any;
  newses: any[] = [];

  descriptionBuildFlag: boolean = false;
  locationBuildFlag: boolean = false;
  twitterBuildFlag: boolean = false;

  streamDescription: number;

  shortDescription: string;

  DialogRef: MatDialogRef<ImproveFormDialog>;

  constructor(public missionService: MissionService,
              private newsService: NewsService,
              private sharedService: SharedService,
              private titleService: Title,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<ImproveFormDialog>) { }

  ngOnInit() {
    this.streamRetrieved = [false, false]
    this.updateDetails();
    this.updateNews();
  }

  async updateDetails() {
    // this.titleService.setTitle('Academic App | Academig');
    this.items = await this.sharedService.getHomePage(this.missionService.id, this.missionService.type+4);
    let m;
    const regex = /^.*?[\.!\?](?:\s|$)/;
    if ((m = regex.exec(this.items.description))!==null) this.shortDescription = m[0];

    this.streamRetrieved[0] = true;
  }

  async updateNews() {
    const newses = await this.newsService.getNews(this.missionService.type+6, 0, this.missionService.id);
    if (newses) {
      this.newses.push.apply(this.newses, newses);
      this.streamRetrieved[1] = true;
      if (this.newses[0]==undefined || this.newses[0]==null) this.newses = [];
    } else {
      this.streamRetrieved[1] = true;
    }
  }

  async descriptionOp(mode: number, flag: boolean, event) {
    this.descriptionBuildFlag = flag;

    if (mode == 1) {

      this.streamDescription = 3;
      await this.sharedService.deleteText(this.missionService.id, this.missionService.id, 400);
      this.items.description = null;
      this.streamDescription = 0

    } else if (mode == 2) {

      let m;
      const regex = /^.*?[\.!\?](?:\s|$)/;
      this.items.description = event.text
      if ((m = regex.exec(this.items.background))!==null) this.shortDescription = m[0];

      this.streamDescription = 3;
      await this.sharedService.postText(event.text, this.missionService.id, this.missionService.id, 400);
      this.streamDescription = 1;

    } else if (mode == 3) {

      this.streamDescription = 0;

    }
  }

  async locationOp(mode: number, flag: boolean, event) {
    this.locationBuildFlag = flag;
    if (mode == 2) {
      this.missionService.location = [event.lat, event.lng];
      this.missionService.country = event.country_id;
      this.missionService.state = event.state;
      this.missionService.city = event.city;
      await this.sharedService.updateLocation(this.missionService.type+4, this.missionService.id, event.lat, event.lng, event.country_id, event.state, event.city);
    }
  }

  async twitterOp(mode: number, flag: boolean, event) {
    this.twitterBuildFlag = flag;
    if (mode == 2) {
      this.missionService.socialInfo.twitter = event.text;
      await this.sharedService.updateTwitter(this.missionService.type+4, this.missionService.id, event.text);
    }
  }

  imrpoveFunc() {
    this.DialogRef = this.dialog.open(ImproveFormDialog, {
      data: {
        title: 'title',
        journal: 'this.journal',
        date: 'this.date',
      }
    });

    const dialogSubmitSubscription = this.DialogRef.componentInstance.buttonFeedbackClick.subscribe(improve => {
      this.feedbackOp(improve[0], improve[1])
      dialogSubmitSubscription.unsubscribe();
      this.DialogRef.close();
    });
  }

  async feedbackOp(mode: number, message: string) {
    const plan = await this.sharedService.putLogging(0, this.missionService.id, message);
  }

}
