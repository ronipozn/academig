import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';

import {SharedService} from '../../../shared/services/shared-service';
import {MissionService} from '../../services/mission-service';
import {UserService} from '../../../user/services/user-service';
import {positionsPageItems, GroupService} from '../../../shared/services/group-service';
import {titlesTypes, PeopleService} from '../../../shared/services/people-service';
import {OpenPosition, OpenPositionService} from '../../../shared/services/position-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-positions',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupPositionsComponent implements OnInit {
  streamPositions: number[];
  streamPositionsFollow: number[];

  items: positionsPageItems;
  positions: OpenPosition[];

  streamRetrieved: boolean[] = [];
  streamWhyJoin = 0;
  streamDiversity = 0;

  whyJoinBuildFlag: boolean = false;
  diversityBuildFlag: boolean = false;

  titlesTypes = titlesTypes;

  gradesTitles: string[] = ['GPA', 'GRE', 'TOEFL'];
  lettersTitles: string[] = ['Curriculum vitae', 'Letter of motivation', 'Letter of interest', 'Cover letter', 'Project proposal', 'Teaching statement'];

  fragment: string;

  @ViewChild('scrollWhyJoin', { static: false }) private scrollWhyJoin: ElementRef;
  @ViewChild('scrollDiversity', { static: false }) private scrollDiversity: ElementRef;
  @ViewChild('scrollAdd', { static: false }) private scrollAdd: ElementRef;

  constructor(private route: ActivatedRoute,
              private _router: Router,
              public titleService: Title,
              public groupService: GroupService,
              public peopleService: PeopleService,
              public userService: UserService,
              public openPositionService: OpenPositionService,
              public sharedService: SharedService,
              public missionService: MissionService,) {}

  ngOnInit() {
    if (this.missionService.showPage) {
      this.titleService.setTitle('Positions - ' + this.missionService.groupTitle + ' | Academig');
      this.streamRetrieved = [false, false];
      this.updatePage();

      this.route.fragment.subscribe(fragment => {
        this.fragment = fragment
        this.scrollFunc()
      });
    }
  }

  async updatePage() {
    this.items = await this.groupService.getPositionsPageByGroupId(this.missionService.groupId);
    this.streamRetrieved[0] = true;

    this.positions = await this.openPositionService.getPositions(1, this.missionService.groupId);
    this.streamPositions = new Array(this.positions.length).fill(0);
    this.streamPositionsFollow = new Array(this.positions.length).fill(0);
    this.streamRetrieved[1] = true;
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
           case "whyjoin": this.scrollWhyJoin.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
           case "diversity": this.scrollDiversity.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
           case "add": this.scrollAdd.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
      } catch (e) { }
    }, 1000);
  }

  async whyJoinOp(mode: number, flag: boolean, event) {
    this.whyJoinBuildFlag = flag;
    if (mode == 1) {

      this.streamWhyJoin = 3;

      await this.sharedService.deleteText(this.missionService.groupId, this.missionService.groupId, 5);

      this.items.whyJoin = null
      this.streamWhyJoin = 0;
      this.missionService.groupProgress[14] = 0;

    } else if (mode == 2) {

      this.items.whyJoin = event.text
      this.streamWhyJoin = 3;

      await this.sharedService.postText(event.text, this.missionService.groupId, this.missionService.groupId, 5);

      this.streamWhyJoin = 1;
      this.missionService.groupProgress[14] = 1;

    } else if (mode == 3) {

      this.streamWhyJoin = 0;

    }
  }

  async diversityOp(mode: number, flag: boolean, event) {
    this.diversityBuildFlag = flag;
    if (mode == 1) {

      this.streamDiversity = 3;

      await this.sharedService.deleteText(this.missionService.groupId, this.missionService.groupId, 6);

      this.items.diversity = null
      this.streamDiversity = 0;
      this.missionService.groupProgress[15] = 0;

    } else if (mode == 2) {

      this.items.diversity = event.text
      this.streamDiversity = 3;

      await this.sharedService.postText(event.text, this.missionService.groupId, this.missionService.groupId, 6);

      this.streamDiversity = 1;
      this.missionService.groupProgress[15] = 1;

    } else if (mode == 3) {

      this.streamDiversity = 0;

    }
  }

  // async positionFollow(i: number) {
  //   const itemId: string = this.positions[i]._id;
  //   const toFollow: boolean = (this.positions[i].apply[0].status == 1) ? false : true;
  //
  //   this.streamPositionsFollow[i] = 3;
  //
  //   await this.peopleService.toggleFollow(3, 2, itemId, toFollow);
  //
  //   this.positions[i].apply[0].status = toFollow ? 1 : 0;
  //   this.streamPositionsFollow[i] = 0;
  //   this.userService.toggleFollow(toFollow, itemId, "position");
  // }

  streamFunc() {
    this.streamPositions[this.positions.length - 1] = 0;
  }

}
