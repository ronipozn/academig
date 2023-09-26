import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {DatePipe} from '@angular/common';
import {Router, ActivatedRoute} from '@angular/router';

import {SharedService} from '../../../shared/services/shared-service';
import {MissionService} from '../../services/mission-service';
import {peoplesPageItems, GroupService} from '../../../shared/services/group-service';
import {People, Position, PositionMini, Education, CreateMember, UpdateMember, CreatePosition, UpdatePosition, PeopleService} from '../../../shared/services/people-service';
import {Period, objectMini} from '../../../shared/services/shared-service';

import {UserService} from '../../../user/services/user-service';
import {PusherService} from '../../../user/services/pusher.service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'group-people',
  templateUrl: 'home.html',
  styleUrls: ['home.css'],
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class GroupPeopleComponent implements OnInit, OnDestroy {
  items: peoplesPageItems;

  streamRetrieved: boolean[] = [];

  activesCounterPointer: number[] = [];
  // visitorsCounterPointer: number[] = [];
  alumnisCounterPointer: number[] = [];

  actives: People[];
  visitors: People[];
  alumnis: People[];

  streamActive: number[];
  streamVisitor: number[];
  streamAlumni: number[];
  streamVisitUs = 0;

  streamActiveFollow: number[];
  streamVisitorFollow: number[];
  streamAlumniFollow: number[];

  activeTab: number;
  tabAdd: string[] = ['Member', 'Visitor', 'Alumni'];
  tabJoin: string[] = ['as member', 'as visitor', 'as alumni'];
  tabReJoin: string[] = ['Rejoin', 'Join as visitor', 'Add alumni position'];

  itemFocus: number;

  visitBuildFlag: boolean = false;

  labFlag: boolean = true;

  peopleBuildFlag = false;
  peopleTypeFlag = 0;
  peopleIndex: number;
  peopleCategory: number;
  positionIndex: number;
  people: People;

  fragment: string;

  @ViewChild('scrollInvite', { static: false }) private scrollInvite: ElementRef;

  constructor(public titleService: Title,
              public groupService: GroupService,
              public peopleService: PeopleService,
              public sharedService: SharedService,
              public missionService: MissionService,
              public userService: UserService,
              public pusherService: PusherService,
              private datepipe: DatePipe,
              private activatedRoute: ActivatedRoute,
              private _router: Router) {}

  ngOnInit() {
    if (this.missionService.groupId) {

      if (this.missionService.userId) this.notifications();

      this.titleService.setTitle('People - ' + this.missionService.groupTitle + ' | Academig');

      this.streamRetrieved = [false, false, false, false];

      this.activeTab = 0;

      this.labFlag = !(this.missionService.onBehalf==4 || this.missionService.onBehalf==5 || this.missionService.onBehalf==7);

      this.updatePage();
      this.peoplesFunc(0);
      this.peoplesFunc(2);

      this.activatedRoute.fragment.subscribe(fragment => {
        this.fragment = fragment
        this.scrollFunc()
      });
    }
  }

  scrollFunc() {
    setTimeout(() => {
      try {
        switch (this.fragment) {
           case "invite": this.scrollInvite.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" }); break;
        }
      } catch (e) { }
    }, 1000);
  }

  async updatePage() {
    this.items = await this.groupService.getPeoplesPageByGroupId(this.missionService.groupId);
    this.activesCounterPointer = [];
    this.alumnisCounterPointer = [];
    this.activesCounterPointer = this.counterPointerFunc(this.items.activesIds);
    this.alumnisCounterPointer = this.counterPointerFunc(this.items.alumniIds);
    this.streamRetrieved[3] = true;
  }

  ngOnDestroy() {
    // if (this.userService.userId) this.pusherService.notificationsChannel.unbind();
  }

  peoplesTab(tabNum: number): void {
    this.activeTab = tabNum;
    this.updatePage();
    this.peoplesFunc(tabNum);
  };

  async peoplesFunc(tabNum: number) {
    const data = await this.peopleService.getPeoples(1, this.missionService.groupId, null, tabNum, 3);

    if (data) {
      if (tabNum == 0) {
        this.actives = data;
        this.streamActive = new Array(this.actives.length).fill(0);
        this.streamActiveFollow = new Array(this.actives.length).fill(0);
      } else if (tabNum == 1) {
        this.visitors = data;
        this.streamVisitor = new Array(this.visitors.length).fill(0);
        this.streamVisitorFollow = new Array(this.visitors.length).fill(0);
      } else if (tabNum == 2) {
        this.alumnis = data;
        this.streamAlumni = new Array(this.alumnis.length).fill(0);
        this.streamAlumniFollow = new Array(this.alumnis.length).fill(0);
      }
    } else {
      if (tabNum == 0) {
        this.actives = [];
      } else if (tabNum == 1) {
        this.visitors = [];
      } else if (tabNum == 2) {
        this.alumnis = [];
      }
    }

    this.streamRetrieved[tabNum] = true;
  }

  counterPointerFunc(r: number[]): number[] {
    const counterPointer: number [] = [0]

    r.forEach((item, index) => {
      counterPointer[index + 1] = counterPointer[index] + item;
    });

    return counterPointer
  }

  async visitOp(mode: number, flag: boolean, event) {
    this.visitBuildFlag = flag;
    if (mode == 1) {

      this.streamVisitUs = 3;

      await this.sharedService.deleteText(this.missionService.groupId, this.missionService.groupId, 1);

      this.items.visitUs = null
      this.streamVisitUs = 0;

    } else if (mode == 2) {

      this.items.visitUs = event.text
      this.streamVisitUs = 3;

      await this.sharedService.postText(event.text, this.missionService.groupId, this.missionService.groupId, 1);

      this.streamVisitUs = 1;

    } else if (mode == 3) {

      this.streamVisitUs = 0;

    }
  }

  peopleSlide(flag: boolean, index: number, category: number, tab: number, typeFlag: number) {

    if (typeFlag == 0) {
      this.people = null;
    } else {
      if (tab == 0) {
        this.people = this.actives[this.activesCounterPointer[category] + index];
        this.peopleIndex = this.activesCounterPointer[category] + index;
      } else if (tab == 1) {
        this.people = this.visitors[index];
        this.peopleIndex = index;
      } else if (tab == 2) {
        this.people = this.alumnis[this.alumnisCounterPointer[category] + index];
        this.peopleIndex = this.alumnisCounterPointer[category] + index;
      }
    };

    this.peopleCategory = category;
    this.peopleBuildFlag = flag;
    this.peopleTypeFlag = typeFlag;

  }

  positionSlide(flag: boolean, index: number[], category: number, tab: number, typeFlag: number) {
    if (typeFlag == 0) {
      this.people = null;
    } else {
      if (tab == 0) {
        this.people = this.actives[this.activesCounterPointer[category] + index[0]];
        this.peopleIndex = this.activesCounterPointer[category] + index[0];
      } else if (tab == 1) {
        this.people = this.visitors[index[0]];
        this.peopleIndex = index[0];
      } else if (tab == 2) {
        this.people = this.alumnis[this.alumnisCounterPointer[category] + index[0]];
        this.peopleIndex = this.alumnisCounterPointer[category] + index[0];
      }
    }

    this.peopleCategory = category;
    this.positionIndex = index[1]
    this.peopleBuildFlag = flag;
    this.peopleTypeFlag = typeFlag;
  }

  async peopleUpdate(event) {
    this.peopleBuildFlag = false;

    let id: string;
    let name: string;
    let pic: string;
    let stage: number;

    let status: number;
    let titles: number;

    if (this.peopleTypeFlag == 0 || // Add (Admin)
        this.peopleTypeFlag == 2 || // Join (User)
        this.peopleTypeFlag == 3    // Rejoin (User)
       ) {

      if (this.activeTab == 0) {
        status = 4 + event.privilage;
        titles = event.titles;
      } else if (this.activeTab == 1) {
        status = 3;
        titles = null;
      } else if (this.activeTab == 2) {
        status = 2;
        titles = event.titles;
      };

      if (this.peopleTypeFlag == 0) { // ADD
        if (event.member._id) {
          id = event.member._id; // ID of invited user
          name = event.member.name;
          pic = event.member.pic;
          stage = 2;
        } else {
          id =  null; // indicate non-existent user ('0' ???)
          name = event.member
          pic = event.pic;
          stage = 0;
        }
      } else if (this.peopleTypeFlag == 2 || this.peopleTypeFlag == 3) { // JOIN or ReJOIN
        id = this.userService.userId;
        name = this.userService.userName;
        pic = this.userService.userPic;
        stage = 2;
        this.missionService.userStatus = status;
        this.missionService.userStatusMode = 0;
      };

      const addPeople: People = {'_id': id,
                                 'name': name,
                                 'stage': stage,
                                 'pic': pic,
                                 'progress': [false, false, false, false],
                                 'email': event.email,
                                 'positions': [{
                                                '_id': null,
                                                'status': status,
                                                'mode': (this.peopleTypeFlag == 2 || this.peopleTypeFlag == 3) ? 4 : 0,
                                                'period': new Period(
                                                                     event.start,
                                                                     event.end,
                                                                     (this.activeTab == 0) ? 1 : 0
                                                                    ),
                                                'titles': [titles],
                                                'stage': 2,
                                                'group': this.missionService.groupIndex,
                                                'text': event.text,
                                                'degree': null
                                             }],
                                 'followStatus': false,
                                 'views': null,
                                 'followedSize': null,
                                 'publicationsSize': null,
                                 'currentSize': null,
                                 'quote': null,
                                 'currentReading': null
                                };

      const createMember: CreateMember = {'_id': id,
                                          'name': name,
                                          'pic': pic,
                                          'email': event.email,
                                          'mode': (this.peopleTypeFlag == 2 || this.peopleTypeFlag == 3) ? 4 : 0,
                                          'status': status,
                                          'titles': [titles],
                                          'text': event.text,
                                          'period': new Period(
                                                               event.start,
                                                               event.end,
                                                               (this.activeTab == 0) ? 1 : 0
                                                              ),
                                          'group': null,
                                          'groupId': this.missionService.groupId,
                                          'degree': {
                                                     'field': event.field,
                                                     'honor': event.honor,
                                                     'thesis': event.thesisTitle,
                                                     'grade': event.thesisGrade,
                                                     'file': event.thesisFile
                                                   },

                                          'ai': event.intelligence ? event.intelligence[0] : null
                                         };

      if (this.activeTab == 0) {

        const c = Math.floor(titles / 100);  // +0 because of PI category
        const insertCurrentIndex = this.activesCounterPointer[c + 1];
        this.actives.splice(insertCurrentIndex, 0, addPeople)
        this.items.activesIds[c]++;

        if (id == this.userService.userId) {
          this.userService.userPositions.push({
                                               'coverPic': null,
                                               'titles': this.actives[insertCurrentIndex].positions[0].titles,
                                               'status': this.actives[insertCurrentIndex].positions[0].status,
                                               'mode': this.actives[insertCurrentIndex].positions[0].mode,
                                               'group': this.actives[insertCurrentIndex].positions[0].group,
                                               'period': this.actives[insertCurrentIndex].positions[0].period,
                                               'email': {'address': null, 'updated': null, 'stage': 2},
                                               'contest': null
                                             });
        }

        for (let _j = (c + 1); _j < 6; _j++) {
          this.activesCounterPointer[_j]++;
        }

        const insertNewIndex = this.activesCounterPointer[c + 1] - 1;
        this.streamActive[insertNewIndex] = 3;
        this.itemFocus = insertNewIndex;
        this.peopleIndex = insertNewIndex;

        const positionId: string = await this.peopleService.putMember(createMember, this.missionService.groupId, 0);

        this.actives[insertNewIndex]._id = positionId;
        this.missionService.groupProgress[4] = 1;
        this.streamActive[insertNewIndex] = 1;

      } else if (this.activeTab == 1) {

        this.visitors.push(addPeople);
        const loc = this.visitors.length - 1;

        this.streamVisitor[loc] = 3;
        this.streamVisitorFollow[loc] = 0;

        this.itemFocus = loc;

        await this.peopleService.putMember(createMember, this.missionService.groupId, 1);

        this.streamVisitor[loc] = 1;

      } else if (this.activeTab == 2) {

        const c = Math.floor(titles / 100) - 1;  // -1 because of PI category
        const insertCurrentIndex = this.alumnisCounterPointer[c + 1];

        this.alumnis.splice(insertCurrentIndex, 0, addPeople)
        this.items.alumniIds[c]++;

        for (let _j = (c + 1); _j < 5; _j++) {
          this.alumnisCounterPointer[_j]++;
        }

        // const insertNewIndex = this.alumnisCounterPointer[c] - 1;
        const insertNewIndex = this.alumnisCounterPointer[c + 1] - 1;
        this.streamAlumni[insertNewIndex] = 3;
        this.itemFocus = insertNewIndex;
        this.peopleIndex = insertNewIndex;

        const positionId: string = await this.peopleService.putMember(createMember, this.missionService.groupId, 2);

        this.alumnis[insertNewIndex]._id = positionId;
        this.missionService.groupProgress[4] = 1;
        this.streamAlumni[insertNewIndex] = 1;

      }

    } else if (this.peopleTypeFlag == 1 || this.peopleTypeFlag == 9) {
      // Update Privilage / Background / Pic (for stage==false)
      // Update Email

      if (this.activeTab == 0) {

        id = this.actives[this.peopleIndex]._id;
        this.streamActive[this.peopleIndex] = 3;

        if (this.peopleTypeFlag == 1) {
          if (this.actives[this.peopleIndex].positions[0].status!=6 && this.actives[this.peopleIndex].positions[0].status!=7) {
            this.actives[this.peopleIndex].positions[0].status = event.privilage + 4;
          };
          this.actives[this.peopleIndex].positions[0].text = event.text;
          if (event.pic) this.actives[this.peopleIndex].pic = event.pic;
        } else {
          this.actives[this.peopleIndex].email = event.email;
        }

      } else if (this.activeTab == 1) {

        id = this.visitors[this.peopleIndex]._id;
        this.streamVisitor[this.peopleIndex] = 3;

        if (event.pic) this.visitors[this.peopleIndex].pic = event.pic;

      } else if (this.activeTab == 2) {

        id = this.alumnis[this.peopleIndex]._id;
        this.streamAlumni[this.peopleIndex] = 3;

        if (this.peopleTypeFlag == 1) {
          this.alumnis[this.peopleIndex].positions[0].status = event.privilage + 4;
          this.alumnis[this.peopleIndex].positions[0].text = event.text;
          if (event.pic) this.alumnis[this.peopleIndex].pic = event.pic;
        } else {
          this.alumnis[this.peopleIndex].email = event.email;
        }

      };

      await this.peopleService.postMember(this.missionService.groupId,
                                          this.activeTab,
                                          (this.peopleTypeFlag==1) ? 0 : 4,
                                          id,
                                          (this.activeTab == 0) ? this.actives[this.peopleIndex].positions[0].status : this.alumnis[this.peopleIndex].positions[0].status,
                                          (this.peopleTypeFlag==1) ? event.text : event.email,
                                          event.pic);

      if (this.activeTab == 0) {
        this.streamActive[this.peopleIndex] = 0;
      } else if (this.activeTab == 1) {
        this.streamVisitor[this.peopleIndex] = 0;
      } else if (this.activeTab == 2) {
        this.streamAlumni[this.peopleIndex] = 0;
      };

    } else if (this.peopleTypeFlag == 4 || this.peopleTypeFlag == 8) { // Delete or Move a Member or Position

      if (this.activeTab == 0) { // Delete Member / Position, Move Member / Position to Alumni

        const alumniCount: number = this.actives[this.peopleIndex].positions.filter(r => r.period.mode == 0).length;
        const positionsCount: number = this.actives[this.peopleIndex].positions.length;

        const moveFlag: boolean =
          this.actives[this.peopleIndex].positions[this.positionIndex].period.mode >= 1 && // Active position
          (alumniCount == (positionsCount - 1)); // All other positions are Alumni

        if (this.peopleTypeFlag == 4) {
          if (positionsCount == 1) { // Delete Member
            this.peopleMove(this.peopleIndex, this.peopleCategory, (this.missionService.userStatus < 6) ? 3 : 2, 1, null);
          } else if (moveFlag) { // Delete Position && Move Member to Alumni
            this.positionDelete(this.peopleIndex, this.positionIndex, 0, null);
            this.peopleMove(this.peopleIndex, this.peopleCategory, (this.missionService.userStatus < 6) ? 3 : 2, 0, event.end);
          } else { // Delete Position
            this.positionDelete(this.peopleIndex, this.positionIndex, 0, null);
          }
        } else if (this.peopleTypeFlag == 8) {
          if (moveFlag) { // Move Member to Alumni
            this.peopleMove(this.peopleIndex, this.peopleCategory, (this.missionService.userStatus < 6) ? 3 : 2, 0, event.end);
          } else { // Move Position to Alumni
            this.positionDelete(this.peopleIndex, this.positionIndex, 1, event.end);
          }
        };

      } else if (this.activeTab == 1) {

      } else if (this.activeTab == 2) {

        if (this.alumnis[this.peopleIndex].positions.length == 1) { // Delete Member
          this.peopleMove(this.peopleIndex, this.peopleCategory, (this.missionService.userStatus < 6) ? 3 : 2, 1, null);
        } else { // Delete Position
          this.positionDelete(this.peopleIndex, this.positionIndex, 0, null)
        }

      };

    } else if (this.peopleTypeFlag == 5) { // Cancel Request
      this.peopleMove(this.peopleIndex, this.peopleCategory, (this.missionService.userStatus < 6) ? 3 : 2, (this.activeTab == 0) ? event.endRelation : 1, null);

    } else if (this.peopleTypeFlag == 6) { // Add Position
      const position: Education = ({'_id': null,
                                   'status': (this.activeTab == 0) ? this.actives[this.peopleIndex].positions[0].status : this.alumnis[this.peopleIndex].positions[0].status,
                                   'mode': 2,
                                   'period': new Period(event.start,
                                                        event.end,
                                                        event.end ? 0 : 1),
                                   'titles': [event.titles],
                                   'stage': 2,
                                   'group': this.missionService.groupIndex,
                                   'text': (this.activeTab == 0) ? this.actives[this.peopleIndex].positions[0].text : this.alumnis[this.peopleIndex].positions[0].text,
                                   'degree': null
                                 });

      const createPosition: CreatePosition = ({'status': position.status,
                                               'mode': 2,
                                               'period': position.period,
                                               'titles': position.titles,
                                               'groupId': this.missionService.groupId,
                                               'text': position.text,
                                               'degree': {
                                                          'field': event.field,
                                                          'honor': event.honor,
                                                          'thesis': event.thesisTitle,
                                                          'grade': event.thesisGrade,
                                                          'file': event.thesisFile
                                                         }
                                             });

      if (this.activeTab == 0) {
        id = this.actives[this.peopleIndex]._id;
        this.streamActive[this.peopleIndex] = 3;
        this.actives[this.peopleIndex].positions.unshift(position);

      } else if (this.activeTab == 1) {
        id = this.visitors[this.peopleIndex]._id;
        this.streamVisitor[this.peopleIndex] = 3;

      } else if (this.activeTab == 2) {
        id = this.alumnis[this.peopleIndex]._id;
        this.streamAlumni[this.peopleIndex] = 3;
        this.alumnis[this.peopleIndex].positions.unshift(position);

        if (!event.end) { // move to Actives
          this.peopleMove(this.peopleIndex, this.peopleCategory, (this.missionService.userStatus < 6) ? 3 : 2, 2, null);
        }
      };

      const position_id = await this.peopleService.putPosition(createPosition, id);

      if (this.activeTab == 0) {
        this.actives[this.peopleIndex].positions[0]._id = position_id;
        this.streamActive[this.peopleIndex] = 0;
      } else if (this.activeTab == 1) {
        this.visitors[this.peopleIndex].positions[0]._id = position_id;
        this.streamVisitor[this.peopleIndex] = 0;
      } else if (this.activeTab == 2) {
        this.alumnis[this.peopleIndex].positions[0]._id = position_id;
        this.streamAlumni[this.peopleIndex] = 0;
      }

    } else if (this.peopleTypeFlag == 7) { // Update position (can't induce Move Active <-> Alumni)
      let positionId: string;

      if (this.activeTab == 0) {
        id = this.actives[this.peopleIndex]._id;
        positionId = this.actives[this.peopleIndex].positions[this.positionIndex]._id;
      } else if (this.activeTab == 1) {
        id = this.visitors[this.peopleIndex]._id;
        positionId = this.visitors[this.peopleIndex].positions[this.positionIndex]._id;
      } else if (this.activeTab == 2) {
        id = this.alumnis[this.peopleIndex]._id;
        positionId = this.alumnis[this.peopleIndex].positions[this.positionIndex]._id;
      };

      const updatePosition: UpdatePosition = {'_id': id,
                                              'positionId': positionId,
                                              'titles': [event.titles],
                                              'index': null,
                                              'oldCategory': null,
                                              'newCategory': null,
                                              'period': new Period(
                                                                   event.start,
                                                                   event.end,
                                                                   event.end ? 0 : 1
                                                                  ),
                                              'degree': {
                                                         'field': event.field,
                                                         'honor': event.honor,
                                                         'thesis': event.thesisTitle,
                                                         'grade': event.thesisGrade,
                                                         'file': event.thesisFile
                                                        }
                                             };

      var insertCurrentIndex;

      if (this.activeTab == 0) {
        // var activeIndex = event.positions.findIndex(r => r.present[0]==true);
        // const c = Math.floor(event.positions[activeIndex].titles/100); // Find Active placement

        const c = (this.positionIndex == 0 && this.peopleCategory>0) ? Math.floor(event.titles / 100) : this.peopleCategory;
        insertCurrentIndex = this.activesCounterPointer[c + 1];

        this.actives[this.peopleIndex].positions[this.positionIndex].titles = updatePosition.titles;
        this.actives[this.peopleIndex].positions[this.positionIndex].period = updatePosition.period;

        if (c != this.peopleCategory) {
          // Create new
          this.actives.splice(insertCurrentIndex, 0, this.actives[this.peopleIndex])
          this.items.activesIds[c]++;

          for (let _j = (c + 1); _j < 6; _j++) {
            this.activesCounterPointer[_j]++;
          }

          // Delete old
          this.peopleIndex += (this.peopleCategory > c) ? 1 : 0;
          this.actives.splice(this.peopleIndex, 1)
          this.items.activesIds[this.peopleCategory]--;

          for (let _j = (this.peopleCategory + 1); _j < 6; _j++) {
            this.activesCounterPointer[_j]--;
          }

          this.peopleIndex = insertCurrentIndex - ((this.peopleCategory < c) ? 1 : 0);
        };

        this.streamActive[this.peopleIndex] = 3;

        updatePosition.index = this.peopleIndex;
        updatePosition.oldCategory = this.peopleCategory;
        updatePosition.newCategory = c;

      } else if (this.activeTab == 1) {
         this.streamVisitor[this.peopleIndex] = 3;
         this.streamVisitorFollow[this.peopleIndex] = 0;

      } else if (this.activeTab == 2) {

        const c = Math.floor(event.titles / 100) - 1;
        insertCurrentIndex = this.alumnisCounterPointer[c];

        this.alumnis[this.peopleIndex].positions[this.positionIndex].titles = updatePosition.titles;
        this.alumnis[this.peopleIndex].positions[this.positionIndex].period = updatePosition.period;

        if (c != this.peopleCategory) {
          // Create new
          this.alumnis.splice(insertCurrentIndex, 0, this.alumnis[this.peopleIndex])
          this.items.alumniIds[c]++;

          for (let _j = c + 1; _j < 5; _j++) {
            this.alumnisCounterPointer[_j]++;
          }

          // Delete old
          this.peopleIndex += (this.peopleCategory > c) ? 1 : 0;

          this.alumnis.splice(this.peopleIndex, 1)
          this.items.alumniIds[this.peopleCategory]--;

          for (let _j = this.peopleCategory + 1; _j < 5; _j++) {
            this.alumnisCounterPointer[_j]--;
          }

          this.peopleIndex = insertCurrentIndex - ((this.peopleCategory < c) ? 1 : 0);
        };

        this.streamAlumni[this.peopleIndex] = 3;

        updatePosition.index = this.peopleIndex;
        updatePosition.oldCategory = this.peopleCategory;
        updatePosition.newCategory = c;
      }

      await this.peopleService.postPosition(updatePosition, this.missionService.groupId, this.activeTab);

      this.streamActive[this.peopleIndex] = 1;

    }

  }

  async invitePost(i: number, c: number, mode: number) { // c - category
                                                         // i - index
                                                         // mode - 1 - Resend Request (User) / Resend Invite (Admin)
                                                         //        3 - Accept Invite (User) / Accept Request (Admin)

    this.itemFocus = null;
    let _id: string
    let updateIndex: number

    if (this.activeTab == 0) {
      updateIndex = this.activesCounterPointer[c] + i;
      _id = this.actives[updateIndex]._id;
      this.streamActive[updateIndex] = 3;

    } else if (this.activeTab == 1) {
      _id = this.visitors[i]._id;
      this.streamVisitor[i] = 3;

    } else if (this.activeTab == 2) {
      updateIndex = this.alumnisCounterPointer[c] + i;
      _id = this.alumnis[updateIndex]._id;
      this.streamAlumni[updateIndex] = 3;
    };

    await this.peopleService.postMember(this.missionService.groupId, this.activeTab, mode, _id, 0, '', '');

    // Notice that only positions[0] exists for mode==1 or mode==3
    if (this.activeTab == 0) {
      this.streamActive[updateIndex] = 0;
      if (mode == 3) {
        this.actives[updateIndex].positions[0].mode = 2;
        if (this.missionService.userId == this.actives[updateIndex]._id) {

          this.missionService.userStatusMode = 2;

          this.userService.userInvites = this.userService.userInvites.filter(r => r.group.group._id!=this.missionService.groupId)

          this.missionService.showEditBtn = (
                                             (this.missionService.userStatus == 5 || this.missionService.userStatus == 6 || this.missionService.userStatus == 7) && this.missionService.userStatusMode==2 &&
                                             (this.missionService.groupStage == 0 || this.missionService.groupStage == 1 || this.missionService.groupStage == 2 || this.missionService.groupStage == 7)
                                            );

          this.missionService.showHeadline = (this.missionService.userStatus == 5 || this.missionService.userStatus == 6 || this.missionService.userStatus == 7) && this.missionService.userStatusMode==2;

          const positionIndex = this.userService.userPositions.findIndex(r => r.group.group._id==this.missionService.groupId);

          const userPosition: PositionMini = {
                                              'coverPic': null,
                                              'titles': this.actives[updateIndex].positions[0].titles,
                                              'status': this.actives[updateIndex].positions[0].status,
                                              'mode': this.actives[updateIndex].positions[0].mode,
                                              'group': this.actives[updateIndex].positions[0].group,
                                              'period': this.actives[updateIndex].positions[0].period,
                                              'email': {'address': null, 'updated': null, 'stage': 2},
                                              'contest': null
                                             };

          if (positionIndex>-1) {
            this.userService.userPositions[positionIndex].mode=2;
          } else {
            this.userService.userPositions.push(userPosition);
          }

        }
      }
    } else if (this.activeTab == 1) {
      this.streamVisitor[updateIndex] = 0;
      if (mode == 3) { this.visitors[updateIndex].positions[0].mode == 2; }
    } else if (this.activeTab == 2) {
      this.streamAlumni[updateIndex] = 0;
      if (mode == 3) {
        this.alumnis[updateIndex].positions[0].mode = 2;
        if (this.missionService.userId == this.alumnis[updateIndex]._id) {
          this.userService.userInvites = this.userService.userInvites.filter(r => r.group.group._id!=this.missionService.groupId)
        }
      }
    };
  }

  peopleDecline(i: number, c: number, mode: number, action: number) {
    if (this.activeTab==0) {
      const deleteIndex: number = (mode < 2) ? this.activesCounterPointer[c] + i : i;

      if (this.actives[deleteIndex].positions[0].status==6) {
        this._router.navigate(['./../settings/delete-lab'], { relativeTo: this.activatedRoute });
      } else {
        this.peopleMove(i, c, mode, action, null)
      }

    } else {
      this.peopleMove(i, c, mode, action, null)
    }

  }

  async peopleMove(i: number, c: number, mode: number, action: number, end: Date) {
    // c - category
    // i - index
    // mode - 0 - Cancel invite by Admin
    //            Cancel request by User
    //        1 - Decline invite by User
    //            Decline request by Admin
    //        2 - End Relation by Admin
    //        3 - End Relation by User
    // action - 0 - move to Alumni
    //          1 - delete from Group
    //          2 - move to Active

    this.itemFocus = null;
    let _id: string
    let deleteIndex: number
    let insertIndex: number;

    if (this.activeTab == 0) {
      deleteIndex = (mode < 2) ? this.activesCounterPointer[c] + i : i;
      insertIndex = this.alumnisCounterPointer[c - 1];

      _id = this.actives[deleteIndex]._id;
      this.streamActive[deleteIndex] = 3;

    } else if (this.activeTab == 1) {
      _id = this.visitors[i]._id;
      this.streamVisitor[i] = 3;

    } else if (this.activeTab == 2) {
      deleteIndex = (mode < 2) ? this.alumnisCounterPointer[c] + i : i;
      insertIndex = this.activesCounterPointer[c + 1];

      _id = this.alumnis[deleteIndex]._id;
      this.streamAlumni[deleteIndex] = 3;
    };

    await this.peopleService.moveMember(_id, c, insertIndex, this.missionService.groupId, this.activeTab, mode, action, end);

    if (_id == this.userService.userId) {
      if (this.missionService.userStatus<6) {
        const deleteFromGroupFlag: boolean = (mode == 0 || mode == 1 || action==1);
        this.missionService.userStatus = deleteFromGroupFlag ? 0 : ((action == 0) ? 2 : 4);
        this.missionService.userStatusMode = deleteFromGroupFlag ? 1 : 2;
      }
      if (mode==0) this.userService.userInvites = this.userService.userInvites.filter(r => r.group.group._id!=this.missionService.groupId)
    };

    if (this.activeTab == 0) {

      if (action == 0 && mode > 1) {
        this.alumnis.splice(insertIndex, 0, this.actives[deleteIndex])
        this.alumnis[insertIndex].positions[0].period.mode = 0;
        this.alumnis[insertIndex].positions[0].period.end = new Date();
        this.alumnis[insertIndex].positions[0].status = 2;
        this.streamAlumniFollow[insertIndex] = 0;
        this.streamAlumni[insertIndex] = 0;
        this.items.alumniIds[c - 1]++;

        for (let _j = (c); _j < 5; _j++) {
          this.alumnisCounterPointer[_j]++;
        }
      }

      if (action < 2 && _id == this.userService.userId) {
        this.userService.userPositions = this.userService.userPositions.filter(r => r.group.group._id! != this.missionService.groupId);
      }

      this.actives.splice(deleteIndex, 1)
      this.items.activesIds[c]--;
      this.streamActive[deleteIndex] = 0;

      for (let _j = c + 1; _j < 6; _j++) {
        this.activesCounterPointer[_j]--;
      }

    } else if (this.activeTab == 1) {
      this.visitors.splice(i, 1)
      this.streamVisitor[i] = 0;

    } else if (this.activeTab == 2) {

      if (action == 2 && mode > 1) {
        this.actives.splice(insertIndex, 0, this.alumnis[deleteIndex])
        this.actives[insertIndex].positions[0].period.mode = 0;
        this.actives[insertIndex].positions[0].period.end = new Date();
        this.actives[insertIndex].positions[0].status = 2;
        this.streamActiveFollow[insertIndex] = 0;
        this.streamActive[insertIndex] = 0;
        this.items.activesIds[c - 1]++;

        for (let _j = (c + 1); _j < 6; _j++) {
          this.activesCounterPointer[_j]++;
        }

        if (this.missionService.userId == this.actives[insertIndex]._id) {
          this.userService.userPositions.push({
                                               'coverPic': null,
                                               'titles': this.actives[insertIndex].positions[0].titles,
                                               'status': this.actives[insertIndex].positions[0].status,
                                               'mode': this.actives[insertIndex].positions[0].mode,
                                               'group': this.actives[insertIndex].positions[0].group,
                                               'period': this.actives[insertIndex].positions[0].period,
                                               'email': {'address': null, 'updated': null, 'stage': 2},
                                               'contest': null
                                             });
          }
      }

      this.alumnis.splice(deleteIndex, 1)
      this.items.alumniIds[c]--;
      this.streamAlumni[deleteIndex] = 0;

      for (let _j = c + 1; _j < 5; _j++) {
        this.alumnisCounterPointer[_j]--;
      }

    };
  }

  async positionDelete(peopleIndex: number, positionIndex: number, mode: number, end: Date) { // mode - 0 - Delete position
                                                                                        //        1 - Turn position to Alumni

    this.itemFocus = null;
    let _id: string
    let positionId: string

    if (this.activeTab == 0) {
       _id = this.actives[peopleIndex]._id;
       positionId = this.actives[peopleIndex].positions[positionIndex]._id;
       this.streamActive[peopleIndex] = 3;

    } else if (this.activeTab == 1) {
       _id = this.visitors[peopleIndex]._id;
       this.streamVisitor[peopleIndex] = 3;

    } else if (this.activeTab == 2) {
       _id = this.alumnis[peopleIndex]._id;
       positionId = this.alumnis[peopleIndex].positions[positionIndex]._id;
       this.streamAlumni[peopleIndex] = 3;
    };


    await this.peopleService.deletePosition(positionId, _id, this.missionService.groupId, mode, end);

    if (this.activeTab == 0) {
      if (mode == 0) {
        this.actives[peopleIndex].positions.splice(positionIndex, 1);
      } else {
        this.actives[peopleIndex].positions[positionIndex].period.mode = 0;
        this.actives[peopleIndex].positions[positionIndex].period.end = end;
      }
      this.streamActive[peopleIndex] = 0;

    } else if (this.activeTab == 1) {

    } else if (this.activeTab == 2) {
      this.alumnis[peopleIndex].positions.splice(positionIndex, 1);
      this.streamAlumni[peopleIndex] = 0;
    };
  }

  async peopleFollow(i: number, c: number) {
    let followIndex: number
    let _id: string
    let toFollow: boolean;

    if (this.activeTab == 0) {
      followIndex = this.activesCounterPointer[c] + i;
      _id = this.actives[followIndex]._id;
      toFollow = !this.actives[followIndex].followStatus;
      this.streamActiveFollow[followIndex] = 3;
    } else if (this.activeTab == 1) {
      _id = this.visitors[i]._id;
      toFollow = !this.visitors[i].followStatus;
      this.streamVisitorFollow[i] = 3;
    } else if (this.activeTab == 2) {
      followIndex = this.alumnisCounterPointer[c] + i;
      _id = this.alumnis[followIndex]._id;
      toFollow = !this.alumnis[followIndex].followStatus;
      this.streamAlumniFollow[followIndex] = 3;
    };

    await this.peopleService.toggleFollow(9, 0, _id, toFollow);
    this.userService.toggleFollow(toFollow, _id, "people");
    if (this.activeTab == 0) {
      this.actives[followIndex].followStatus = toFollow;
      this.streamActiveFollow[followIndex] = 0;
    } else if (this.activeTab == 1) {
      this.visitors[i].followStatus = toFollow;
      this.streamVisitorFollow[i] = 0;
    } else if (this.activeTab == 2) {
      this.alumnis[followIndex].followStatus = toFollow;
      this.streamAlumniFollow[followIndex] = 0;
    };
  }

  peopleMessage(i: number, c: number) {
    let peopleIndex: number
    let userMessage: People;

    if (this.activeTab == 0) {
      peopleIndex = this.activesCounterPointer[c] + i;
      userMessage = this.actives[peopleIndex];
    } else if (this.activeTab == 1) {
      userMessage = this.visitors[peopleIndex];
    } else if (this.activeTab == 2) {
      peopleIndex = this.alumnisCounterPointer[c] + i;
      userMessage = this.alumnis[peopleIndex];
    };

    this.userService.newChannel = {
                                 _id: null,
                                 block: 0,
                                 usersIds: [userMessage._id],
                                 users: [userMessage],
                                 unread: 0,
                                 type: 0,
                                 message: {_id: null,
                                           type: null,
                                           userId: null,
                                           text: null,
                                           file: null,
                                           date: null
                                          }
                                };
    this._router.navigate(['/messages']);
  }

  streamFunc() {
    if (this.activeTab == 0) {
      this.streamActive[this.peopleIndex] = 0;
    } else if (this.activeTab == 1) {
      this.streamVisitor[this.peopleIndex] = 0;
    } else if (this.activeTab == 2) {
      this.streamAlumni[this.peopleIndex] = 0;
    }
  }

  public notifications() {
    this.pusherService.notificationsChannel.bind('notifications', data => {

      // console.log('data.verb', data.verb, data.actor, this.userService.userId)

      if (Math.floor(data.verb / 1000) == 4 ||
          data.verb == 5101 ||
          data.verb == 5201 ||
          data.verb == 5100 ||
          data.verb == 5200 ||
          data.verb == 5300) {
        this.updatePage();
        this.peoplesFunc(0);
        this.peoplesFunc(2);
      };

      if (data.verb == 4003 || data.verb == 4103 || data.verb == 4501 || data.verb == 4601) {
        this.missionService.userStatus = 0;
        this.userService.userPositions = this.userService.userPositions.filter(r => r.group.group._id! != this.missionService.groupId);
      } else if (data.verb == 4500 || data.verb == 4600) {
        this.missionService.userStatus = 4;
      } else if (data.verb == 4503) {
        this.missionService.userStatusMode = 2;
      } else if (data.verb == 4003) {
        this.missionService.userStatusMode = 3;
      };

      if (this.userService.userId == data.actor) {

        if (data.verb == 5300) {
          this.missionService.userStatus = 0;
        } else if (data.verb == 5101) {
          this.missionService.userStatus = 4;
        } else if (data.verb == 5201) {
          this.missionService.userStatus = 2;
        }

        if (this.missionService.userStatus < 4) {
          this.userService.userPositions = this.userService.userPositions.filter(r => r.group.group._id! != this.missionService.groupId);
        }

      }
    });
  }

}
