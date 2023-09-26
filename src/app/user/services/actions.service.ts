import {Router} from '@angular/router';
import {Injectable} from '@angular/core';

import {PeopleNavBar, CreatePeople, PeopleService} from '../../shared/services/people-service';
import {Invite} from '../../shared/services/shared-service';
import {GroupCompareMini} from '../../shared/services/group-service';

import {UserService} from './user-service';
import {PusherService} from './pusher.service';
import {MessageService} from './message.service';
import {StreamService} from './stream.service';

@Injectable()
export class ActionsService {
  constructor(public router: Router,
              public peopleService: PeopleService,
              public pusherService: PusherService,
              public messageService: MessageService,
              public streamService: StreamService,
              public userService: UserService) {}

  public async userData(profile: any, compare: GroupCompareMini[]) {
    const user = await this.getUserCatches();
    this.userService.userCompareGroups = compare;
    if (user && user._id) {
      this.userPopulate(user);
      this.userEmail(profile.email, profile.email_verified);
      this.userBind(user._id, user.token);
      this.userStage(user.stage, profile.email_verified, user.invites, user.progress[5], user.positions.length)
    } else {
      this.userCreate(profile, compare);
    }
    // this.responseJson = JSON.stringify(response, null, 2).trim();
  }

  public async userCreate(profile: any, compare: GroupCompareMini[]) {
    const createPeople: CreatePeople = {
                                        'oauth_id': profile.sub, // profile.sub.split("|").pop(),
                                        'name': profile.nickname,
                                        'email': profile.email,
                                        'email_verified': profile.email_verified,
                                        'pic': profile.picture,
                                       };

    const data = await this.peopleService.putPeople(createPeople);

    this.userService.userInvites = data.invites ? data.invites : []
    this.userService.userId = data._id;
    this.userService.userName = createPeople.name;
    this.userService.userPic = createPeople.pic;
    this.userService.userProgress = [true,false,false,false,false,false];
    this.userService.userWall = [true, true, true, true];
    this.userService.userPositions = data.positions ? data.positions : [];
    this.userService.userUnseen = 1;
    this.userService.userCompareGroups = compare;

    this.userBind(data._id, null); // data.token
    this.userEmail(profile.email, profile.email_verified);

    this.userService.isAuthenticated = true;
    this.userService.announcePopulate("1");

    this.userNavigate(profile.email_verified, false, data.positions ? data.positions.length : 0);
    // if (profile.email_verified && this.userService.userInvites.length==0) {
    //   this.userService.buildPersonalWebsiteFlag = true;
    //   this.router.navigate(['/build']);
    // }
  }

  public userPopulate(user: PeopleNavBar) {
    this.userService.userId = user._id;
    this.userService.userName = user.name;
    this.userService.userPic = user.pic;
    this.userService.userCoverPic = user.coverPic;
    this.userService.userProgress = user.progress;
    this.userService.userWall = user.wall || [true, true, true, true];
    this.userService.userUnseen = user.unseen;
    this.userService.userSearch = user.search;
    this.userService.userDomain = user.domain;
    this.userService.userEmailVerified = (user.stage == 2); // Personal Email

    this.userService.userFolders = user.folders;
    this.userService.userChallenge = user.challenge;
    if (this.userService.userFolders) {
      const currentFolder: number = user.folders.filter(r=>r.folder=="read").length++;
      if (this.userService.userFolders.findIndex(r=>r.folder=="current")==-1) this.userService.userFolders.unshift({"_id": null, "folder": 'current', "count": 0, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null})
      if (this.userService.userFolders.findIndex(r=>r.folder=="want")==-1) this.userService.userFolders.unshift({"_id": null, "folder": 'want', "count": 0, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null})
      if (this.userService.userFolders.findIndex(r=>r.folder=="read")==-1) this.userService.userFolders.unshift({"_id": null, "folder": 'read', "count": currentFolder, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null})
    } else {
      this.userService.userFolders = [
        {"_id": null, "folder": 'current', "count": 0, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null},
        {"_id": null, "folder": 'want', "count": 0, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null},
        {"_id": null, "folder": 'read', "count": 0, "date": null, "end": null, "summary": null, "privacy": null, "rating": null, "recommend": null, "recommended": null, "feed": null}
      ]
    }

    this.userService.userCompareGroups = user.compare ? user.compare : [];

    this.userService.userFollowings =
      user.followings ? user.followings : {
        institutesIds: [],
        departmentsIds: [],
        groupsIds: [],
        companiesIds: [],
        resourcesIds: [],
        projectsIds: [],
        peoplesIds: [],
        podcastsIds: [],
        eventsIds: [],
        appsIds: [],

        positionsIds:[],
        publicationsIds: []
      };

    // filter duplicate positions in the same group
    this.userService.userPositions = user.positions.reduce((accumulator, current) => {
      if (! accumulator.find(({group}) => group.group._id === current.group.group._id)) {
        accumulator.push(current);
      }
      return accumulator;
    }, []);

    this.userService.userContest = user.contest;

    for (const position of this.userService.userPositions) {
      // if (position.status == 6) {
      if (position.status >= 4 && position.status <= 7) {
        this.userService.userSuperQuantity += 1;
        if (position.mode == 2) this.userService.planFlag = true;
      }
    }
    this.userService.planQuantity = user.quantity ? user.quantity : 0;
    this.userService.planNumber = user.plan ? user.plan : 0;
  };

  public userEmail(email: string, emailVerified: boolean) {
    this.userService.userEmail = email;
    this.userService.userEmailVerified = emailVerified; // Personal Email
  };

  public userBind(userId: string, userToken: string) {
    this.pusherService.initializeNotificationPusher(userId);
    this.pusherService.bindNotifications(userId);
    this.messageService.message_notification(userId);
    this.streamService.initializeStream(userToken);
  };

  public async userStage(stage: number, emailVerified: boolean, invites: Invite[], progressFlag: boolean, positionLength: number) {
    var user: PeopleNavBar;

    if (emailVerified && stage==1) {

      const user = await this.peopleService.postPeopleStage();

      this.userService.userPositions = user.positions.reduce((accumulator, current) => {
        if (! accumulator.find(({group}) => group.group._id === current.group.group._id)) {
          accumulator.push(current);
        }
        return accumulator;
      }, []);

      this.userService.userInvites = user.invites ? user.invites : [];
      this.userNavigate(emailVerified, progressFlag, positionLength);

    } else { // stage==2

      this.userService.userInvites = invites ? invites : [];
      this.userNavigate(emailVerified, progressFlag, positionLength);

    }
  };

  userNavigate(emailVerified: boolean, progressFlag: boolean, positionLength: number) {
    this.userService.isAuthenticated = true;

    const invite: Invite = this.userService.userInvites[0];

    if (emailVerified==true) {
      if (invite && invite.group) {
        this.router.navigate([invite.group.university.link,invite.group.department.link,invite.group.group.link,'people']);
      } else if (progressFlag==false && positionLength==0) {
        this.userService.announcePopulate("1");
        this.userService.buildPersonalWebsiteFlag = true;
        this.router.navigate(['/build']); // if (this.router.url=='/')
      }
    }
  }

  async getUserCatches() {
    try {
      return await this.peopleService.getUser();
    } catch (e) {
      console.error(e);
    } finally {
      // console.log('cleanup');
    }
    // return "Nothing found";
  }

  // public userPlan(email: string, emailVerified: boolean) {
  //   this.userService.userEmail = email;
  //   this.userService.userEmailVerified = emailVerified; // Personal Email
  // };
}
