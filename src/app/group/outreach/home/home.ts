import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

import {MissionService} from '../../services/mission-service';

import {CreateOutreach, UpdateOutreach, Outreach, OutreachService} from '../../../shared/services/outreach-service';

import {SharedService, Period} from '../../../shared/services/shared-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-outreach',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupOutreachComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private titleService: Title,
              private sharedService: SharedService,
              private outreachService: OutreachService,
              public missionService: MissionService) { }

  streamOutreachs: number[];
  outreachs: Outreach[];

  streamRetrieved: boolean;

  itemFocus: number;
  dragIndex: number;

  outreachNewFlag: boolean = false;
  outreachBuildFlag: boolean = false;
  outreachIndex: number;
  outreachBuild: Outreach;

  fragment: string;

  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  ngOnInit() {
    if (this.missionService.groupId) {
      this.titleService.setTitle('Outreach - ' + this.missionService.groupTitle + ' | Academig');
      this.streamRetrieved = false;
      this.updatePage()

      this.route.fragment.subscribe(fragment => {
        this.fragment = fragment
        this.scrollFunc()
      });
    }
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
           case "add": this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
      } catch (e) { }
    }, 1000);
  }

  async updatePage() {
    this.outreachs = await this.outreachService.getOutreachs(1, this.missionService.groupId, 0);
    this.streamRetrieved = true;
    this.streamOutreachs = new Array(this.outreachs.length).fill(0);
  }

  outreachSlide(flag: boolean, i: number, newFlag: boolean) {
    if (newFlag) {
      this.outreachBuild = null;
    } else {
      this.outreachBuild = this.outreachs[i];
    }

    this.outreachIndex = i;
    this.outreachBuildFlag = flag;
    this.outreachNewFlag = newFlag;
  }

  async outreachUpdate(event) {
    let createOutreach: CreateOutreach;
    let updateOutreach: UpdateOutreach;

    const period: Period = {
      "start": event.start,
      "end": event.end,
      "mode": event.active ? 0 : 2
    };

    if (this.outreachNewFlag == true) {

      createOutreach = {'name': event.title,
                        'link': event.link,
                        'pic': event.pic,
                        'caption': event.caption,
                        'clip': event.clip,
                        'period': period,
                        'location': event.location,
                        'description': event.description,
                        'parentId': this.missionService.groupId,
                        'ai': event.intelligence ? event.intelligence[0] : null
                       };

    } else {

      updateOutreach = {'_id': this.outreachs[this.outreachIndex]._id,
                        'name': event.title,
                        'link': event.link,
                        'pic': event.pic,
                        'caption': event.caption,
                        'clip': event.clip,
                        'period': period,
                        'location': event.location,
                        'description': event.description
                       };
    }

    const outreach: Outreach = {'_id': (this.outreachNewFlag) ? null : this.outreachs[this.outreachIndex]._id,
                                'period': period,
                                'name': event.title,
                                'link': event.link,
                                'pic': event.pic,
                                'caption': event.caption,
                                'clip': event.clip,
                                'location': event.location,
                                'description': event.description,
                                'group': this.missionService.groupIndex,
                                'views': [0, 0, 0, 0, 0],
                                'followStatus': false
                               };

    if (this.outreachNewFlag == true) {

      this.outreachs.push(outreach);
      const loc = this.outreachs.length - 1;

      this.streamOutreachs[loc] = 3;
      this.itemFocus = loc;

      this.outreachs[loc]._id = await this.outreachService.putOutreach(createOutreach, 0);
      this.streamOutreachs[loc] = 1;
      this.missionService.groupProgress[29] = 1;

    } else {

      this.outreachs[this.outreachIndex] = outreach;
      this.streamOutreachs[this.outreachIndex] = 3;

      await this.outreachService.postOutreach(updateOutreach, this.missionService.groupId, 0);
      this.streamOutreachs[this.outreachIndex] = 1;

    }

    this.outreachBuildFlag = false;
  }

  async outreachDelete(i: number) {
    this.itemFocus = null;
    let _id: string

    _id = this.outreachs[i]._id;
    this.streamOutreachs[i] = 3;

    await this.outreachService.deleteOutreach(_id, this.missionService.groupId, 0);

    this.outreachs.splice(i, 1);
    this.streamOutreachs[i] = 0;
    this.missionService.groupProgress[29] = 0;
  }

  // outreachOrder(drag: number, drop: number, bagName: string) {
  //   let itemId: string
  //
  //   if (bagName == 'current-bag') {
  //     this.streamOutreachs[drop] = 3;
  //     itemId = this.outreachs[drag]._id;
  //   }
  //
  //   this.subscriptionOrder = this.groupService.orderItems(this.missionService.groupId, itemId, 0, 2, drag, drop).subscribe(
  //     result => {},
  //     err => this.streamOutreachs[drop] = 2,
  //     () => this.streamOutreachs[drop] = 0
  //   );
  //
  // }

  streamFunc() {
    const loc: number = this.outreachNewFlag ? this.outreachs.length - 1 : this.outreachIndex;
    this.streamOutreachs[loc] = 0;
  }

}
