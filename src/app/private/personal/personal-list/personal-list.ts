import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {People} from '../../../shared/services/people-service';
import {PersonalInfo, PrivateService} from '../../../shared/services/private-service';
import {PeopleService} from '../../../shared/services/people-service';
import {UserService} from '../../../user/services/user-service';

import {objectMini, SharedService} from '../../../shared/services/shared-service';

import {itemsAnimation} from '../../../shared/animations/index';

@Component({
  selector: 'private-personal-list',
  templateUrl: 'personal-list.html',
  animations: [itemsAnimation],
  host: { '[@itemsAnimation]': '' }
})
export class PrivatePersonalListComponent implements OnInit {
  @Input() groupId: string;
  @Input() sourceType: number; // 0 - regular, 1 - wall
  @Input() userId: string;

  actives: People[] = [];

  personalInfo: PersonalInfo;
  profileName: string;
  profileId: string;
  profileIndex: number;

  streamRetrieved: boolean[] = [];

  infoBuildFlag = false;
  streamInfo = 0;

  // streamKid: number[];
  // kidUpdateFlag: boolean = false;
  // kidIndex: number;

  constructor(public peopleService: PeopleService,
              public sharedService: SharedService,
              public privateService: PrivateService,
              private userService: UserService,
              private _router: Router) {}

  ngOnInit() {
    this.streamRetrieved = [false, false];
    this.peoplesFunc()
  }

  async peoplesFunc() {
    if (this.streamRetrieved[0] == false) {
      this.actives = await this.peopleService.getPeoples(1, this.groupId, null, 0, 2);
      this.streamRetrieved[0] = true;
      this.changeId(0)
    }
  }

  async changeId(i: number) {
    if (this.actives[i]._id!=this.profileId) {
      this.profileName = this.actives[i].name;
      this.profileId = this.actives[i]._id;
      this.profileIndex = i;
      this.streamRetrieved[1] = false;

      this.personalInfo = await this.privateService.getPersonalInfo(this.actives[i]._id, this.groupId);

      this.streamRetrieved[1] = true;
    }
  }

  async infoOp(mode: number, flag: boolean, event) {
    let info: PersonalInfo;

    this.infoBuildFlag = flag;

    if (mode == 1) {

      this.personalInfo.phone = event.phone
      this.personalInfo.address = event.address
      this.personalInfo.birthday = event.birthday
      this.personalInfo.vacations = event.out

      info = {
              'email': null,
              'phone': event.phone,
              'address': event.address,
              'birthday': event.birthday,
              // "kids": this.personalInfo.kids,
              'kids': null,
              'vacations': event.out
             }

      this.streamInfo = 3;

      await this.privateService.postPersonalInfo(info);

      this.streamInfo = 1;

    } else if (mode == 2) {

      this.streamInfo = 0;

    }

  }

  peopleMessage() {
    const userMessage: People = this.actives[this.profileIndex];

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

  // var kidsCount = event.kids ? event.kids[event.kids.length - 2] : 0;
  // const kidsCount = event.pics.substring(event.pics.lastIndexOf("~") + 1,event.pics.lastIndexOf("/"));
  // var kids: objectMini[] = [];

  // for (var _i = 0; _i < kidsCount; _i++) {
  //   kids[_i] = { "_id": null, "pic": event.kids + 'nth/' + _i + '/', "name": null };
  // }

  // for (let kid of kids) {
  //   this.personalInfo.kids.push(kid);
  // };

  // kidsOp(mode: number, flag: boolean, event, i) {
  //   this.kidUpdateFlag=flag;
  //
  //   if (mode==0) {
  //
  //     this.kidIndex=i;
  //
  //   } if (mode==1) { // delete a single picture

      // const _id: string = this.personalInfo.kids[i]._id;
      // this.streamKid[i]=3;
      //
      // this.subscriptionDeleteKid=this.sharedService.deleteShowcase(3, this.userId, this.userId, _id).subscribe(
      //   result => {},
      //   err => {
      //           this.streamKid[i]=2,
      //           console.log("Can't Delete Kid Pic. Error code: %s, URL: %s, Error: %s, Message: %s", err.status, err.url, err.error, err.message)
      //         },
      //   () => {
      //           this.streamKid[i]=0,
      //           this.personalInfo.kids.splice(i, 1),
      //           console.log('Kid Pic Deleted')
      //         }
      // );

    // } else if (mode==2) { // edit a single picture
      // const kid: objectMini = {
      //                          "_id": this.personalInfo.kids[this.kidIndex]._id,
      //                          "name": event.name,
      //                          "pic": event.pic
      //                         };
      //
      // this.personalInfo.kids[this.kidIndex]=kid;
      // this.streamKid[this.kidIndex]=3;
      //
      // this.subscriptionPostKid=this.sharedService.postShowcase(3, this.userId, this.userId, kid).subscribe(
      //   result => {},
      //   err => {
      //           console.log("Can't Update Kid Pic. Error code: %s, URL: %s, Error: %s, Message: %s", err.status, err.url, err.error, err.message),
      //           this.streamKid[this.kidIndex]=2;
      //         },
      //   () => {
      //           this.streamKid[this.kidIndex]=1;
      //           console.log('Kid Pic Updated')
      //         }
      // );

    // } else if (mode==3) {

      // this.streamKid[this.kidIndex]=0;

  //   }
  //
  // }

}
